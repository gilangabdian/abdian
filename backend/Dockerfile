# Gunakan image PHP 8.2 dengan Apache
FROM php:8.2-apache

# Install dependencies sistem yang diperlukan
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    curl \
    libpq-dev \
    libzip-dev \
    && docker-php-ext-install pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip

# Konfigurasi Apache Document Root ke folder /public Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Aktifkan mod_rewrite untuk URL Laravel
RUN a2enmod rewrite

# Menambahkan konfigurasi kustom untuk menaikkan batas upload PHP menjadi 100MB
RUN echo "upload_max_filesize = 100M" > /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 100M" >> /usr/local/etc/php/conf.d/uploads.ini

# Install Composer dari image official
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy seluruh file project ke dalam container
COPY . .

# Install dependensi PHP via Composer (Mode Production)
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Set permission folder storage dan bootstrap/cache agar bisa ditulisi
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# --- TAMBAHKAN BARIS INI ---
# Pastikan entrypoint executable
RUN chmod +x docker-entrypoint.sh

# Expose port 80 (Render mengharapkan port ini secara default)
EXPOSE 80

# Command default saat container jalan (jalankan Apache di foreground)
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["apache2-foreground"]
