#!/bin/bash
# Collez ce script dans Coolify > Terminal > localhost
# Il deploie CAPO dans /opt/capo sans toucher aux autres projets
set -euo pipefail

DEPLOY_DIR="/opt/capo"
CAPO_PORT="${CAPO_PORT:-3002}"

echo "==> Deploiement CAPO dans ${DEPLOY_DIR} (isole)"

if [ -d "$DEPLOY_DIR" ] && [ -f "$DEPLOY_DIR/docker-compose.yml" ]; then
  echo "==> CAPO deja present, rebuild..."
  cd "$DEPLOY_DIR"
else
  mkdir -p "$DEPLOY_DIR"
  cd "$DEPLOY_DIR"
  echo "ERREUR: Les fichiers CAPO doivent etre copies dans ${DEPLOY_DIR}"
  echo "Demandez a l'assistant de relancer le deploiement avec un token API Coolify."
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.production.example .env
  sed -i "s/CapoDb2026Secure!/CapoDb$(openssl rand -hex 8)/" .env
  sed -i "s/capo-jwt-changez-moi-en-production-long-secret/capo-jwt-$(openssl rand -hex 16)/" .env
fi

docker compose down 2>/dev/null || true
docker compose up -d --build

echo ""
echo "CAPO pret sur http://$(hostname -I | awk '{print $1}'):${CAPO_PORT}"
docker compose ps
