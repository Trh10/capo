#!/bin/sh
set -e

node node_modules/prisma/build/index.js db push --skip-generate

mkdir -p .next/standalone/.next
mkdir -p .next/standalone/public/uploads
cp -r .next/static .next/standalone/.next/
cp -r public/. .next/standalone/public/

export HOSTNAME=0.0.0.0
export PORT=3000
cd .next/standalone
exec node server.js
