#!/bin/sh
set -e

node node_modules/prisma/build/index.js db push --skip-generate

UPLOADS_TARGET="${UPLOADS_DIR:-/data/capo-uploads}"
mkdir -p "$UPLOADS_TARGET"
export UPLOADS_DIR="$UPLOADS_TARGET"

link_uploads_dir() {
  target="$1"
  mkdir -p "$(dirname "$target")"
  if [ -L "$target" ] || [ -d "$target" ]; then
    rm -rf "$target"
  fi
  ln -sf "$UPLOADS_TARGET" "$target"
}

if [ -f ".next/standalone/server.js" ]; then
  mkdir -p .next/standalone/.next
  cp -r .next/static .next/standalone/.next/
  cp -r public/. .next/standalone/public/
  link_uploads_dir ".next/standalone/public/uploads"
  cd .next/standalone
elif [ -f "server.js" ]; then
  link_uploads_dir "public/uploads"
else
  mkdir -p public
  link_uploads_dir "public/uploads"
fi

export HOSTNAME=0.0.0.0
export PORT="${PORT:-3000}"
exec node server.js
