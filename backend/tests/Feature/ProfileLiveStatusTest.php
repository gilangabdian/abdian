<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Profile;

class ProfileLiveStatusTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate()
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');
    }

    public function test_can_update_status_message_and_updates_timestamp()
    {
        $this->authenticate();

        $profile = Profile::create([
            'name' => 'John Doe',
            'job_title' => 'Developer',
            'about_description' => 'Test',
            'status_message' => 'Resting',
            'status_last_updated_at' => now()->subDays(2),
        ]);

        $data = [
            'name' => 'John Doe',
            'job_title' => 'Developer',
            'about_description' => 'Test',
            'status_message' => 'Working hard',
        ];

        $response = $this->postJson('/api/profile', $data);

        $response->assertStatus(200);

        $this->assertDatabaseHas('profiles', [
            'name' => 'John Doe',
            'status_message' => 'Working hard',
        ]);

        // Check if timestamp was updated
        $updatedProfile = Profile::first();
        $this->assertNotEquals($profile->status_last_updated_at, $updatedProfile->status_last_updated_at);
        $this->assertTrue($updatedProfile->status_last_updated_at->isToday());
    }

    public function test_does_not_update_timestamp_if_status_message_is_unchanged()
    {
        $this->authenticate();

        $timestamp = now()->subDays(2);
        $profile = Profile::create([
            'name' => 'John Doe',
            'job_title' => 'Developer',
            'about_description' => 'Test',
            'status_message' => 'Resting',
            'status_last_updated_at' => $timestamp,
        ]);

        $data = [
            'name' => 'John Doe',
            'job_title' => 'Developer',
            'about_description' => 'Test Updated',
            'status_message' => 'Resting',
        ];

        $response = $this->postJson('/api/profile', $data);

        $response->assertStatus(200);

        $updatedProfile = Profile::first();
        $this->assertEquals($timestamp->toDateTimeString(), $updatedProfile->status_last_updated_at->toDateTimeString());
    }
}
