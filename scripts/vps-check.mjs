import { Client } from "ssh2";

const password = process.env.VPS_PASSWORD;
if (!password) {
  console.error("VPS_PASSWORD requis");
  process.exit(1);
}

const conn = new Client();
conn
  .on("ready", () => {
    conn.exec(
      `docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
echo "---"
test -d /opt/capo && ls /opt/capo || echo "no /opt/capo"`,
      (err, stream) => {
        if (err) throw err;
        stream.on("data", (d) => process.stdout.write(d));
        stream.stderr.on("data", (d) => process.stderr.write(d));
        stream.on("close", () => conn.end());
      }
    );
  })
  .on("error", (e) => {
    console.error("SSH:", e.message);
    process.exit(1);
  })
  .connect({
    host: process.env.VPS_HOST || "51.255.200.11",
    port: 22,
    username: process.env.VPS_USER || "root",
    password,
    readyTimeout: 20000,
  });
