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

        // Should contain static routes
        $response->assertSee('<loc>https://abdian.vercel.app/</loc>', false);
        $response->assertSee('<loc>https://abdian.vercel.app/blogs</loc>', false);

        // Should contain published items
        $response->assertSee('<loc>https://abdian.vercel.app/projects/' . $publishedProject->id . '</loc>', false);
        $response->assertSee('<loc>https://abdian.vercel.app/blogs/' . $publishedBlog->slug . '</loc>', false);

        // Should NOT contain draft items
        $response->assertDontSee($draftBlog->slug);
    }
}
