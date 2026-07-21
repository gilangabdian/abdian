<?php

namespace Tests\Feature;

use App\Models\Experience;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExperienceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_single_experience()
    {
        $experience = Experience::create([
            'company_name' => 'Google',
            'role' => 'Software Engineer',
            'status' => 'Full-time',
            'location' => 'Mountain View, CA', // Tambahkan location
            'start_date' => '2022-01-01',
            'description' => 'Working on cool stuff',
        ]);

        $response = $this->getJson('/api/experiences/' . $experience->id);

        $response->assertStatus(200)
            ->assertJson([
                'company_name' => 'Google',
                'location' => 'Mountain View, CA', // Pastikan location ada di response
            ]);
    }

    public function test_get_single_experience_not_found()
    {
        $this->getJson('/api/experiences/999')->assertStatus(404);
    }

    public function test_public_user_can_get_experiences()
    {
        Experience::create([
            'company_name' => 'Google',
            'role' => 'Dev',
            'status' => 'Full-time',
            'location' => 'Remote',
            'start_date' => '2023-01-01',
            'description' => 'Working hard',
            'is_active' => true,
        ]);
        
        Experience::create([
            'company_name' => 'Facebook',
            'role' => 'Dev',
            'status' => 'Full-time',
            'location' => 'Remote',
            'start_date' => '2022-01-01',
            'description' => 'Working hard',
            'is_active' => false,
        ]);

        // Admin (tanpa ?active=1) mendapat semua
        $response = $this->getJson('/api/experiences');
        $response->assertStatus(200)->assertJsonCount(2);
        
        // Public (dengan ?active=1) mendapat hanya yang active
        $responsePublic = $this->getJson('/api/experiences?active=1');
        $responsePublic->assertStatus(200)->assertJsonCount(1);
        $responsePublic->assertJsonFragment(['company_name' => 'Google']);
        $responsePublic->assertJsonMissing(['company_name' => 'Facebook']);
    }

    public function test_admin_can_create_experience()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/experiences', [
            'company_name' => 'Facebook',
            'role' => 'Senior Dev',
            'status' => 'Full-time',
            'location' => 'Remote', // Tambahkan location
            'start_date' => '2024-01-01',
            'description' => 'Coding React',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('experiences', [
            'company_name' => 'Facebook',
            'location' => 'Remote', // Pastikan tersimpan di database
        ]);
    }

    public function test_admin_can_create_education_experience()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/experiences', [
            'company_name' => 'Universitas Sebelas Maret',
            'role' => 'D3 Teknik Informatika',
            'status' => 'Education', // Menggunakan status baru
            'location' => 'Surakarta, Indonesia',
            'start_date' => '2023-08-01', // Sesuaikan tahun masuk
            'description' => 'Fokus pada pengembangan perangkat lunak dan teknologi informasi.',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('experiences', [
            'company_name' => 'Universitas Sebelas Maret',
            'status' => 'Education',
        ]);
    }

    public function test_admin_can_update_experience()
    {
        $user = User::factory()->create();
        $exp = Experience::create([
            'company_name' => 'Start',
            'role' => 'Dev',
            'status' => 'Intern',
            'location' => 'Remote',
            'start_date' => '2023-01-01',
            'description' => 'Desc',
        ]);

        $response = $this->actingAs($user)->putJson("/api/experiences/{$exp->id}", [
            'company_name' => 'Updated Corp',
            'role' => 'Lead Dev',
            'location' => 'Indonesia',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('experiences', ['company_name' => 'Updated Corp']);
    }

    public function test_admin_can_delete_experience()
    {
        $user = User::factory()->create();
        $exp = Experience::create([
            'company_name' => 'Del Corp',
            'role' => 'Dev',
            'status' => 'Intern',
            'location' => 'Remote',
            'start_date' => '2023-01-01',
            'description' => 'Desc',
        ]);

        $response = $this->actingAs($user)->deleteJson("/api/experiences/{$exp->id}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('experiences', ['id' => $exp->id]);
    }
}
