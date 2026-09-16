# PHP-FPM image for the PakFix API.
ARG PHP_VERSION=8.3
FROM php:${PHP_VERSION}-fpm-alpine

# System packages the extensions below need at build time.
RUN apk add --no-cache \
        postgresql-dev \
        libzip-dev \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        icu-dev \
        oniguruma-dev \
        git \
        unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_pgsql \
        pgsql \
        gd \
        zip \
        intl \
        bcmath \
        opcache \
        pcntl \
    && apk del --no-network postgresql-dev libzip-dev libpng-dev

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Run as a non-root user whose id matches the usual host developer, so files
# created in the bind mount are not owned by root.
ARG UID=1000
ARG GID=1000
RUN addgroup -g ${GID} -S pakfix \
    && adduser -u ${UID} -S pakfix -G pakfix \
    && mkdir -p /var/www/html \
    && chown -R pakfix:pakfix /var/www/html

WORKDIR /var/www/html
USER pakfix

EXPOSE 9000
CMD ["php-fpm"]
