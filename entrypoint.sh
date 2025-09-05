
set -euo pipefail

MODE="${1:-api}"

echo "[entrypoint] NODE_ENV=${NODE_ENV:-}"
echo "[entrypoint] Starting in mode: ${MODE}"

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] Running Prisma migrate deploy..."
  npx prisma migrate deploy
fi

npx prisma generate

echo "[entrypoint] Starting API..."
exec node dist/main.js
