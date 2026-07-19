import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const COOLIFY_URL = "http://51.255.200.11:8000";
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN;
const PROJECT_UUID = "j12l9toalolxkbpqgsnm7fzw";
const SERVER_UUID = "r1103w6hjcrc8jf1lbyo2mrz";
const DEST_UUID = "iwg4cww3bdyt00pe41zc4jll";
const GITHUB_APP_UUID = "yqu9d83iu2sq4dnwxz7hn9ue";
const DB_UUID = "b9ov14gfcvc95uf0kpp3mvuj";

if (!COOLIFY_TOKEN) {
  console.error("COOLIFY_TOKEN requis");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${COOLIFY_TOKEN}`,
  Accept: "application/json",
  "Content-Type": "application/json",
};

async function api(method, path, body) {
  const res = await fetch(`${COOLIFY_URL}/api/v1${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function main() {
  console.log("==> Demarrage base capo-db...");
  await fetch(`${COOLIFY_URL}/api/v1/databases/${DB_UUID}/start`, { headers });

  console.log("==> Creation application CAPO depuis GitHub...");
  let app;
  const apps = await api("GET", "/applications");
  app = apps.find((a) => a.git_repository === "Trh10/capo" || a.name?.includes("capo"));

  if (!app) {
    app = await api("POST", "/applications/private-github-app", {
      name: "capo-app",
      description: "CAPO Next.js",
      project_uuid: PROJECT_UUID,
      environment_name: "production",
      server_uuid: SERVER_UUID,
      destination_uuid: DEST_UUID,
      github_app_uuid: GITHUB_APP_UUID,
      git_repository: "Trh10/capo",
      git_branch: "main",
      build_pack: "dockerfile",
      dockerfile_location: "/Dockerfile",
      ports_exposes: "3000",
      ports_mappings: "3002:3000",
      fqdn: "http://51.255.200.11:3002",
    });
  }

  const appUuid = app.uuid;
  console.log("==> App uuid:", appUuid);

  const envVars = [
    { key: "DATABASE_URL", value: "postgresql://capo:CapoDb2026Secure!@capo-db:5432/capo" },
    { key: "JWT_SECRET", value: "capo-jwt-prod-xK9mN2pQ7vR4sT8wL1yZ6" },
    { key: "NEXT_PUBLIC_APP_URL", value: "http://51.255.200.11:3002" },
    { key: "SEED_DB", value: "true" },
    { key: "NODE_ENV", value: "production" },
    { key: "UPLOADS_DIR", value: "/data/capo-uploads" },
  ];

  for (const v of envVars) {
    try {
      await api("POST", `/applications/${appUuid}/envs`, {
        key: v.key,
        value: v.value,
        is_preview: false,
        is_build_time: v.key.startsWith("NEXT_PUBLIC"),
        is_literal: true,
      });
    } catch (e) {
      console.warn("Env", v.key, "-", e.message);
    }
  }

  console.log("==> Deploiement...");
  await api("GET", `/deploy?uuid=${appUuid}&force=false`);

  console.log("\nCAPO en cours de deploiement sur http://51.255.200.11:3002");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
