<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Blog;

class BlogExternalApiTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate()
    {
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user, 'sanctum');
    }

    public function test_can_create_internal_blog_with_content()
    {
        $this->authenticate();

        $data = [
            'title' => 'Internal Blog',
            'content' => '<p>Internal content</p>',
            'is_external' => false,
        ];

        $response = $this->postJson('/api/blogs', $data);

        $response->assertStatus(201)
                 ->assertJsonPath('data.title', 'Internal Blog')
                 ->assertJsonPath('data.is_external', false);
                 
        $this->assertDatabaseHas('blogs', [
            'title' => 'Internal Blog',
            'is_external' => false,
        ]);
    }

    public function test_fails_to_create_internal_blog_without_content()
    {
        $this->authenticate();

        $data = [
            'title' => 'Internal Blog',
            'is_external' => false,
        ];

        $response = $this->postJson('/api/blogs', $data);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['content']);
    }

    public function test_can_create_external_blog_without_content()
    {
        $this->authenticate();

        $data = [
            'title' => 'External Blog',
            'is_external' => true,
            'external_url' => 'https://medium.com/@gilangabdian/my-story',
        ];

        $response = $this->postJson('/api/blogs', $data);

        $response->assertStatus(201)
                 ->assertJsonPath('data.title', 'External Blog')
                 ->assertJsonPath('data.is_external', true)
                 ->assertJsonPath('data.external_url', 'https://medium.com/@gilangabdian/my-story');

        $this->assertDatabaseHas('blogs', [
            'title' => 'External Blog',
            'is_external' => true,
            'external_url' => 'https://medium.com/@gilangabdian/my-story',
        ]);
    }

    public function test_fails_to_create_external_blog_without_url()
    {
        $this->authenticate();

        $data = [
            'title' => 'External Blog',
            'is_external' => true,
        ];

        $response = $this->postJson('/api/blogs', $data);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['external_url']);
    }
}
