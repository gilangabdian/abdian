<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProjectApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_user_can_get_projects_with_skills()
    {
        // 1. Buat Skill (PERBAIKAN: Gunakan 'identifier' sesuai migration, bukan 'icon_path')
        $skill = Skill::create([
            'name' => 'Laravel',
            'identifier' => 'icons/laravel.svg',
            'category' => 'backend',
        ]);

        // 2. Buat Project
        $project = Project::create([
            'title' => 'Test Project',
            'description' => 'Desc',
            'thumbnail_path' => 'projects/img.jpg',
            'is_featured' => true,
            'start_date' => '2025-01-01',
            'end_date' => '2025-06-01',
            'status' => 'completed',
            'team_size' => 3,
            'role' => 'Fullstack Developer',
        ]);

        // 3. Hubungkan Project dengan Skill
        $project->skills()->attach($skill->id);

        // 4. Hit Endpoint
        $response = $this->getJson('/api/projects');

        // 5. Assertions
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'start_date',
                        'end_date',
                        'status',
                        'skills' => [ // Memastikan relasi skills muncul
                            '*' => ['id', 'name', 'identifier'],
                        ],
                    ],
                ],
            ]);

        // Verifikasi data spesifik
        $this->assertEquals('Laravel', $response->json('data.0.skills.0.name'));
    }

    public function test_guest_cannot_create_project()
    {
        // Mencoba POST tanpa login (tanpa token)
        $response = $this->postJson('/api/projects', [
            'title' => 'Hacked Project',
        ]);

        // Harusnya 401 Unauthorized
        $response->assertStatus(401);
    }

    public function test_admin_can_create_project_with_image_and_skills()
    {
        Storage::fake('public');

        // Buat User untuk login
        $user = User::factory()->create();

        // Buat Skill untuk dipilih (PERBAIKAN: Gunakan 'identifier')
        $skill = Skill::create([
            'name' => 'VueJS',
            'identifier' => 'icons/vue.svg',
            'category' => 'frontend',
        ]);

        // Login sebagai User & Kirim Request
        $response = $this->actingAs($user)->postJson('/api/projects', [
            'title' => 'New Portfolio',
            'description' => 'Awesome project',
            'thumbnail' => UploadedFile::fake()->image('thumb.jpg'),
            'tech_stack_ids' => [$skill->id], // Kirim array ID skill
            'start_date' => '2025-03-01',
            'end_date' => '2025-09-01',
            'status' => 'in_development',
            'type' => 'web_development',
            'team_size' => 5,
            'role' => 'Lead Backend',
        ]);

        // Harusnya 201 Created
        $response->assertStatus(201);

        // Cek Database Projects
        $this->assertDatabaseHas('projects', [
            'title' => 'New Portfolio',
            'status' => 'in_development',
            'type' => 'web_development',
            'team_size' => 5,
            'role' => 'Lead Backend',
        ]);

        // Cek Relasi di Database Pivot
        $this->assertDatabaseHas('project_skill', [
            'skill_id' => $skill->id,
        ]);

        // Cek apakah file thumbnail tersimpan
        $thumbnailPath = $response->json('data.thumbnail_path');
        Storage::disk('public')->assertExists($thumbnailPath);

        // Cek apakah response mengembalikan skills yang baru di-attach
        $this->assertEquals('VueJS', $response->json('data.skills.0.name'));
    }

    public function test_can_update_project_and_set_nullable_fields_to_null()
    {
        $user = User::factory()->create();
        \Laravel\Sanctum\Sanctum::actingAs($user);

        $project = Project::create([
            'title' => 'Test Project for Null',
            'description' => 'Desc',
            'thumbnail_path' => 'projects/img_null_test.jpg',
            'start_date' => '2025-01-01',
            'end_date' => '2025-06-01',
            'status' => 'completed',
            'type' => 'web_development',
            'team_size' => 5,
            'role' => 'Lead Developer',
        ]);

        $response = $this->putJson("/api/projects/{$project->id}", [
            'title' => 'Updated Project',
            'description' => 'Updated Description',
            'start_date' => '2025-01-01',
            'end_date' => '2025-06-01',
            'status' => 'completed',
            'type' => 'web_development',
            // Simulate sending empty strings from frontend FormRequest
            'team_size' => '',
            'role' => '',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'team_size' => null,
            'role' => null,
            'title' => 'Updated Project',
        ]);
    }

    public function test_can_create_project_with_null_end_date()
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/projects', [
            'title' => 'Ongoing Project',
            'description' => 'No end date yet',
            'thumbnail' => UploadedFile::fake()->image('thumb.jpg'),
            'start_date' => '2025-01-01',
            'end_date' => null, // end_date is null
            'status' => 'in_development',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('projects', [
            'title' => 'Ongoing Project',
            'end_date' => null,
        ]);
    }
}
