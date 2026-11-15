<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Blog;
use App\Models\Project;

class SitemapApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_sitemap_returns_valid_xml_with_public_urls()
    {
        config(['app.frontend_url' => 'https://abdian.my.id']);

        // Create published and draft items
        $publishedProject = Project::create([
            'title' => 'Published Project',
            'category' => 'Web',
            'image_url' => 'http://test.com/img.jpg',
            'thumbnail_path' => 'projects/img.jpg',
            'description' => 'Test',
            'start_date' => '2023-01-01',
            'status' => 'completed',
            'role' => 'Developer',
        ]);

        $publishedBlog = Blog::create([
            'title' => 'Published Blog',
            'slug' => 'published-blog',
            'excerpt' => 'Test',
            'content' => 'Test Content',
            'read_time' => '1 min read',
            'thumbnail_path' => 'blogs/img.jpg',
            'is_published' => true,
        ]);

        $draftBlog = Blog::create([
            'title' => 'Draft Blog',
            'slug' => 'draft-blog',
            'excerpt' => 'Test',
            'content' => 'Test Content',
            'read_time' => '1 min read',
            'thumbnail_path' => 'blogs/img.jpg',
            'is_published' => false,
        ]);

        $response = $this->get('/api/sitemap');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/xml; charset=UTF-8');

        // Should contain static routes with https://abdian.my.id
        $response->assertSee('<loc>https://abdian.my.id/</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/blogs</loc>', false);

        // Should contain published items
        $response->assertSee('<loc>https://abdian.my.id/projects/' . $publishedProject->id . '</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/blogs/' . $publishedBlog->slug . '</loc>', false);

        // Should NOT contain draft items
        $response->assertDontSee($draftBlog->slug);
    }

    public function test_sitemap_uses_configured_frontend_url()
    {
        config(['app.frontend_url' => 'http://localhost:3000']);

        $response = $this->get('/api/sitemap');

        $response->assertStatus(200);
        $response->assertSee('<loc>http://localhost:3000/</loc>', false);
        $response->assertSee('<loc>http://localhost:3000/blogs</loc>', false);
    }
}
