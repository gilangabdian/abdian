<?php

namespace Tests\Feature\System;

use App\Models\User;
use App\Models\Visitor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class VisitorTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_log_new_visitor()
    {
        $deviceId = (string) Str::uuid();

        $response = $this->postJson('/api/visitors', [
            'device_id' => $deviceId
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['message', 'data' => ['id', 'device_id']]);

        $this->assertDatabaseHas('visitors', [
            'device_id' => $deviceId
        ]);
    }

    public function test_existing_visitor_is_not_duplicated()
    {
        $deviceId = (string) Str::uuid();

        // First visit
        $this->postJson('/api/visitors', ['device_id' => $deviceId]);
        
        // Second visit
        $response = $this->postJson('/api/visitors', ['device_id' => $deviceId]);

        $response->assertStatus(201);
        
        // Ensure only 1 record exists
        $this->assertDatabaseCount('visitors', 1);
    }

    public function test_visitor_count_returns_correct_number()
    {
        for ($i = 0; $i < 5; $i++) {
            Visitor::create(['device_id' => (string) Str::uuid()]);
        }

        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/admin/visitors/count');

        $response->assertStatus(200)
                 ->assertJson([
                     'data' => [
                         'total_visitors' => 5
                     ]
                 ]);
    }

    public function test_visitor_count_endpoint_is_protected()
    {
        $response = $this->getJson('/api/admin/visitors/count');

        $response->assertStatus(401);
    }
}
