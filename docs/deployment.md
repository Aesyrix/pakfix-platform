# Deployment

Two shapes, both supported:

- **One VPS.** Nginx in front of both Laravel and Next.js. Simplest to reason about, cheapest,
  and the default recommendation for launch.
- **Split.** Next.js on Vercel, Laravel on a VPS. Better edge performance, more moving parts.

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
- [ ] Redis bound to localhost, or password-protected
- [ ] `php artisan config:cache route:cache view:cache` run
- [ ] Queue worker and scheduler running and verified
- [ ] Backups running, and one restore tested
- [ ] Real credentials entered through the admin dashboard, not committed
- [ ] Error tracking wired up
- [ ] Legal pages replaced with copy reviewed by a Pakistani legal adviser
