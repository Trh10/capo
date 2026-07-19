#!/usr/bin/env node
/**
 * Deploie CAPO via l'API Coolify (sans toucher aux autres projets).
 * Usage: COOLIFY_TOKEN=xxx node scripts/coolify-deploy.mjs
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const COOLIFY_URL = (process.env.COOLIFY_URL || "http://51.255.200.11:8000").replace(/\/$/, "");
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN;

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

const composeContent = readFileSync(join(root, "docker-compose.yml"), "utf8");

async function main() {
  console.log("==> Verification API Coolify...");
  await api("GET", "/health");

  console.log("==> Recherche projet CAPO...");
  const projects = await api("GET", "/projects");
  let project = projects.find((p) => p.name === "CAPO");

  if (!project) {
    console.log("==> Creation projet CAPO...");
    project = await api("POST", "/projects", {
      name: "CAPO",
      description: "Plateforme cours creatifs",
    });
  } else {
    console.log("==> Projet CAPO existe deja:", project.uuid);
  }

  const projectUuid = project.uuid;

  console.log("==> Environnements...");
  const envs = await api("GET", `/projects/${projectUuid}/environments`);
  const env = envs[0];
  if (!env) throw new Error("Aucun environnement trouve");

  console.log("==> Serveurs...");
  const servers = await api("GET", "/servers");
  const server = servers.find((s) => s.name === "localhost") || servers[0];
  if (!server) throw new Error("Aucun serveur trouve");
  const serverUuid = server.uuid;

  console.log("==> Services existants...");
  const services = await api("GET", "/services");
  let capoService = services.find(
    (s) => s.name === "capo" || s.name === "CAPO"
  );

  if (!capoService) {
    console.log("==> Creation service Docker Compose CAPO...");
    capoService = await api("POST", "/services", {
      name: "capo",
      description: "CAPO stack - app + postgres isolee",
      project_uuid: projectUuid,
      environment_name: env.name,
      server_uuid: serverUuid,
      docker_compose_raw: composeContent,
      instant_deploy: false,
    });
  }

  const serviceUuid = capoService.uuid;
  console.log("==> Service uuid:", serviceUuid);

  const envVars = [
    { key: "POSTGRES_PASSWORD", value: process.env.POSTGRES_PASSWORD || "CapoDb2026Secure!" },
    {
      key: "JWT_SECRET",
      value: process.env.JWT_SECRET || "capo-jwt-prod-" + Math.random().toString(36).slice(2),
    },
    { key: "NEXT_PUBLIC_APP_URL", value: process.env.NEXT_PUBLIC_APP_URL || "http://51.255.200.11:3002" },
    { key: "CAPO_PORT", value: "3002" },
    { key: "SEED_DB", value: "true" },
    { key: "UPLOADS_DIR", value: "/data/capo-uploads" },
  ];

  console.log("==> Variables d'environnement...");
  for (const v of envVars) {
    try {
      await api("POST", `/services/${serviceUuid}/envs`, {
        key: v.key,
        value: v.value,
        is_preview: false,
        is_build_time: false,
        is_literal: true,
      });
    } catch (e) {
      console.warn("Env", v.key, ":", e.message);
    }
  }

  console.log("==> Deploiement...");
  await api("GET", `/deploy?uuid=${serviceUuid}&force=false`);

  console.log("");
  console.log("CAPO deploye !");
  console.log("URL: http://51.255.200.11:3002");
  console.log("Comptes demo: julie.robert@capo.fr / eleve@capo.fr - password123");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
