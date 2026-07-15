#!/bin/bash
# Déploie CAPO sur le VPS sans toucher aux autres projets Coolify
set -euo pipefail

VPS_HOST="${VPS_HOST:-51.255.200.11}"
VPS_USER="${VPS_USER:-root}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/capo}"

echo "==> Déploiement CAPO vers ${VPS_USER}@${VPS_HOST}:${DEPLOY_DIR}"
echo "==> Aucun autre projet Coolify ne sera modifié"

ssh "${VPS_USER}@${VPS_HOST}" "mkdir -p ${DEPLOY_DIR}"

rsync -avz --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude prisma/dev.db \
  --exclude prisma/dev.db-journal \
  --exclude .env \
  ./ "${VPS_USER}@${VPS_HOST}:${DEPLOY_DIR}/"

ssh "${VPS_USER}@${VPS_HOST}" bash -s <<EOF
set -euo pipefail
cd ${DEPLOY_DIR}

if [ ! -f .env ]; then
  cp .env.production.example .env
  echo "Fichier .env créé depuis .env.production.example — vérifiez les secrets."
fi

docker compose down 2>/dev/null || true
docker compose up -d --build

echo ""
echo "CAPO déployé. Vérifiez : http://${VPS_HOST}:3002"
docker compose ps
EOF

echo "==> Terminé."
