#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -d "$DIR/backend/.venv" ]; then
  echo "Creating Python virtual environment in backend/.venv..."
  python3 -m venv "$DIR/backend/.venv"
  "$DIR/backend/.venv/bin/pip" install --upgrade pip
  "$DIR/backend/.venv/bin/pip" install -r "$DIR/backend/requirements.txt"
fi

if [ ! -d "$DIR/frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  (cd "$DIR/frontend" && npm install)
fi

echo "Starting LayerZero Backend (FastAPI on :8008)..."
(cd "$DIR/backend" && ./.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8008) &
BE_PID=$!

echo "Starting LayerZero Frontend (Vite on :5173)..."
(cd "$DIR/frontend" && npm run dev) &
FE_PID=$!

trap "kill $BE_PID $FE_PID 2>/dev/null || true" EXIT
wait
