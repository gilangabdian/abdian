<?php

namespace Tests\Feature;

use App\Models\Skill;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SkillApiTest extends TestCase
{
    use RefreshDatabase;

    // Test Get Single Skill (FITUR BARU)
    public function test_can_get_single_skill()
    {
        // 1. Buat data dummy
        $skill = Skill::create([
            'name' => 'Laravel',
            'identifier' => 'laravel',
            'category' => 'Backend',
            'svg' => '<svg>...</svg>',
        ]);

        // 2. Hit endpoint show
        $response = $this->getJson('/api/skills/' . $skill->id);

        // 3. Assert
        $response->assertStatus(200)
            ->assertJson([
                'name' => 'Laravel',
                'identifier' => 'laravel',
            ]);
    }

    // Test 404 jika skill tidak ada
    public function test_get_single_skill_returns_404_if_not_found()
    {
        $response = $this->getJson('/api/skills/9999');
        $response->assertStatus(404);
    }

    public function test_public_user_can_get_skills()
    {
        Skill::create(['name' => 'Laravel', 'category' => 'Backend', 'identifier' => 'simple-icons:laravel']);

        $response = $this->getJson('/api/skills');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_guest_cannot_create_skill()
    {
        $response = $this->postJson('/api/skills', [
            'name' => 'Vue',
            'category' => 'Frontend',
            'identifier' => 'simple-icons:vue',
        ]);
        $response->assertStatus(401);
    }

    public function test_admin_can_create_skill()
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/skills', [
            'name' => 'React',
            'category' => 'Frontend',
            'identifier' => 'simple-icons:react',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('skills', ['name' => 'React']);
    }

    public function test_admin_can_update_skill()
    {
        $user = User::factory()->create();
        $skill = Skill::create(['name' => 'Old Name', 'category' => 'Cloud & DevOps', 'identifier' => 'simple-icons:old']);

        $response = $this->actingAs($user)->putJson("/api/skills/{$skill->id}", [
            'name' => 'New Name',
            'category' => 'Cloud & DevOps',
            'identifier' => 'simple-icons:new',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('skills', ['name' => 'New Name']);
    }

    public function test_admin_can_delete_skill()
    {
        $user = User::factory()->create();
        $skill = Skill::create(['name' => 'To Delete', 'category' => 'Databases', 'identifier' => 'simple-icons:del']);

        $response = $this->actingAs($user)->deleteJson("/api/skills/{$skill->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('skills', ['id' => $skill->id]);
    }
    public function test_admin_can_bulk_delete_skills()
    {
        $user = User::factory()->create();
        $skill1 = Skill::create(['name' => 'To Delete 1', 'category' => 'Databases', 'identifier' => 'del1']);
        $skill2 = Skill::create(['name' => 'To Delete 2', 'category' => 'Frontend', 'identifier' => 'del2']);
        $skill3 = Skill::create(['name' => 'Keep This', 'category' => 'Backend', 'identifier' => 'keep']);

        $response = $this->actingAs($user)->postJson('/api/skills/bulk-delete', [
            'ids' => [$skill1->id, $skill2->id]
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('skills', ['id' => $skill1->id]);
        $this->assertDatabaseMissing('skills', ['id' => $skill2->id]);
        $this->assertDatabaseHas('skills', ['id' => $skill3->id]);
    }
}
