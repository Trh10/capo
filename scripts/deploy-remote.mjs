import { Client } from "ssh2";
import { createReadStream, existsSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const host = process.env.VPS_HOST || "51.255.200.11";
const username = process.env.VPS_USER || "root";
const password = process.env.VPS_PASSWORD;
const deployDir = process.env.DEPLOY_DIR || "/opt/capo";

if (!password) {
  console.error("VPS_PASSWORD requis");
  process.exit(1);
}

const archive = join(tmpdir(), "capo-deploy.tar.gz");
console.log("==> Archive du projet...");
execSync(
  `tar --exclude=node_modules --exclude=.next --exclude=.git --exclude=prisma/dev.db --exclude=.env -czf "${archive}" .`,
  { cwd: root, stdio: "inherit" }
);

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = "";
      stream
        .on("close", (code) => (code === 0 ? resolve(out) : reject(new Error(`Exit ${code}: ${out}`))))
        .on("data", (d) => {
          process.stdout.write(d);
          out += d;
        })
        .stderr.on("data", (d) => process.stderr.write(d));
    });
  });
}

function upload(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const read = createReadStream(localPath);
      const write = sftp.createWriteStream(remotePath);
      write.on("close", resolve);
      write.on("error", reject);
      read.pipe(write);
    });
  });
}

const conn = new Client();
conn
  .on("ready", async () => {
    try {
      console.log(`==> Connexion OK — deploiement dans ${deployDir}`);
      await exec(conn, `mkdir -p ${deployDir}`);
      await upload(conn, archive, `${deployDir}/capo-deploy.tar.gz`);
      await exec(
        conn,
        `cd ${deployDir} && tar -xzf capo-deploy.tar.gz && rm capo-deploy.tar.gz && ` +
          `(test -f .env || cp .env.production.example .env) && ` +
          `docker compose down 2>/dev/null || true && ` +
          `docker compose up -d --build && docker compose ps && ` +
          `echo "CAPO: http://${host}:3002"`
      );
      console.log("==> Deploiement termine.");
      conn.end();
    } catch (e) {
      console.error(e);
      conn.end();
      process.exit(1);
    }
  })
  .connect({ host, port: 22, username, password, readyTimeout: 30000 });
