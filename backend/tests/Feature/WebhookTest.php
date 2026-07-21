<?php

namespace Tests\Feature;

use App\Models\Blog;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_vercel_webhook_is_triggered_on_model_save()
    {
        Http::fake([
            '*' => Http::response('ok', 200),
        ]);

        config(['services.vercel.webhook_url' => 'https://api.vercel.com/v1/integrations/deploy/test_hook']);

        // Trigger save event
        Project::create([
            'title' => 'Test Project',
            'description' => 'Test',
            'thumbnail_path' => 'test.jpg',
            'link' => 'https://test.com'
        ]);

        Http::assertSent(function (\Illuminate\Http\Client\Request $request) {
            return $request->url() == 'https://api.vercel.com/v1/integrations/deploy/test_hook';
        });
    }

    public function test_prerender_routes_returns_json_array()
    {
        Blog::create([
            'title' => 'Test Blog', 
            'slug' => 'test-blog',
            'content' => 'Test',
            'is_published' => true
        ]);

        $response = $this->get('/api/prerender-routes');

        $response->assertStatus(200);
        
        $routes = $response->json();
        
        $this->assertIsArray($routes);
        $this->assertContains('/', $routes);
        $this->assertContains('/about', $routes);
        $this->assertTrue(collect($routes)->contains(fn($url) => str_contains($url, '/blogs/')));
    }
}
