#!/bin/sh
set -e

node node_modules/prisma/build/index.js db push --skip-generate

UPLOADS_TARGET="${UPLOADS_DIR:-/data/capo-uploads}"
mkdir -p "$UPLOADS_TARGET"

if [ -f ".next/standalone/server.js" ]; then
  mkdir -p .next/standalone/.next
  cp -r .next/static .next/standalone/.next/
  cp -r public/. .next/standalone/public/
  mkdir -p .next/standalone/public
  rm -rf .next/standalone/public/uploads
  ln -sf "$UPLOADS_TARGET" .next/standalone/public/uploads
  export UPLOADS_DIR="$UPLOADS_TARGET"
  cd .next/standalone
else
  mkdir -p public
  rm -rf public/uploads
  ln -sf "$UPLOADS_TARGET" public/uploads
  export UPLOADS_DIR="$UPLOADS_TARGET"
fi

export HOSTNAME=0.0.0.0
export PORT="${PORT:-3000}"
exec node server.js
