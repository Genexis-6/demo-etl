#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "=========================================================="
echo "   ETL Pipeline Studio (FastAPI + Next.js + WebSockets)   "
echo "=========================================================="

cleanup() {
    echo ""
    echo "Shutting down ETL Studio..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 1. Start FastAPI Backend
echo "[1/2] Starting FastAPI Backend on http://localhost:8000 ..."
if [ -d "$DIR/backend/venv" ]; then
    source "$DIR/backend/venv/bin/activate"
elif [ -d "$DIR/venv" ]; then
    source "$DIR/venv/bin/activate"
fi
export PYTHONPATH="$DIR/backend:$DIR:$PYTHONPATH"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend health check..."
until curl -s http://localhost:8000/api/health > /dev/null 2>&1; do
    sleep 0.5
done
echo "Backend is ready!"

# 2. Start Next.js Frontend
echo "[2/2] Starting Next.js Frontend on http://localhost:3000 ..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "   ETL Studio is live!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000 (API docs: /docs)"
echo "   WebSocket: ws://localhost:8000/ws/etl"
echo "=========================================================="
echo ""

wait
