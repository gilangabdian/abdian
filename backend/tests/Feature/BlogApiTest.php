<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;
use App\Models\User;
use App\Models\Blog;

class BlogApiTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    public function test_can_get_public_published_blogs_only()
    {
        Blog::create([
            'title' => 'Public Blog',
            'content' => 'Content',
            'is_published' => true
        ]);
        Blog::create([
            'title' => 'Draft Blog',
            'content' => 'Content',
            'is_published' => false
        ]);

        $response = $this->getJson('/api/blogs');
        
        $response->assertStatus(200)
                 ->assertJsonCount(1)
                 ->assertJsonFragment(['title' => 'Public Blog'])
                 ->assertJsonMissing(['title' => 'Draft Blog']);
    }

    public function test_admin_can_get_all_blogs()
    {
        Blog::create(['title' => 'Public Blog', 'content' => 'Content', 'is_published' => true]);
        Blog::create(['title' => 'Draft Blog', 'content' => 'Content', 'is_published' => false]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->getJson('/api/admin/blogs');
        
        $response->assertStatus(200)
                 ->assertJsonCount(2);
    }

    public function test_can_get_public_single_blog_by_slug()
    {
        $blog = Blog::create([
            'title' => 'My First Blog',
            'content' => 'Hello World',
            'is_published' => true
        ]);

        $response = $this->getJson('/api/blogs/' . $blog->slug);
        
        $response->assertStatus(200)
                 ->assertJsonFragment(['title' => 'My First Blog']);
    }

    public function test_cannot_get_draft_single_blog_publicly()
    {
        $blog = Blog::create([
            'title' => 'My Draft',
            'content' => 'Hello World',
            'is_published' => false
        ]);

        $response = $this->getJson('/api/blogs/' . $blog->slug);
        
        $response->assertStatus(404);
    }

    public function test_admin_can_create_blog_and_calculates_read_time_and_slug_correctly()
    {
        // 400 words
        $content = str_repeat("Word ", 400);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson('/api/blogs', [
                             'title' => 'Test Auto Slug',
                             'title_en' => 'Test Auto Slug EN',
                             'content' => $content,
                             'content_en' => 'Content EN',
                             'is_published' => true
                         ]);
        
        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'title' => 'Test Auto Slug',
                     'title_en' => 'Test Auto Slug EN',
                     'slug' => 'test-auto-slug',
                     'read_time' => 2 // 400 words / 200 words per min = 2
                 ]);
    }

    public function test_unique_slug_generation_on_duplicate_title()
    {
        Blog::create(['title' => 'Duplicate Title', 'content' => 'Content']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson('/api/blogs', [
                             'title' => 'Duplicate Title',
                             'content' => 'Other Content',
                         ]);
        
        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'slug' => 'duplicate-title-1'
                 ]);
    }

    public function test_admin_can_update_blog()
    {
        $blog = Blog::create(['title' => 'Old Title', 'content' => 'Old Content']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->putJson('/api/blogs/' . $blog->id, [
                             'title' => 'New Title',
                             'content' => 'New Content',
                         ]);
        
        $response->assertStatus(200)
                 ->assertJsonFragment(['title' => 'New Title', 'slug' => 'new-title']);
    }

    public function test_admin_can_delete_blog()
    {
        $blog = Blog::create(['title' => 'To Delete', 'content' => 'Content']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->deleteJson('/api/blogs/' . $blog->id);
        
        $response->assertStatus(200);
        $this->assertDatabaseMissing('blogs', ['id' => $blog->id]);
    }

    public function test_admin_can_upload_inline_image_locally()
    {
        Storage::fake('public');
        config(['filesystems.default' => 'local']);

        $file = UploadedFile::fake()->image('test_inline.jpg');

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson('/api/blogs/upload-image', [
                             'image' => $file
                         ]);
        
        $response->assertStatus(200)
                 ->assertJsonStructure(['url']);

        // Check file exists in folder
        $files = Storage::disk('public')->files('blogs_inline');
        $this->assertCount(1, $files);
    }

    public function test_admin_can_upload_svg_inline_image_locally()
    {
        Storage::fake('public');
        config(['filesystems.default' => 'local']);

        // Create a fake SVG file
        $file = UploadedFile::fake()->create('animation.svg', 100, 'image/svg+xml');

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson('/api/blogs/upload-image', [
                             'image' => $file
                         ]);
        
        $response->assertStatus(200)
                 ->assertJsonStructure(['url']);

        // Check file exists in folder
        $files = Storage::disk('public')->files('blogs_inline');
        $this->assertCount(1, $files);
    }

    public function test_revalidation_is_called_on_blog_create()
    {
        Http::fake([
            '*/api/revalidate' => Http::response(['revalidated' => true], 200),
        ]);

        config(['services.nextjs.base_url' => 'http://localhost:5173']);
        config(['services.nextjs.revalidate_secret' => 'test-secret']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson('/api/blogs', [
                             'title' => 'Revalidation Test',
                             'content' => 'Testing revalidation trigger on create',
                             'is_published' => true,
                         ]);

        $response->assertStatus(201);

        Http::assertSent(function (\Illuminate\Http\Client\Request $request) {
            return str_contains($request->url(), '/api/revalidate')
                && $request['tag'] === 'blogs'
                && $request['secret'] === 'test-secret';
        });
    }

    public function test_revalidation_is_called_on_blog_update()
    {
        Http::fake([
            '*/api/revalidate' => Http::response(['revalidated' => true], 200),
        ]);

        config(['services.nextjs.base_url' => 'http://localhost:5173']);
        config(['services.nextjs.revalidate_secret' => 'test-secret']);

        $blog = Blog::create(['title' => 'Original', 'content' => 'Original Content']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->putJson('/api/blogs/' . $blog->id, [
                             'title' => 'Updated',
                             'content' => 'Updated Content',
                         ]);

        $response->assertStatus(200);

        Http::assertSent(function (\Illuminate\Http\Client\Request $request) {
            return str_contains($request->url(), '/api/revalidate')
                && $request['tag'] === 'blogs';
        });
    }

    public function test_revalidation_is_called_on_blog_delete()
    {
        Http::fake([
            '*/api/revalidate' => Http::response(['revalidated' => true], 200),
        ]);

        config(['services.nextjs.base_url' => 'http://localhost:5173']);
        config(['services.nextjs.revalidate_secret' => 'test-secret']);

        $blog = Blog::create(['title' => 'To Delete Reval', 'content' => 'Content']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->deleteJson('/api/blogs/' . $blog->id);

        $response->assertStatus(200);

        Http::assertSent(function (\Illuminate\Http\Client\Request $request) {
            return str_contains($request->url(), '/api/revalidate')
                && $request['tag'] === 'blogs';
        });
    }

    public function test_revalidation_does_not_block_response_if_nextjs_unreachable()
    {
        // When Next.js is not running, revalidation silently fails and doesn't block CRUD

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
                         ->postJson('/api/blogs', [
                             'title' => 'Unreachable Next Test',
                             'content' => 'Content',
                             'is_published' => true,
                         ]);

        $response->assertStatus(201);
    }

    /** @test */
    public function public_blog_list_response_has_expected_columns()
    {
        // Create a published blog with all fields populated
        Blog::create([
            'title' => 'Test Blog',
            'title_en' => 'Test Blog EN',
            'content' => '<p>Content</p>',
            'content_en' => '<p>Content EN</p>',
            'is_published' => true,
            'is_external' => false,
            'read_time' => 5,
        ]);

        $response = $this->getJson('/api/blogs');

        $response->assertStatus(200)
                 ->assertJsonCount(1);

        $blog = $response->json()[0];

        // Must have these columns (list view only - content/content_en excluded for cache size)
        $this->assertArrayHasKey('id', $blog);
        $this->assertArrayHasKey('title', $blog);
        $this->assertArrayHasKey('title_en', $blog);
        $this->assertArrayHasKey('slug', $blog);
        $this->assertArrayHasKey('read_time', $blog);
        $this->assertArrayHasKey('is_external', $blog);
        $this->assertArrayHasKey('external_url', $blog);
        $this->assertArrayHasKey('created_at', $blog);

        // Must NOT have content/content_en in list response
        $this->assertArrayNotHasKey('content', $blog, 'content should not be in list response to keep size < 2MB');
        $this->assertArrayNotHasKey('content_en', $blog, 'content_en should not be in list response to keep size < 2MB');

        // Verify no unexpected columns
        $allowedKeys = ['id', 'title', 'title_en', 'slug', 'type', 'read_time', 'is_external', 'external_url', 'created_at', 'updated_at'];
        foreach ($blog as $key => $value) {
            $this->assertContains($key, $allowedKeys, "Unexpected key '{$key}' found in blog list response");
        }
    }

    public function test_can_filter_by_type_blog_and_note()
    {
        Blog::create(['title' => 'Blog Post', 'content' => 'Content', 'type' => 'blog', 'is_published' => true]);
        Blog::create(['title' => 'Note Post', 'content' => 'Content', 'type' => 'note', 'is_published' => true]);

        // Default should be blog
        $response = $this->getJson('/api/blogs');
        $response->assertStatus(200)
                 ->assertJsonCount(1)
                 ->assertJsonFragment(['type' => 'blog']);

        // Type note
        $response2 = $this->getJson('/api/blogs?type=note');
        $response2->assertStatus(200)
                  ->assertJsonCount(1)
                  ->assertJsonFragment(['type' => 'note']);
    }
}
