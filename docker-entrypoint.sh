#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "Applying database schema..."
  node node_modules/prisma/build/index.js db push --skip-generate

  if [ "$SEED_DB" = "true" ]; then
    echo "Seeding database..."
    if [ -f prisma/seed.prod.cjs ]; then
      node prisma/seed.prod.cjs || echo "Seed already applied or failed softly"
    fi
  fi
fi

exec "$@"
