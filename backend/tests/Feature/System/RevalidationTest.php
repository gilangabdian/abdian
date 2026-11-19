<?php

namespace Tests\Feature\System;

use App\Services\RevalidationService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RevalidationTest extends TestCase
{
    public function test_revalidation_sends_post_request_to_configured_endpoint()
    {
        Http::fake([
            'https://abdian.my.id/api/revalidate' => Http::response(['revalidated' => true], 200),
        ]);

        config(['services.nextjs.base_url' => 'https://abdian.my.id']);
        config(['services.nextjs.revalidate_secret' => 'secret999']);

        $result = RevalidationService::tag('blogs');

        $this->assertTrue($result);
        Http::assertSent(function (\Illuminate\Http\Client\Request $request) {
            return $request->url() === 'https://abdian.my.id/api/revalidate'
                && $request['tag'] === 'blogs'
                && $request['secret'] === 'secret999';
        });
    }

    public function test_revalidation_handles_trailing_slash_in_base_url_safely()
    {
        Http::fake([
            'https://abdian.my.id/api/revalidate' => Http::response(['revalidated' => true], 200),
        ]);

        // Base URL with trailing slash
        config(['services.nextjs.base_url' => 'https://abdian.my.id/']);
        config(['services.nextjs.revalidate_secret' => 'secret999']);

        $result = RevalidationService::tag('photos');

        $this->assertTrue($result);
        Http::assertSent(function (\Illuminate\Http\Client\Request $request) {
            // Must NOT have double slash
            return $request->url() === 'https://abdian.my.id/api/revalidate'
                && !str_contains($request->url(), '//api/revalidate')
                && $request['tag'] === 'photos';
        });
    }

    public function test_revalidation_returns_false_when_secret_or_base_url_is_missing()
    {
        config(['services.nextjs.base_url' => null]);
        config(['services.nextjs.revalidate_secret' => null]);

        $result = RevalidationService::tag('blogs');

        $this->assertFalse($result);
    }
}
