<?php

namespace Tests\Feature\Projects;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProjectControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_store_project_with_thumbnail()
    {
        Storage::fake('public'); // Simulasikan storage
        $user = User::factory()->create();

        $file = UploadedFile::fake()->image('project1.jpg');

        $response = $this->actingAs($user)->postJson('/api/projects', [
            'title' => 'New Project',
            'description' => 'Description here',
            'thumbnail' => $file,
            'start_date' => '2025-01-01',
            'end_date' => '2025-06-01',
            'status' => 'completed',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'New Project');

        // Pastikan thumbnail_url ada di response
        $this->assertNotNull($response->json('data.thumbnail_url'));

        // Cek apakah file benar-benar tersimpan
        $path = Project::first()->thumbnail_path;
        Storage::disk('public')->assertExists($path);
    }

    public function test_can_delete_project_and_its_file()
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $file = UploadedFile::fake()->image('delete-me.jpg');
        $path = $file->store('projects');

        $project = Project::create([
            'title' => 'To Delete',
            'description' => 'Desc',
            'thumbnail_path' => $path,
            'start_date' => '2025-01-01',
            'end_date' => '2025-06-01',
            'status' => 'completed',
        ]);

        $response = $this->actingAs($user)->deleteJson("/api/projects/{$project->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('projects', ['id' => $project->id]);

        // Pastikan file dihapus dari storage
        Storage::disk('public')->assertMissing($path);
    }
}
