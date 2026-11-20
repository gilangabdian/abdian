<?php

namespace Tests\Feature\System;

use App\Models\Blog;
use App\Models\Profile;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SitemapApiTest extends TestCase
{
    use RefreshDatabase;

    private function createProfile(array $overrides = []): Profile
    {
        return Profile::create(array_merge([
            'name' => 'Gilang Abdian',
            'job_title' => 'Software Engineer',
            'about_description' => 'Test description',
            'is_about_page_active' => true,
            'is_certificates_page_active' => true,
            'is_projects_page_active' => true,
        ], $overrides));
    }

    public function test_sitemap_returns_valid_xml_with_public_urls()
    {
        config(['app.frontend_url' => 'https://abdian.my.id']);

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

        // Ensure XML is well-formed
        $parsedXml = simplexml_load_string($response->getContent());
        $this->assertNotFalse($parsedXml);

        // Should contain all active static routes (defaults to active when Profile is absent)
        $response->assertSee('<loc>https://abdian.my.id/</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/about</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/projects</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/projects/day-one</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/blogs</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/certificates</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/artworks</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/photos</loc>', false);

        // Should contain published blogs
        $response->assertSee('<loc>https://abdian.my.id/blogs/' . $publishedBlog->slug . '</loc>', false);

        // Should NOT contain dead routes (/projects/{id}, /contacts) or draft blogs
        $response->assertDontSee('<loc>https://abdian.my.id/projects/' . $publishedProject->id . '</loc>', false);
        $response->assertDontSee('<loc>https://abdian.my.id/contacts</loc>', false);
        $response->assertDontSee($draftBlog->slug);
    }

    public function test_sitemap_excludes_about_and_certificates_when_toggled_off_in_profile()
    {
        config(['app.frontend_url' => 'https://abdian.my.id']);

        $this->createProfile([
            'is_about_page_active' => false,
            'is_certificates_page_active' => false,
        ]);

        $response = $this->get('/api/sitemap');

        $response->assertStatus(200);
        $response->assertDontSee('<loc>https://abdian.my.id/about</loc>', false);
        $response->assertDontSee('<loc>https://abdian.my.id/certificates</loc>', false);

        // Core public routes must remain present
        $response->assertSee('<loc>https://abdian.my.id/</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/projects</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/projects/day-one</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/blogs</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/artworks</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/photos</loc>', false);
    }

    public function test_sitemap_includes_about_and_certificates_when_toggled_on_in_profile()
    {
        config(['app.frontend_url' => 'https://abdian.my.id']);

        $this->createProfile([
            'is_about_page_active' => true,
            'is_certificates_page_active' => true,
        ]);

        $response = $this->get('/api/sitemap');

        $response->assertStatus(200);
        $response->assertSee('<loc>https://abdian.my.id/about</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/certificates</loc>', false);
    }

    public function test_sitemap_handles_partial_page_toggles_independently()
    {
        config(['app.frontend_url' => 'https://abdian.my.id']);

        $profile = $this->createProfile([
            'is_about_page_active' => true,
            'is_certificates_page_active' => false,
        ]);

        $response = $this->get('/api/sitemap');
        $response->assertStatus(200);
        $response->assertSee('<loc>https://abdian.my.id/about</loc>', false);
        $response->assertDontSee('<loc>https://abdian.my.id/certificates</loc>', false);

        // Flip toggles independently
        $profile->update([
            'is_about_page_active' => false,
            'is_certificates_page_active' => true,
        ]);

        $responseAfterFlip = $this->get('/api/sitemap');
        $responseAfterFlip->assertStatus(200);
        $responseAfterFlip->assertDontSee('<loc>https://abdian.my.id/about</loc>', false);
        $responseAfterFlip->assertSee('<loc>https://abdian.my.id/certificates</loc>', false);
    }

    public function test_sitemap_excludes_projects_and_day_one_when_projects_page_toggled_off()
    {
        config(['app.frontend_url' => 'https://abdian.my.id']);

        $this->createProfile([
            'is_projects_page_active' => false,
        ]);

        $response = $this->get('/api/sitemap');

        $response->assertStatus(200);
        $response->assertDontSee('<loc>https://abdian.my.id/projects</loc>', false);
        $response->assertDontSee('<loc>https://abdian.my.id/projects/day-one</loc>', false);

        // Other active public routes must remain present
        $response->assertSee('<loc>https://abdian.my.id/</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/about</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/blogs</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/certificates</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/artworks</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/photos</loc>', false);
    }

    public function test_sitemap_includes_projects_and_day_one_when_projects_page_toggled_on()
    {
        config(['app.frontend_url' => 'https://abdian.my.id']);

        $this->createProfile([
            'is_projects_page_active' => true,
        ]);

        $response = $this->get('/api/sitemap');

        $response->assertStatus(200);
        $response->assertSee('<loc>https://abdian.my.id/projects</loc>', false);
        $response->assertSee('<loc>https://abdian.my.id/projects/day-one</loc>', false);
    }

    public function test_sitemap_uses_configured_frontend_url()
    {
        config(['app.frontend_url' => 'https://custom.example.com/']);

        $response = $this->get('/api/sitemap');

        $response->assertStatus(200);
        $response->assertSee('<loc>https://custom.example.com/</loc>', false);
        $response->assertSee('<loc>https://custom.example.com/projects/day-one</loc>', false);
        $response->assertSee('<loc>https://custom.example.com/blogs</loc>', false);
    }

    public function test_prerender_routes_respects_profile_page_toggles_and_excludes_dead_routes()
    {
        $project = Project::create([
            'title' => 'Sample Project',
            'category' => 'Web',
            'image_url' => 'http://test.com/img.jpg',
            'thumbnail_path' => 'projects/img.jpg',
            'description' => 'Test',
            'start_date' => '2023-01-01',
            'status' => 'completed',
            'role' => 'Developer',
        ]);

        Blog::create([
            'title' => 'Published Post',
            'slug' => 'published-post',
            'excerpt' => 'Test',
            'content' => 'Test Content',
            'read_time' => '1 min read',
            'thumbnail_path' => 'blogs/img.jpg',
            'is_published' => true,
        ]);

        Blog::create([
            'title' => 'Draft Post',
            'slug' => 'draft-post',
            'excerpt' => 'Test',
            'content' => 'Test Content',
            'read_time' => '1 min read',
            'thumbnail_path' => 'blogs/img.jpg',
            'is_published' => false,
        ]);

        $profile = $this->createProfile([
            'is_about_page_active' => false,
            'is_certificates_page_active' => false,
            'is_projects_page_active' => false,
        ]);

        // Toggles OFF
        $responseOff = $this->get('/api/prerender-routes');
        $responseOff->assertStatus(200);
        $routesOff = $responseOff->json();

        $this->assertContains('/', $routesOff);
        $this->assertContains('/blogs', $routesOff);
        $this->assertContains('/artworks', $routesOff);
        $this->assertContains('/photos', $routesOff);
        $this->assertContains('/blogs/published-post', $routesOff);

        $this->assertNotContains('/about', $routesOff);
        $this->assertNotContains('/certificates', $routesOff);
        $this->assertNotContains('/projects', $routesOff);
        $this->assertNotContains('/projects/day-one', $routesOff);
        $this->assertNotContains('/contacts', $routesOff);
        $this->assertNotContains('/projects/' . $project->id, $routesOff);
        $this->assertNotContains('/blogs/draft-post', $routesOff);

        // Toggles ON
        $profile->update([
            'is_about_page_active' => true,
            'is_certificates_page_active' => true,
            'is_projects_page_active' => true,
        ]);

        $responseOn = $this->get('/api/prerender-routes');
        $responseOn->assertStatus(200);
        $routesOn = $responseOn->json();

        $this->assertContains('/about', $routesOn);
        $this->assertContains('/certificates', $routesOn);
        $this->assertContains('/projects', $routesOn);
        $this->assertContains('/projects/day-one', $routesOn);
        $this->assertNotContains('/contacts', $routesOn);
        $this->assertNotContains('/projects/' . $project->id, $routesOn);
    }
}
