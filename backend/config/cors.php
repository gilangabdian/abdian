<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
     */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => (function () {
        $envOrigins = env('CORS_ALLOWED_ORIGINS');
        if (!empty($envOrigins)) {
            return array_values(array_filter(array_map('trim', explode(',', $envOrigins))));
        }

        $frontendUrl = env('FRONTEND_URL');

        $defaults = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'https://abdian.my.id',
        ];

        if (!empty($frontendUrl)) {
            $defaults[] = rtrim($frontendUrl, '/');
        }

        return array_values(array_unique(array_filter($defaults)));
    })(),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
