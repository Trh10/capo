#!/bin/sh
set -e

node node_modules/prisma/build/index.js db push --skip-generate

mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

export HOSTNAME=0.0.0.0
export PORT=3000
exec node .next/standalone/server.js
