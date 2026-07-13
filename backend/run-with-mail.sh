#!/usr/bin/env bash
# Starts the backend with SMTP enabled so OTP codes are emailed for real.
# Reads credentials from ./.env (gitignored). See .env.example.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "No .env found."
  echo "  cp .env.example .env    # then fill in your SMTP details"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

if [ -z "${MAIL_HOST:-}" ] || [ -z "${MAIL_USERNAME:-}" ] || [ -z "${MAIL_PASSWORD:-}" ]; then
  echo "MAIL_HOST / MAIL_USERNAME / MAIL_PASSWORD must be set in .env"
  exit 1
fi

echo "Starting backend with email enabled (host: $MAIL_HOST, from: ${MAIL_FROM:-$MAIL_USERNAME})"
mvn spring-boot:run
