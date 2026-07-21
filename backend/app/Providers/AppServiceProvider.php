<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Jika aplikasi berjalan di environment production (Render), paksa HTTPS
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        // Webhook Trigger untuk Vercel SSG Rebuild
        $models = [
            \App\Models\Artwork::class,
            \App\Models\Blog::class,
            \App\Models\Certificate::class,
            \App\Models\Contact::class,
            \App\Models\Experience::class,
            \App\Models\Photo::class,
            \App\Models\Profile::class,
            \App\Models\Project::class,
            \App\Models\Skill::class,
        ];

        foreach ($models as $model) {
            $model::saved(fn() => \App\Services\VercelWebhookService::trigger());
            $model::deleted(fn() => \App\Services\VercelWebhookService::trigger());
        }
    }
}
