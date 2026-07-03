<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Profile;

class ProfileAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate()
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');
    }

    public function test_can_update_is_available_for_work()
    {
        $this->authenticate();

        Profile::create([
            'name' => 'John Doe',
            'job_title' => 'Developer',
            'about_description' => 'Test',
            'is_available_for_work' => true,
        ]);

        $data = [
            'name' => 'John Doe',
            'job_title' => 'Developer',
            'about_description' => 'Test',
            'is_available_for_work' => false,
        ];

        // Ensure we send as multipart or json. Let's use putJson if supported or postJson with _method=PUT.
        // Or in this app it might be postJson to /api/profile since it handles upload?
        // Let's assume POST to /api/profile
        $response = $this->postJson('/api/profile', $data);

        $response->assertStatus(200);

        $this->assertDatabaseHas('profiles', [
            'name' => 'John Doe',
            'is_available_for_work' => false,
        ]);
    }

    public function test_fails_to_update_if_is_available_for_work_is_not_boolean()
    {
        $this->authenticate();

        $data = [
            'name' => 'John Doe',
            'job_title' => 'Developer',
            'about_description' => 'Test',
            'is_available_for_work' => 'Not a boolean',
        ];

        $response = $this->postJson('/api/profile', $data);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['is_available_for_work']);
    }
}
