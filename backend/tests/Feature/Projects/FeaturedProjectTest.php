<?php

namespace Tests\Feature\Projects;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeaturedProjectTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_filter_featured_projects()
    {
        // 1. Buat Project yang Featured
        Project::create([
            'title' => 'Featured Project',
            'description' => 'Desc',
            'thumbnail_path' => 'dummy/image.jpg',
            'is_featured' => true,
            'start_date' => '2025-01-01',
            'end_date' => '2025-06-01',
            'status' => 'completed',
        ]);

        // 2. Buat Project yang TIDAK Featured
        Project::create([
            'title' => 'Normal Project 1',
            'description' => 'Desc',
            'thumbnail_path' => 'dummy/image2.jpg',
            'is_featured' => false,
            'start_date' => '2025-02-01',
            'end_date' => '2025-07-01',
            'status' => 'in_development',
        ]);

        // 3. Request ke API
        $response = $this->getJson('/api/projects?featured=1');

        // 4. Assertions
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data') // Pastikan hanya 1 data yang muncul
            ->assertJsonFragment(['title' => 'Featured Project']); // Pastikan judulnya benar
    }
}
