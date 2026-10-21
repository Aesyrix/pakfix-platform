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
# Environment (shown with their defaults):
#   PAKFIX_APP_DIR      where the application lives     $HOME/pakfix
#   PAKFIX_PUBLIC_DIR   this site's document root       $HOME/public_html
#   PAKFIX_PHP_BIN      the php binary                  php
#   PAKFIX_DB_RESET     drop and rebuild the database   0 (off)
#
# These can also be pinned on the server in ~/pakfix-releases/deploy.env (a file
# of KEY=value lines beside this script); it is read first and survives deploys.
#
# PAKFIX_DB_RESET=1 migrates with --fresh before the release. Use it once to
# recover a database left half-migrated by a failed deploy: MySQL does not roll
# DDL back, so a table created before a later statement failed makes every
# subsequent migrate stop with "table already exists". It deletes all data.
#
# PAKFIX_PUBLIC_DIR must be set on an account that hosts more than one site:
# the script refuses to replace a non-empty $HOME/public_html unless it has been
# told which folder is really PakFix's.
#
# These are written into .env on the first run and re-applied on every run, so
# changing one takes effect on the next deploy:
#   APP_KEY APP_URL APP_ENV DB_CONNECTION DB_HOST DB_PORT
#   DB_DATABASE DB_USERNAME DB_PASSWORD

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Optional server-side overrides, kept next to this script in ~/pakfix-releases.
# The upload only overwrites the release zip and this script, so a deploy.env
# file here survives every deploy. It lets an operator pin PAKFIX_PUBLIC_DIR
# (and friends) on the server, without touching the repository's variables.
if [ -f "$SCRIPT_DIR/deploy.env" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$SCRIPT_DIR/deploy.env"
  set +a
fi

APP_DIR="${PAKFIX_APP_DIR:-$HOME/pakfix}"
PUBLIC_DIR_EXPLICIT="${PAKFIX_PUBLIC_DIR:-}"
PUBLIC_DIR="${PUBLIC_DIR_EXPLICIT:-$HOME/public_html}"
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

# Never take over a folder that already holds another site on the strength of a
# default. The operator has to say which document root belongs to PakFix.
if [ -z "$PUBLIC_DIR_EXPLICIT" ] && [ -e "$PUBLIC_DIR" ] && [ ! -L "$PUBLIC_DIR" ] \
   && [ -n "$(ls -A "$PUBLIC_DIR" 2>/dev/null)" ]; then
  echo "ERROR: $PUBLIC_DIR already contains files and PAKFIX_PUBLIC_DIR is not set." >&2
  echo "       Refusing to replace it. Set PAKFIX_PUBLIC_DIR to this site's document root." >&2
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
  "$APP_DIR/bootstrap/cache" \
  "$APP_DIR/resources/views"

# Some shared hosts disable PHP's symlink() and exec(), which makes
# `php artisan storage:link` fail outright. Create the link from the shell
# instead; pakfix:install then sees it and skips that step.
if [ -L "$APP_DIR/public/storage" ]; then
  :
elif [ -e "$APP_DIR/public/storage" ]; then
  echo "    public/storage exists but is not a symlink; leaving it as it is."
else
  ln -s ../storage/app/public "$APP_DIR/public/storage"
fi

# ---------------------------------------------------------------------------
# Web root -> app/public
# ---------------------------------------------------------------------------

echo "==> Pointing the web root at $APP_DIR/public"
if [ -L "$PUBLIC_DIR" ]; then
  if [ "$(readlink -f "$PUBLIC_DIR")" = "$(readlink -f "$APP_DIR/public")" ]; then
    echo "    already linked."
  elif [ -n "$PUBLIC_DIR_EXPLICIT" ]; then
    echo "    re-pointing $PUBLIC_DIR (was $(readlink -f "$PUBLIC_DIR" 2>/dev/null)) at $APP_DIR/public."
    ln -sfn "$APP_DIR/public" "$PUBLIC_DIR"
  else
    echo "ERROR: $PUBLIC_DIR is a symlink to $(readlink -f "$PUBLIC_DIR" 2>/dev/null), not to PakFix." >&2
    echo "       Refusing to re-point another site's web root. Set PAKFIX_PUBLIC_DIR to this site's document root." >&2
    exit 1
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
# .env
# ---------------------------------------------------------------------------

# Sets KEY=value in .env, creating the line when absent. PHP performs the edit
# so values holding spaces, quotes, #, / or $ are written literally.
set_env() {
  "$PHP" -r '
    $file = $argv[1]; $key = $argv[2]; $value = $argv[3];
    $contents = (string) file_get_contents($file);
    $line = $key . "=" . $value;
    if (preg_match("/^" . preg_quote($key, "/") . "=.*$/m", $contents)) {
        $contents = preg_replace_callback("/^" . preg_quote($key, "/") . "=.*$/m", fn () => $line, $contents);
    } else {
        $contents = rtrim($contents) . PHP_EOL . $line . PHP_EOL;
    }
    file_put_contents($file, $contents);
  ' "$APP_DIR/.env" "$1" "$2"
}

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

CACHE_STORE=file
QUEUE_CONNECTION=database
SESSION_DRIVER=file
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

  echo "    Wrote $APP_DIR/.env."
fi

# Re-apply the values the runner supplied, so changing a secret takes effect on
# the next deploy without having to delete the .env by hand. Anything blank is
# left as it is, and pakfix:install generates APP_KEY if it is still missing.
echo "==> Applying environment values"
apply_env() {
  if [ -n "$2" ]; then
    set_env "$1" "$2"
  fi
}
apply_env APP_KEY "${APP_KEY:-}"
apply_env APP_URL "${APP_URL:-}"
apply_env DB_CONNECTION "${DB_CONNECTION:-}"
apply_env DB_HOST "${DB_HOST:-}"
apply_env DB_PORT "${DB_PORT:-}"
apply_env DB_DATABASE "${DB_DATABASE:-}"
apply_env DB_USERNAME "${DB_USERNAME:-}"
apply_env DB_PASSWORD "${DB_PASSWORD:-}"

# Fixed for shared hosting (no Redis). Files keep the very first deploy working
# against an empty database, before migrations have created the tables that the
# database cache and session stores would need.
set_env CACHE_STORE "${CACHE_STORE:-file}"
set_env SESSION_DRIVER "${SESSION_DRIVER:-file}"
set_env SESSION_DOMAIN "null"
set_env SESSION_SECURE_COOKIE "true"
set_env QUEUE_CONNECTION "${QUEUE_CONNECTION:-database}"

# Push notifications: the Firebase service account arrives base64-encoded from
# the FIREBASE_CREDENTIALS GitHub secret. It is written owner-only into
# storage/app/private (kept across deploys, ignored by git) and never echoed.
if [ -n "${FIREBASE_CREDENTIALS_B64:-}" ]; then
  echo "==> Installing the push-notification key"
  mkdir -p "$APP_DIR/storage/app/private"
  (
    umask 077
    printf '%s' "$FIREBASE_CREDENTIALS_B64" | base64 -d > "$APP_DIR/storage/app/private/firebase-credentials.json.tmp"
  )
  mv -f "$APP_DIR/storage/app/private/firebase-credentials.json.tmp" "$APP_DIR/storage/app/private/firebase-credentials.json"
  chmod 600 "$APP_DIR/storage/app/private/firebase-credentials.json"
  set_env PUSH_ENABLED "true"
fi

# ---------------------------------------------------------------------------
# Release
# ---------------------------------------------------------------------------

# Opt-in, one-time recovery for a database that an earlier failed deploy left
# half-migrated. Off unless explicitly asked for, because it deletes all data.
if [ "${PAKFIX_DB_RESET:-0}" = "1" ] || [ "${PAKFIX_DB_RESET:-0}" = "true" ]; then
  echo "==> Rebuilding the database from scratch (PAKFIX_DB_RESET is set)"
  ( cd "$APP_DIR" && "$PHP" artisan migrate:fresh --force )
fi

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
