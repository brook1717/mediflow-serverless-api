#!/usr/bin/env bash
set -euo pipefail

FUNCTION_NAME="${1:?Usage: ./scripts/logs.sh <lambda-function-name> [minutes-ago]}"
MINUTES_AGO="${2:-15}"

START_TIME=$(( $(date +%s) * 1000 - MINUTES_AGO * 60 * 1000 ))

LOG_GROUP="/aws/lambda/$FUNCTION_NAME"

echo "==> Tailing logs for $LOG_GROUP (last ${MINUTES_AGO}m)..."

aws logs filter-log-events \
  --log-group-name "$LOG_GROUP" \
  --start-time "$START_TIME" \
  --interleaved \
  --query "events[].message" \
  --output text
