# Deployment

Three shapes, all supported:

- **Shared hosting (one PHP app).** The website is pre-compiled to static files and served by
  Laravel itself, so the whole platform runs on PHP + MySQL + cron alone — no Node, no Nginx,
  no Redis, no supervisor. This is the default for Hostinger and the simplest way to launch.
- **One VPS.** Nginx in front of both Laravel and Next.js. Simplest to reason about, and the
  default recommendation for full control.
- **Split.** Next.js on Vercel, Laravel on a VPS. Better edge performance, more moving parts.

---

## Shared hosting (Hostinger) — single PHP app

Because the marketing site is exported to plain HTML/CSS/JS and copied into the API's `public/`
folder, there is only one application to host. Hostinger's Web/Cloud hosting is enough: PHP, one
MySQL database, and cron. Everything that needs Node or Composer (the build) runs in CI, not on
the server.

### Layout

```
/home/<user>/pakfix/            the application (vendor, storage, .env) — outside the web root
/home/<user>/public_html        a symlink -> pakfix/public  (the only web-exposed folder)
```

`public_html` is fixed as the primary domain's document root by hPanel, so it cannot be moved to
`pakfix/public`. A symlink solves this without changing application code: `FrontendController`
already resolves files through `public_path()`, which follows the link.

### What the server needs

| Component | Requirement |
|---|---|
| PHP | 8.2+ (8.3 recommended), with `pdo_mysql`, `mbstring`, `gd`, `zip`, `bcmath`, `intl`, `curl`, `fileinfo` |
| Database | MySQL (a single database and user) |
| Files/CLI | `unzip`, `rsync` (optional), `php` CLI, `cron`, SSH access |
| SSL | Free Let's Encrypt certificate from hPanel |

No `redis` extension is required: the shared-hosting `.env` uses the **file** cache and session
drivers and the **database** queue (migrations create the `jobs` table). File drivers also keep the
first deploy working against an empty database, before any tables exist.

### 1. Create the site (hPanel)

1. **Websites → Add website**, enter `pakfix.pk` (and `www`), accept the planned doc root
   `public_html`.
2. **Databases → MySQL Databases**: create a database and a user, grant the user all privileges
   on it, and note the host (usually `localhost`), name, user and password.
3. **Advanced → PHP Configuration**: select PHP 8.3 (or 8.2) and enable the extensions listed
   above.
4. **Advanced → SSH Access**: enable it and note the host, port (often `65002`), username and
   password. This is the account the deploy connects as.
5. **Security → SSL**: issue the free certificate for both hostnames.

### 2. Deploy

Deployment is driven by **[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)** on
every push to `master`. The runner:

1. installs Composer and Node dependencies,
2. writes a throwaway SQLite `.env` and migrates + seeds it, so the static export has data to
   render,
3. runs `php pakfix build --url="https://pakfix.pk"` and `php pakfix package --output=dist`,
4. uploads the release zip and
   **[`deploy/hostinger/deploy.sh`](../deploy/hostinger/deploy.sh)** to `~/pakfix-releases/`,
5. runs the script over SSH.

The script is idempotent: it keeps the server's `.env` and `storage/apps`, replaces every other
file with the release, points `public_html` at `pakfix/public`, writes the `.env` on the first
run, and finishes with `php artisan pakfix:deploy` (migrate, seed-if-empty, cache).

### 3. Repository secrets

Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `SSH_HOST` | the SSH host from hPanel (e.g. `203.0.113.10`) |
| `SSH_PORT` | the SSH port from hPanel (e.g. `65002`) |
| `SSH_USER` | the account username (e.g. `u123456789`) |
| `SSH_PASSWORD` | the account password — **or** `SSH_PRIVATE_KEY` with a deploy key |
| `APP_KEY` | a pre-generated key (`php artisan key:generate --show`); optional but recommended |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | the MySQL details from hPanel |

`DB_*` and `APP_KEY` are only read when the server's `.env` does not exist yet. Optional
**variables** `PAKFIX_APP_DIR`, `PAKFIX_PUBLIC_DIR` and `SITE_URL` override the defaults
(`$HOME/pakfix`, `$HOME/public_html`, `https://pakfix.pk`).

### 4. Server `.env`

Created on the first deploy. The important values:

```ini
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...            # from the APP_KEY secret, or generated on first run
APP_URL=https://pakfix.pk

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=<database>
DB_USERNAME=<user>
DB_PASSWORD=<password>

CACHE_STORE=file
QUEUE_CONNECTION=database
SESSION_DRIVER=file
SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=true

SANCTUM_STATEFUL_DOMAINS=pakfix.pk,www.pakfix.pk
```

There is no Redis on shared hosting, so the file cache/session and database queue above are used —
do not copy the VPS `.env`, which uses `redis` and `pgsql`. On an account that hosts more than one
site, `PAKFIX_PUBLIC_DIR` must be set to this site's real document root
(`~/domains/<domain>/public_html` on the newer hPanel layout); the deploy script refuses to replace
a non-empty `~/public_html` otherwise.

### 5. Cron

Add once in **Advanced → Cron Jobs** (or `crontab -e`). Shared hosting has no supervisor, so the
queue is drained by a one-shot worker:

```cron
* * * * * cd /home/<user>/pakfix && php artisan schedule:run >> /dev/null 2>&1
* * * * * cd /home/<user>/pakfix && php artisan queue:work --stop-when-empty --tries=3 --max-time=55 >> /dev/null 2>&1
```

### 6. Building in the data

The export is static: any content it renders is baked into the HTML at build time. Content that
lives only in the production database (services, professionals, published posts, blog bodies, CMS
pages) is **not** in the export unless the CI seed produces it. The seeders handle the launch set
of categories, provinces and cities. To change marketing copy, edit it in the repo and push; to
change data the export depends on, update the seeder (or add it to `DatabaseSeeder` for
production) and push — the next build picks it up.

Live, per-request data (search, profiles, booking) is fetched by the browser from the same-origin
`/api/v1`, so it always reflects the production database and needs no rebuild.

### 7. Updating

Push to `master`. The workflow rebuilds and redeploys. To do it by hand:

```bash
# locally
php pakfix package --build --url="https://pakfix.pk" --output=dist

# upload dist/pakfix-release-*.zip and deploy/hostinger/deploy.sh to ~/pakfix-releases, then:
ssh -p <port> <user>@<host> 'bash ~/pakfix-releases/deploy.sh'
```

Rolling back is re-uploading a previous `pakfix-release-*.zip` and running the script again. New
releases do not roll back the database — restore a dump if a migration must be undone.

### Notes and limits

- **`rsync` on the host.** If it is missing, the script falls back to extracting over the existing
  tree; `rsync` is preferred because it deletes files removed from the release.
- **Site down during deploy.** The script does not put the app into maintenance mode, so a
  half-second gap is possible. For a stricter cutover, wrap release in `php artisan down`/`up`.
- **No supervisor.** Background jobs run only as often as the cron queue worker fires.
- **Static HTML cache.** The marketing pages are static files; changes to them require a rebuild
  and redeploy, not just a database edit.

---

## Target environment

| Component | Minimum | Recommended |
|---|---|---|
| OS | Ubuntu 22.04 | Ubuntu 24.04 LTS |
| PHP | 8.2 | 8.3 |
| PostgreSQL | 14 | 16 |
| Redis | 6 | 7 |
| Node | 20 | 22 LTS |
| RAM | 2 GB | 4 GB |

Works on DigitalOcean, Hetzner, AWS EC2 Lightsail, and Hostinger VPS. Nothing is
provider-specific.

---

## One VPS

### 1. Packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx postgresql redis-server git unzip supervisor \
  php8.3-fpm php8.3-cli php8.3-pgsql php8.3-mbstring php8.3-xml \
  php8.3-curl php8.3-zip php8.3-gd php8.3-bcmath php8.3-intl

curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### 2. Database

```bash
sudo -u postgres psql <<'SQL'
CREATE DATABASE pakfix ENCODING 'UTF8';
CREATE USER pakfix WITH ENCRYPTED PASSWORD 'use-a-real-password';
GRANT ALL PRIVILEGES ON DATABASE pakfix TO pakfix;
\c pakfix
GRANT ALL ON SCHEMA public TO pakfix;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
SQL
```

### 3. Deploy the code

```bash
sudo mkdir -p /var/www/pakfix && sudo chown -R $USER:www-data /var/www/pakfix
git clone <repository-url> /var/www/pakfix
cd /var/www/pakfix

# API
cd backend
cp .env.example .env          # then edit it — see below
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force   # reference data only; demo data is skipped in production
php artisan storage:link
php artisan config:cache && php artisan route:cache && php artisan view:cache

# Frontend
cd ../frontend
npm ci
npm run build
```

Production `.env` essentials:

```ini
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.pakfix.pk
FRONTEND_URL=https://pakfix.pk
SANCTUM_STATEFUL_DOMAINS=pakfix.pk,www.pakfix.pk
SESSION_DOMAIN=.pakfix.pk
SESSION_SECURE_COOKIE=true

DB_CONNECTION=pgsql
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=database
FILESYSTEM_DISK=s3
```

`APP_DEBUG=false` is not optional. With it on, the exception handler returns the real error
instead of a generic message.

### 4. Permissions

```bash
sudo chown -R www-data:www-data /var/www/pakfix/backend/storage \
                                 /var/www/pakfix/backend/bootstrap/cache
sudo chmod -R 775 /var/www/pakfix/backend/storage
```

### 5. Nginx

`/etc/nginx/sites-available/pakfix`:

```nginx
# Frontend — Next.js on :3000
server {
    listen 443 ssl http2;
    server_name pakfix.pk www.pakfix.pk;

    ssl_certificate     /etc/letsencrypt/live/pakfix.pk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pakfix.pk/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API — PHP-FPM
server {
    listen 443 ssl http2;
    server_name api.pakfix.pk;

    ssl_certificate     /etc/letsencrypt/live/api.pakfix.pk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.pakfix.pk/privkey.pem;

    root /var/www/pakfix/backend/public;
    index index.php;
    client_max_body_size 72M;

    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / { try_files $uri $uri/ /index.php?$query_string; }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        include snippets/fastcgi-php.conf;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_read_timeout 120s;
    }

    location ~ /\.(?!well-known).* { deny all; }
}

# Force HTTPS
server {
    listen 80;
    server_name pakfix.pk www.pakfix.pk api.pakfix.pk;
    return 301 https://$host$request_uri;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/pakfix /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d pakfix.pk -d www.pakfix.pk -d api.pakfix.pk
```

`/var/www/pakfix/backend/public` is the web root. Everything beside it — `app/`, `config/`,
`storage/`, `.env` — must never be reachable over HTTP.

### 6. Long-running processes

The queue worker and the Next.js server both need a supervisor.

`/etc/supervisor/conf.d/pakfix.conf`:

```ini
[program:pakfix-queue]
command=php /var/www/pakfix/backend/artisan queue:work --sleep=1 --tries=3 --max-time=3600
directory=/var/www/pakfix/backend
user=www-data
autostart=true
autorestart=true
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/pakfix/queue.log
stopwaitsecs=3600

[program:pakfix-web]
command=npm run start
directory=/var/www/pakfix/frontend
user=www-data
autostart=true
autorestart=true
environment=NODE_ENV="production",PORT="3000"
redirect_stderr=true
stdout_logfile=/var/log/pakfix/web.log
```

```bash
sudo mkdir -p /var/log/pakfix
sudo supervisorctl reread && sudo supervisorctl update
```

`--max-time=3600` matters: a worker that runs forever eventually holds a stale copy of the code
after a deploy.

### 7. Scheduler

```bash
sudo crontab -u www-data -e
```

```cron
* * * * * cd /var/www/pakfix/backend && php artisan schedule:run >> /dev/null 2>&1
```

One entry, forever. Everything scheduled — maintenance reminders, quote expiry, auto-confirming
completed jobs — hangs off it.

---

## Split deployment

Frontend on Vercel, API on the VPS.

1. Import the repository; set the root directory to `frontend`.
2. Environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.pakfix.pk/api/v1
   NEXT_PUBLIC_SITE_URL=https://pakfix.pk
   ```
3. On the API, allow the frontend's origins:
   ```ini
   FRONTEND_URL=https://pakfix.pk
   CORS_ALLOWED_ORIGINS=https://pakfix.pk,https://www.pakfix.pk
   SANCTUM_STATEFUL_DOMAINS=pakfix.pk,www.pakfix.pk
   SESSION_DOMAIN=.pakfix.pk
   ```

Cookie sessions need both ends on the same registrable domain. `pakfix.pk` and `api.pakfix.pk`
share `.pakfix.pk`, so this works. A Vercel preview URL on `*.vercel.app` does **not** — preview
deployments must use bearer tokens, or be given a subdomain of `pakfix.pk`.

---

## Deploying an update

On shared hosting, this is simply a push to `master` (see
[Shared hosting](#shared-hosting-hostinger--single-php-app) above). On a VPS:

```bash
cd /var/www/pakfix
php backend/artisan down --render="errors::503"

git pull origin main

cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache && php artisan route:cache && php artisan view:cache

cd ../frontend
npm ci && npm run build

sudo supervisorctl restart pakfix-queue pakfix-web
php ../backend/artisan up
```

Restarting the queue worker is not optional — without it, workers keep running the previous
release's code.

---

## Backups

### Database — nightly, kept 30 days

`/usr/local/bin/pakfix-backup-db.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR=/var/backups/pakfix
STAMP=$(date +%Y-%m-%d_%H%M)
mkdir -p "$BACKUP_DIR"

PGPASSWORD="$DB_PASSWORD" pg_dump -h 127.0.0.1 -U pakfix -Fc pakfix \
  > "$BACKUP_DIR/pakfix-$STAMP.dump"

# Off-site, because a backup on the same machine is not a backup.
aws s3 cp "$BACKUP_DIR/pakfix-$STAMP.dump" "s3://pakfix-backups/db/"

find "$BACKUP_DIR" -name 'pakfix-*.dump' -mtime +30 -delete
```

```cron
0 2 * * * /usr/local/bin/pakfix-backup-db.sh >> /var/log/pakfix/backup.log 2>&1
```

### Media

With `FILESYSTEM_DISK=s3`, enable bucket versioning and a lifecycle rule; that is the backup.
On local disk, sync `backend/storage/app` to object storage nightly.

CNIC scans and invoices are personal data. The backup bucket must be private, encrypted at rest,
and access-logged.

### Environment

`.env` is not in the repository and is not in the database dump. Keep it in a password manager or
a secrets service. A database restore without it gets you nothing — `APP_KEY` decrypts the
encrypted settings rows.

### Verify a restore

An untested backup is a guess. Quarterly:

```bash
createdb pakfix_restore_test
pg_restore -d pakfix_restore_test /var/backups/pakfix/pakfix-YYYY-MM-DD_HHMM.dump
psql -d pakfix_restore_test -c 'SELECT count(*) FROM bookings;'
dropdb pakfix_restore_test
```

---

## Disaster recovery

Target: back online within 4 hours, losing at most 24 hours of data.

1. Provision a VPS and install the packages above.
2. Restore `.env` from the secrets store.
3. Restore the newest dump: `pg_restore -d pakfix latest.dump`.
4. Deploy the code at the tag that was live.
5. Re-point DNS; wait for TTL.
6. Check: sign in, load `/api/v1/bootstrap`, create a test booking, confirm the queue drains.

Keep DNS TTL at 300 seconds so step 5 is minutes rather than hours.

---

## Before going live

- [ ] `APP_DEBUG=false`, `APP_ENV=production`
- [ ] `APP_KEY` generated and backed up
- [ ] HTTPS on every hostname; HSTS on
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] Database user has no superuser rights
- [ ] Redis bound to localhost, or password-protected (VPS only; shared hosting uses the file drivers)
- [ ] `php artisan config:cache route:cache view:cache` run
- [ ] Queue worker and scheduler running and verified
- [ ] Shared hosting: `public_html` symlinked to `pakfix/public`, cron entries added
- [ ] Shared hosting: `.env` uses `mysql`, file cache/session, database queue, and `PAKFIX_PUBLIC_DIR` points at the right document root
- [ ] Backups running, and one restore tested
- [ ] Real credentials entered through the admin dashboard, not committed
- [ ] Error tracking wired up
- [ ] Legal pages replaced with copy reviewed by a Pakistani legal adviser
