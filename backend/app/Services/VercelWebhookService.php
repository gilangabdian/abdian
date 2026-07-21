<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VercelWebhookService
{
    /**
     * Trigger Vercel rebuild webhook.
     */
    public static function trigger()
    {
        $webhookUrl = config('services.vercel.webhook_url');

        if (!$webhookUrl) {
            Log::warning('Vercel Webhook URL is not configured.');
            return false;
        }

        try {
            // Kita pakai POST dan timeout agar tidak membuat backend terlalu lama nge-hang
            $response = Http::timeout(5)->post($webhookUrl);
            
            if ($response->successful()) {
                Log::info('Successfully triggered Vercel webhook.');
                return true;
            } else {
                Log::error('Failed to trigger Vercel webhook.', ['response' => $response->body()]);
                return false;
            }
        } catch (\Exception $e) {
            Log::error('Error triggering Vercel webhook: ' . $e->getMessage());
            return false;
        }
    }
}
