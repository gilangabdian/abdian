<?php

namespace Tests\Feature;

use App\Models\AboutPage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AboutPageTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function guest_can_view_about_page()
    {
        // Create sample content
        AboutPage::create([
            'content' => '<h2>About Me</h2><p>Hello world</p>',
        ]);

        $response = $this->getJson('/api/about-page');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'content',
                    'created_at',
                    'updated_at',
                ],
            ]);
    }

    /** @test */
    public function about_page_returns_null_when_not_set_yet()
    {
        $response = $this->getJson('/api/about-page');

        $response->assertStatus(200);
        $this->assertNull($response->json('data'));
    }

    /** @test */
    public function admin_can_update_about_page_content()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/admin/about-page', [
                'content' => '<h2>Updated About</h2><p>This is my story.</p>',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'About page updated successfully.',
            ]);

        $this->assertDatabaseHas('about_pages', [
            'content' => '<h2>Updated About</h2><p>This is my story.</p>',
        ]);
    }

    /** @test */
    public function admin_can_set_content_to_empty()
    {
        $user = User::factory()->create();

        // First create content
        AboutPage::create([
            'content' => '<p>Some content</p>',
        ]);

        // Then set it to empty
        $response = $this->actingAs($user)
            ->putJson('/api/admin/about-page', [
                'content' => '',
            ]);

        $response->assertStatus(200);

        // When content is empty string, nullable column stores it as null
        $this->assertDatabaseHas('about_pages', [
            'content' => null,
        ]);
    }

    /** @test */
    public function guest_cannot_update_about_page()
    {
        $response = $this->putJson('/api/admin/about-page', [
            'content' => '<p>Hacked</p>',
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function admin_can_update_with_long_html_content()
    {
        $user = User::factory()->create();

        $longHtml = '<h2>About Me</h2>'
            . '<p>Long paragraph. ' . str_repeat('word ', 100) . '</p>'
            . '<pre><code>console.log("hello")</code></pre>'
            . '<ul><li>Item 1</li><li>Item 2</li></ul>'
            . '<blockquote class="callout">Note: this is a callout</blockquote>';

        $response = $this->actingAs($user)
            ->putJson('/api/admin/about-page', [
                'content' => $longHtml,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('about_pages', [
            'content' => $longHtml,
        ]);
    }

    /** @test */
    public function about_page_response_structure_is_consistent()
    {
        $user = User::factory()->create();

        // Update with content
        $this->actingAs($user)
            ->putJson('/api/admin/about-page', [
                'content' => '<p>Test</p>',
            ]);

        $response = $this->getJson('/api/about-page');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'content',
                    'created_at',
                    'updated_at',
                ],
            ]);
    }
}
