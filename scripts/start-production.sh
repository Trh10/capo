#!/bin/sh
set -e

node node_modules/prisma/build/index.js db push --skip-generate

mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/
cp -r public/. .next/standalone/public/

# Volume persistant Coolify (ou dossier local en prod)
UPLOADS_TARGET="${UPLOADS_DIR:-/data/capo-uploads}"
mkdir -p "$UPLOADS_TARGET"
mkdir -p .next/standalone/public
rm -rf .next/standalone/public/uploads
ln -sf "$UPLOADS_TARGET" .next/standalone/public/uploads

export HOSTNAME=0.0.0.0
export PORT=3000
export UPLOADS_DIR="$UPLOADS_TARGET"
cd .next/standalone
exec node server.js
