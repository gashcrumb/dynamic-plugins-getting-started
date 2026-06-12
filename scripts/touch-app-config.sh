#!/usr/bin/env bash
#
# Repeatedly touch the mounted app-config.yaml to trigger config reload watchers
# while observing backend memory / config probe behaviour.
#
# Usage:
#   ./scripts/touch-app-config.sh
#   COUNT=100 SLEEP_MS=5000 ./scripts/touch-app-config.sh
#   APP_CONFIG=./app-config.yaml COUNT=0 ./scripts/touch-app-config.sh
#
# COUNT=0 runs until interrupted (Ctrl+C).
#
# Pair with the simple-chat probe UI or:
#   ./scripts/ping-simple-chat.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

APP_CONFIG="${APP_CONFIG:-${REPO_ROOT}/app-config.yaml}"
COUNT="${COUNT:-1000}"
SLEEP_MS="${SLEEP_MS:-0}"
LOG_EVERY="${LOG_EVERY:-100}"

if [[ ! -f "${APP_CONFIG}" ]]; then
  echo "Config file not found: ${APP_CONFIG}" >&2
  exit 1
fi

echo "Config file: ${APP_CONFIG}"
if [[ "${COUNT}" == "0" ]]; then
  echo "Touches: until interrupted (COUNT=0)"
else
  echo "Touches: ${COUNT}"
fi
echo "Sleep between touches: ${SLEEP_MS}ms"
echo "---"

i=0
while true; do
  i=$((i + 1))

  if [[ "${COUNT}" != "0" && "${i}" -gt "${COUNT}" ]]; then
    break
  fi

  touch "${APP_CONFIG}"

  if (( i % LOG_EVERY == 0 )); then
    if [[ "${COUNT}" == "0" ]]; then
      echo "Touched ${i} times ($(date -Iseconds))"
    else
      echo "Touched ${i}/${COUNT} ($(date -Iseconds))"
    fi
  fi

  if [[ "${SLEEP_MS}" != "0" ]]; then
    sleep "$(python3 -c "print(${SLEEP_MS}/1000)")"
  fi
done

if [[ "${COUNT}" == "0" ]]; then
  echo "Stopped after ${i} touches"
else
  echo "Done. ${COUNT} touches applied to ${APP_CONFIG}"
fi
