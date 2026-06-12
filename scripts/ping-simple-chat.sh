#!/usr/bin/env bash
#
# Hammer the simple-chat GET endpoint with a guest token to observe backend
# memory usage while config is read on every request.
#
# Usage:
#   ./scripts/ping-simple-chat.sh
#   COUNT=5000 SLEEP_MS=0 ./scripts/ping-simple-chat.sh
#   BASE_URL=http://localhost:7007 COUNT=100 ./scripts/ping-simple-chat.sh
#
# Watch memory in another terminal, e.g.:
#   watch -n1 'podman stats --no-stream <container-id>'
#   # or inside the container / pod:
#   watch -n1 'ps -o pid,rss,vsz,cmd -p 1'

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:7007}"
COUNT="${COUNT:-1000}"
SLEEP_MS="${SLEEP_MS:-0}"
LOG_EVERY="${LOG_EVERY:-100}"
SHOW_PROBE="${SHOW_PROBE:-false}"

echo "Base URL: ${BASE_URL}"
echo "Requests: ${COUNT}"
echo "Sleep between requests: ${SLEEP_MS}ms"
echo "---"

echo "Fetching guest token from ${BASE_URL}/api/auth/guest/refresh ..."
TOKEN="$(
  curl -sf -X POST "${BASE_URL}/api/auth/guest/refresh" \
    | python3 -c "import json,sys; print(json.load(sys.stdin)['backstageIdentity']['token'])"
)"

if [[ -z "${TOKEN}" ]]; then
  echo "Failed to obtain guest token" >&2
  exit 1
fi

echo "Guest token acquired (${#TOKEN} chars)"
echo "---"

for ((i = 1; i <= COUNT; i++)); do
  if [[ "${SHOW_PROBE}" == "true" ]]; then
    curl -sf \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Accept: application/json" \
      "${BASE_URL}/api/simple-chat" \
      | python3 -c "import json,sys; d=json.load(sys.stdin); print(json.dumps(d.get('_configProbe', {}), indent=2))"
  else
    curl -sf \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Accept: application/json" \
      -o /dev/null \
      "${BASE_URL}/api/simple-chat"
  fi

  if (( i % LOG_EVERY == 0 )); then
    echo "Completed ${i}/${COUNT} requests"
  fi

  if [[ "${SLEEP_MS}" != "0" ]]; then
    sleep "$(python3 -c "print(${SLEEP_MS}/1000)")"
  fi
done

echo "Done. ${COUNT} GET requests sent to ${BASE_URL}/api/simple-chat"
