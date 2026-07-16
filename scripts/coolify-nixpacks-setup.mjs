const COOLIFY_URL = "http://51.255.200.11:8000";
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN;
const APP_UUID = "feyg812v5mq8x9cqwi702qb9";

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
  const res = await fetch(`${COOLIFY_URL}/api/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

const envVars = [
  {
    key: "DATABASE_URL",
    value: "postgresql://capo:CapoDb2026Secure!@capo-db:5432/capo",
    is_buildtime: false,
  },
  { key: "JWT_SECRET", value: "capo-jwt-prod-xK9mN2pQ7vR4sT8wL1yZ6", is_buildtime: false },
  {
    key: "NEXT_PUBLIC_APP_URL",
    value: "http://51.255.200.11:3002",
    is_buildtime: true,
  },
  { key: "SEED_DB", value: "true", is_buildtime: false },
  { key: "NODE_ENV", value: "production", is_buildtime: false },
  { key: "NIXPACKS_NODE_VERSION", value: "20", is_buildtime: true },
];

async function main() {
  console.log("==> Configuration application Nixpacks...");
  await api("PATCH", `/applications/${APP_UUID}`, {
    build_pack: "nixpacks",
    is_static: false,
    publish_directory: null,
    ports_exposes: "3000",
    ports_mappings: "3002:3000",
    domains: "http://51.255.200.11:3002,http://feyg812v5mq8x9cqwi702qb9.51.255.200.11.sslip.io",
    health_check_enabled: true,
    health_check_path: "/",
    health_check_port: "3000",
    health_check_start_period: 60,
    health_check_retries: 10,
    health_check_interval: 10,
  });

  console.log("==> Variables d'environnement...");
  for (const v of envVars) {
    try {
      await api("POST", `/applications/${APP_UUID}/envs`, {
        key: v.key,
        value: v.value,
        is_preview: false,
        is_build_time: v.is_buildtime,
        is_literal: true,
      });
    } catch (e) {
      console.warn(`Env ${v.key}:`, e.message);
    }
  }

  console.log("==> Demarrage base capo-db...");
  await fetch(`${COOLIFY_URL}/api/v1/databases/b9ov14gfcvc95uf0kpp3mvuj/start`, { headers });

  console.log("==> Deploiement force...");
  const dep = await api("GET", `/deploy?uuid=${APP_UUID}&force=true`);
  const deploymentUuid = dep.deployments?.[0]?.deployment_uuid;
  console.log("Deployment:", deploymentUuid);

  if (!deploymentUuid) return;

  for (let i = 1; i <= 40; i++) {
    await new Promise((r) => setTimeout(r, 15000));
    const d = await api("GET", `/deployments/${deploymentUuid}`);
    const app = await api("GET", `/applications/${APP_UUID}`);
    console.log(`[${i}] deploy=${d.status} app=${app.status}`);
    if (d.status === "finished" && app.status?.includes("running")) break;
    if (d.status === "failed") {
      console.error("Deploy failed");
      break;
    }
  }

  try {
    const r = await fetch("http://51.255.200.11:3002", { redirect: "follow" });
    console.log("HTTP 3002:", r.status);
  } catch (e) {
    console.log("HTTP 3002:", e.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
