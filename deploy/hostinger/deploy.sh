#!/usr/bin/env bash
#
# PakFix -- deploy a packaged release on Hostinger (or any shared host).
#
# Runs ON the server. Idempotent: safe to run on every deploy. It keeps the
# server's .env and persistent storage, replaces everything else with the
# uploaded release, points the web root at the app's public/ folder, and then
# runs `php artisan pakfix:deploy` (migrate, seed-if-empty, caches).
#
# Usage:
#   bash deploy.sh                 # uses the newest pakfix-release-*.zip beside it
#   bash deploy.sh /path/to.zip    # or a specific release zip
#
# Environment (all optional; shown with their defaults):
#   PAKFIX_APP_DIR      where the application lives     $HOME/pakfix
#   PAKFIX_PUBLIC_DIR   the web root                    $HOME/public_html
#   PAKFIX_PHP_BIN      the php binary                  php
#
# On the very first run the .env is written from these (otherwise defaults):
#   APP_KEY APP_URL APP_ENV DB_CONNECTION DB_HOST DB_PORT
#   DB_DATABASE DB_USERNAME DB_PASSWORD

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${PAKFIX_APP_DIR:-$HOME/pakfix}"
PUBLIC_DIR="${PAKFIX_PUBLIC_DIR:-$HOME/public_html}"
PHP="${PAKFIX_PHP_BIN:-php}"

# ---------------------------------------------------------------------------
# Find the release
# ---------------------------------------------------------------------------

ZIP="${1:-}"
if [ -z "$ZIP" ]; then
  ZIP="$(ls -1t "$SCRIPT_DIR"/pakfix-release-*.zip 2>/dev/null | head -n1 || true)"
fi

if [ -z "$ZIP" ] || [ ! -f "$ZIP" ]; then
  echo "ERROR: no release zip found (looked in $SCRIPT_DIR)." >&2
  exit 1
fi

if ! command -v "$PHP" >/dev/null 2>&1; then
  echo "ERROR: '$PHP' was not found on the server's PATH." >&2
  exit 1
fi

if ! command -v unzip >/dev/null 2>&1; then
  echo "ERROR: 'unzip' is required on the server." >&2
  exit 1
fi

echo "==> PakFix deploy"
echo "    release : $ZIP"
echo "    app dir : $APP_DIR"
echo "    web dir : $PUBLIC_DIR"
echo "    php     : $("$PHP" -v 2>/dev/null | head -n1)"

# ---------------------------------------------------------------------------
# Unpack
# ---------------------------------------------------------------------------

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
unzip -q -o "$ZIP" -d "$TMP"

SRC="$TMP/pakfix"
if [ ! -d "$SRC" ]; then
  echo "ERROR: unexpected archive layout (expected a top-level 'pakfix/' folder)." >&2
  exit 1
fi

mkdir -p "$APP_DIR"

# ---------------------------------------------------------------------------
# Sync the application, preserving what belongs to the server
# ---------------------------------------------------------------------------

echo "==> Syncing application files"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete \
    --exclude '.env' \
    --exclude 'storage/app' \
    --exclude 'storage/logs' \
    --exclude 'storage/framework/cache/data' \
    --exclude 'storage/framework/sessions' \
    --exclude 'storage/framework/views' \
    --exclude 'public/storage' \
    "$SRC"/ "$APP_DIR"/
else
  echo "    (rsync not available; extracting over the existing tree)"
  ( cd "$SRC" && tar cf - . ) | ( cd "$APP_DIR" && tar xf - )
fi

# Laravel needs these to exist and be writable.
mkdir -p \
  "$APP_DIR/storage/app/public" \
  "$APP_DIR/storage/logs" \
  "$APP_DIR/storage/framework/cache/data" \
  "$APP_DIR/storage/framework/sessions" \
  "$APP_DIR/storage/framework/views" \
  "$APP_DIR/bootstrap/cache"

# ---------------------------------------------------------------------------
# Web root -> app/public
# ---------------------------------------------------------------------------

echo "==> Pointing the web root at $APP_DIR/public"
if [ -L "$PUBLIC_DIR" ]; then
  if [ "$(readlink -f "$PUBLIC_DIR")" != "$(readlink -f "$APP_DIR/public")" ]; then
    echo "    $PUBLIC_DIR pointed elsewhere; re-pointing it."
    ln -sfn "$APP_DIR/public" "$PUBLIC_DIR"
  else
    echo "    already linked."
  fi
elif [ -e "$PUBLIC_DIR" ] && [ -n "$(ls -A "$PUBLIC_DIR" 2>/dev/null)" ]; then
  BACKUP="${PUBLIC_DIR}.bak.$(date +%Y%m%d%H%M%S)"
  echo "    $PUBLIC_DIR is not empty; backing it up to $BACKUP and linking instead."
  mv "$PUBLIC_DIR" "$BACKUP"
  ln -s "$APP_DIR/public" "$PUBLIC_DIR"
else
  [ -e "$PUBLIC_DIR" ] && rmdir "$PUBLIC_DIR"
  ln -s "$APP_DIR/public" "$PUBLIC_DIR"
fi

# ---------------------------------------------------------------------------
# First-run .env
# ---------------------------------------------------------------------------

if [ ! -f "$APP_DIR/.env" ]; then
  echo "==> Creating $APP_DIR/.env"

  APP_ENV_VALUE="${APP_ENV:-production}"
  APP_URL_VALUE="${APP_URL:-https://pakfix.pk}"
  HOST="${APP_URL_VALUE#https://}"
  HOST="${HOST#http://}"
  HOST="${HOST%%/*}"
  DB_CONNECTION_VALUE="${DB_CONNECTION:-mysql}"

  cat > "$APP_DIR/.env" <<ENVEOF
APP_NAME=PakFix
APP_ENV=${APP_ENV_VALUE}
APP_KEY=${APP_KEY:-}
APP_DEBUG=false
APP_TIMEZONE=Asia/Karachi
APP_URL=${APP_URL_VALUE}
APP_LOCALE=en
APP_FALLBACK_LOCALE=en

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=${DB_CONNECTION_VALUE}
DB_HOST=${DB_HOST:-127.0.0.1}
DB_PORT=${DB_PORT:-3306}
DB_DATABASE=${DB_DATABASE:-}
DB_USERNAME=${DB_USERNAME:-}
DB_PASSWORD=${DB_PASSWORD:-}

CACHE_STORE=database
QUEUE_CONNECTION=database
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=true
BROADCAST_CONNECTION=log

FRONTEND_URL=${APP_URL_VALUE}
SANCTUM_STATEFUL_DOMAINS=${HOST},www.${HOST}

FILESYSTEM_DISK=local
MAIL_MAILER=log
MAIL_FROM_ADDRESS="hello@pakfix.pk"
MAIL_FROM_NAME="PakFix"

AI_ENABLED=true
PAYMENTS_DEFAULT_GATEWAY=cash
PLATFORM_COMMISSION_PERCENT=10
ENVEOF

  if [ -z "${APP_KEY:-}" ]; then
    ( cd "$APP_DIR" && "$PHP" artisan key:generate --force )
  fi

  echo "    Wrote $APP_DIR/.env (review DB_* and APP_URL)."
fi

# ---------------------------------------------------------------------------
# Release
# ---------------------------------------------------------------------------

echo "==> Running the release"
( cd "$APP_DIR" && "$PHP" artisan pakfix:deploy )

# Keep the three most recent releases for rollback; drop older ones.
{ ls -1t "$SCRIPT_DIR"/pakfix-release-*.zip 2>/dev/null || true; } | tail -n +4 | while read -r old; do rm -f "$old"; done

echo
echo "==> Done: $(basename "$ZIP") is live."
echo "    Scheduler (add once to cron, every minute):"
echo "      * * * * * cd $APP_DIR && $PHP artisan schedule:run >> /dev/null 2>&1"
echo "    Queue worker (every minute, shared hosting):"
echo "      * * * * * cd $APP_DIR && $PHP artisan queue:work --stop-when-empty --tries=3 --max-time=55 >> /dev/null 2>&1"
