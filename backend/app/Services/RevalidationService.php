<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RevalidationService
{
    /**
     * Trigger Next.js on-demand revalidation for a specific cache tag.
     * Fire-and-forget: returns immediately, doesn't block the response.
     */
    public static function tag(string $tag): bool
    {
        $baseUrl = config('services.nextjs.base_url');
        $secret  = config('services.nextjs.revalidate_secret');

        if (!$baseUrl || !$secret) {
            Log::warning('Next.js revalidation config is not set.', [
                'base_url_set' => !is_null($baseUrl),
                'secret_set' => !is_null($secret),
            ]);
            return false;
        }

        try {
            $response = Http::timeout(3)->post("{$baseUrl}/api/revalidate", [
                'tag' => $tag,
                'secret' => $secret,
            ]);

            if ($response->successful()) {
                Log::info("Next.js revalidation triggered successfully for tag: {$tag}.");
                return true;
            }

            Log::warning("Next.js revalidation failed for tag: {$tag}.", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error("Error triggering Next.js revalidation for tag: {$tag}: " . $e->getMessage());
            return false;
        }
    }
}
