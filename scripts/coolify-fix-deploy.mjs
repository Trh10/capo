#!/usr/bin/env node
/**
 * Corrige la config Coolify CAPO et lance un deploy fiable (Dockerfile).
 *
 * Prérequis : token API Coolify
 *   Coolify > Security > API Tokens > + Add
 *
 * Usage :
 *   $env:COOLIFY_TOKEN="votre_token"
 *   node scripts/coolify-fix-deploy.mjs
 */
const COOLIFY_URL = (process.env.COOLIFY_URL || "http://51.255.200.11:8000").replace(
  /\/$/,
  ""
);
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN;
/** UUID de capo-app (logs deploy Coolify) */
const APP_UUID =
  process.env.COOLIFY_APP_UUID || "t13kzxjdw7jzvip57w31g0oq";
const DB_UUID = process.env.COOLIFY_DB_UUID || "b9ov14gfcvc95uf0kpp3mvuj";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://51.255.200.11:3002";
const SSLIP_DOMAIN =
  process.env.COOLIFY_SSLIP_DOMAIN ||
  "http://t13kzxjdw7jzvip57w31g0oq.51.255.200.11.sslip.io";

if (!COOLIFY_TOKEN) {
  console.error("COOLIFY_TOKEN requis.");
  console.error("Coolify > Security > API Tokens > + Add");
  console.error('Puis : $env:COOLIFY_TOKEN="..." ; node scripts/coolify-fix-deploy.mjs');
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

/** Variables : build-time uniquement si nécessaire au build Docker/Next */
const ENV_SPECS = [
  {
    key: "DATABASE_URL",
    value:
      process.env.DATABASE_URL ||
      "postgresql://capo:CapoDb2026Secure!@capo-db:5432/capo",
    is_build_time: false,
  },
  {
    key: "JWT_SECRET",
    value: process.env.JWT_SECRET || "capo-jwt-prod-xK9mN2pQ7vR4sT8wL1yZ6",
    is_build_time: false,
  },
  {
    key: "NEXT_PUBLIC_APP_URL",
    value: APP_URL,
    is_build_time: true,
  },
  { key: "SEED_DB", value: "false", is_build_time: false },
  { key: "NODE_ENV", value: "production", is_build_time: false },
  { key: "UPLOADS_DIR", value: "/data/capo-uploads", is_build_time: false },
  {
    key: "STRIPE_SECRET_KEY",
    value: process.env.STRIPE_SECRET_KEY || "",
    is_build_time: false,
  },
  {
    key: "STRIPE_WEBHOOK_SECRET",
    value: process.env.STRIPE_WEBHOOK_SECRET || "",
    is_build_time: false,
  },
  {
    key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    value: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
    is_build_time: true,
  },
];

async function upsertEnv(appUuid, spec) {
  const existing = await api("GET", `/applications/${appUuid}/envs`);
  const found = existing.find((e) => e.key === spec.key);
  const body = {
    key: spec.key,
    value: spec.value,
    is_preview: false,
    is_build_time: spec.is_build_time,
    is_literal: true,
  };

  if (found?.uuid) {
    await api("PATCH", `/applications/${appUuid}/envs/${found.uuid}`, body);
    console.log(`  env PATCH ${spec.key} (build=${spec.is_build_time})`);
  } else {
    await api("POST", `/applications/${appUuid}/envs`, body);
    console.log(`  env POST ${spec.key} (build=${spec.is_build_time})`);
  }
}

async function waitDeploy(deploymentUuid, appUuid) {
  for (let i = 1; i <= 60; i++) {
    await new Promise((r) => setTimeout(r, 15000));
    const d = await api("GET", `/deployments/${deploymentUuid}`);
    const app = await api("GET", `/applications/${appUuid}`);
    console.log(`[${i}] deploy=${d.status} app=${app.status}`);
    if (d.status === "finished") {
      console.log("\nDeploy SUCCESS");
      return true;
    }
    if (d.status === "failed") {
      console.error("\nDeploy FAILED — voir Coolify > Logs");
      return false;
    }
  }
  console.warn("Timeout en attente du deploy.");
  return false;
}

async function main() {
  console.log("==> Sante API Coolify...");
  await api("GET", "/health");

  console.log("==> Application", APP_UUID);
  const app = await api("GET", `/applications/${APP_UUID}`);
  console.log("   nom:", app.name, "| statut:", app.status);

  console.log("==> Passage Dockerfile (build fiable)...");
  await api("PATCH", `/applications/${APP_UUID}`, {
    build_pack: "dockerfile",
    dockerfile_location: "/Dockerfile",
    is_static: false,
    publish_directory: null,
    install_command: null,
    build_command: null,
    start_command: null,
    ports_exposes: "3000",
    ports_mappings: "3002:3000",
    domains: `${APP_URL},${SSLIP_DOMAIN}`,
    health_check_enabled: true,
    health_check_path: "/",
    health_check_port: "3000",
    health_check_start_period: 90,
    health_check_retries: 10,
    health_check_interval: 15,
    git_branch: "main",
    instant_deploy: false,
  });

  console.log("==> Variables d'environnement...");
  for (const spec of ENV_SPECS) {
    try {
      await upsertEnv(APP_UUID, spec);
    } catch (e) {
      console.warn("  env", spec.key, ":", e.message);
    }
  }

  console.log("==> Demarrage PostgreSQL capo-db...");
  try {
    await fetch(`${COOLIFY_URL}/api/v1/databases/${DB_UUID}/start`, { headers });
  } catch (e) {
    console.warn("  DB start:", e.message);
  }

  console.log("==> Deploy force...");
  const dep = await api("GET", `/deploy?uuid=${APP_UUID}&force=true`);
  const deploymentUuid = dep.deployments?.[0]?.deployment_uuid;
  console.log("   deployment_uuid:", deploymentUuid);

  if (deploymentUuid) {
    await waitDeploy(deploymentUuid, APP_UUID);
  }

  try {
    const r = await fetch(APP_URL, { redirect: "follow" });
    console.log("HTTP", APP_URL, "->", r.status);
  } catch (e) {
    console.log("HTTP check:", e.message);
  }

  console.log("\nTermine. URLs :");
  console.log(" ", APP_URL);
  console.log(" ", SSLIP_DOMAIN);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
