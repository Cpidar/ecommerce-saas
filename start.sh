#!/bin/sh
cd /server/apps/backend

echo "Running database migrations..."
pnpm medusa db:migrate

echo "Seeding database..."
pnpm seed || echo "Seeding failed, continuing..."

echo "Starting Medusa server..."
pnpm dev  # or `pnpm start` for production