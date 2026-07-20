#!/usr/bin/env node
/**
 * Corrige la config Coolify CAPO (projet CAPO uniquement) et lance un deploy Dockerfile.
 *
 * Usage :
 *   $env:COOLIFY_TOKEN='...'
 *   node scripts/coolify-fix-deploy.mjs
 */
const COOLIFY_URL = (process.env.COOLIFY_URL || "http://51.255.200.11:8000").replace(
  /\/$/,
  ""
);
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN;
const APP_UUID =
  process.env.COOLIFY_APP_UUID || "t13kzxjdw7jzvip57w31g0oq";
const DB_UUID = process.env.COOLIFY_DB_UUID || "b9ov14gfcvc95uf0kpp3mvuj";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://51.255.200.11:3002";
const SSLIP_DOMAIN =
  process.env.COOLIFY_SSLIP_DOMAIN ||
  "http://t13kzxjdw7jzvip57w31g0oq.51.255.200.11.sslip.io";

const DB_HOST = process.env.COOLIFY_DB_HOST || "b9ov14gfcvc95uf0kpp3mvuj";

if (!COOLIFY_TOKEN) {
  console.error("COOLIFY_TOKEN requis.");
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
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function syncEnvs(appUuid) {
  const existing = await api("GET", `/applications/${appUuid}/envs`);
  const prod = existing.filter((e) => !e.is_preview);

  const values = {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      `postgresql://capo:CapoDb2026Secure!@${DB_HOST}:5432/capo`,
    JWT_SECRET:
      process.env.JWT_SECRET || "capo-jwt-prod-xK9mN2pQ7vR4sT8wL1yZ6",
    NEXT_PUBLIC_APP_URL: APP_URL,
    SEED_DB: "false",
    NODE_ENV: "production",
    UPLOADS_DIR: "/data/capo-uploads",
  };

  const buildtimeKeys = new Set(["NEXT_PUBLIC_APP_URL"]);

  const data = prod
    .filter((e) => values[e.key] !== undefined || e.key === "NIXPACKS_NODE_VERSION")
    .map((e) => {
      if (e.key === "NIXPACKS_NODE_VERSION") {
        return null;
      }
      return {
        uuid: e.uuid,
        key: e.key,
        value: values[e.key],
        is_preview: false,
        is_runtime: true,
        is_buildtime: buildtimeKeys.has(e.key),
        is_literal: true,
      };
    })
    .filter(Boolean);

  if (data.length === 0) {
    console.log("  aucune variable prod a synchroniser");
    return;
  }

  await api("PATCH", `/applications/${appUuid}/envs/bulk`, { data });
  for (const row of data) {
    console.log(`  env ${row.key} (build=${row.is_buildtime})`);
  }
}

async function waitDeploy(deploymentUuid, appUuid) {
  for (let i = 1; i <= 80; i++) {
    await new Promise((r) => setTimeout(r, 15000));
    const d = await api("GET", `/deployments/${deploymentUuid}`);
    const app = await api("GET", `/applications/${appUuid}`);
    console.log(
      `[${i}] deploy=${d.status} commit=${(d.commit || "").slice(0, 8)} app=${app.status}`
    );
    if (d.status === "finished") {
      console.log("\nDeploy SUCCESS");
      return true;
    }
    if (d.status === "failed") {
      console.error("\nDeploy FAILED — voir Coolify > Deployments > logs");
      return false;
    }
  }
  console.warn("Timeout en attente du deploy.");
  return false;
}

async function main() {
  console.log("==> CAPO uniquement :", APP_UUID);
  await api("GET", "/health");

  const app = await api("GET", `/applications/${APP_UUID}`);
  if (app.name !== "capo-app" || app.git_repository !== "Trh10/capo") {
    throw new Error("Refus : ce UUID ne correspond pas a capo-app");
  }
  console.log("   statut actuel:", app.status);

  console.log("==> Dockerfile + options...");
  await api("PATCH", `/applications/${APP_UUID}`, {
    build_pack: "dockerfile",
    dockerfile_location: "/Dockerfile",
    install_command: "",
    build_command: "",
    start_command: "",
    is_static: false,
    publish_directory: null,
    ports_exposes: "3000",
    ports_mappings: "3002:3000",
    domains: `${APP_URL},${SSLIP_DOMAIN}`,
    health_check_enabled: true,
    health_check_path: "/",
    health_check_port: "3000",
    health_check_start_period: 120,
    health_check_retries: 15,
    health_check_interval: 10,
    git_branch: "main",
    custom_docker_run_options: "",
  });

  console.log("==> Variables prod...");
  await syncEnvs(APP_UUID);

  console.log("==> PostgreSQL capo-db...");
  await fetch(`${COOLIFY_URL}/api/v1/databases/${DB_UUID}/start`, { headers });

  console.log("==> Deploy...");
  const dep = await api("GET", `/deploy?uuid=${APP_UUID}&force=true`);
  const deploymentUuid = dep.deployments?.[0]?.deployment_uuid;
  console.log("   uuid:", deploymentUuid);

  if (deploymentUuid) {
    await waitDeploy(deploymentUuid, APP_UUID);
  }

  const r = await fetch(APP_URL, { redirect: "follow" });
  console.log("HTTP", APP_URL, "->", r.status);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
