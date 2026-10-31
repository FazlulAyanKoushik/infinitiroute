#!/usr/bin/env sh
# Rebuild the infinitiroute image and recreate the container.
# Usage:  ./scripts/docker-update.sh [hostPort]
#         hostPort defaults to 20128. Your data lives in the
#         infinitiroute-data volume and survives every update.
set -e

PORT="${1:-20128}"

echo "[docker-update] Building image..."
docker build -t infinitiroute:latest .

echo "[docker-update] Recreating container on port ${PORT}..."
docker rm -f infinitiroute 2>/dev/null || true

docker run -d \
  --name infinitiroute \
  --restart unless-stopped \
  --stop-timeout 40 \
  -p "127.0.0.1:${PORT}:20128" \
  -v infinitiroute-data:/app/data \
  infinitiroute:latest

docker ps --filter name=infinitiroute
echo "[docker-update] Done. Dashboard: http://127.0.0.1:${PORT}"
