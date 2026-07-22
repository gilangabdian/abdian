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
            'category' => 'Custom UI',
            'identifier' => 'simple-icons:react',
            'is_active_on_home' => false,
            'note' => 'Main Stack',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('skills', [
            'name' => 'React', 
            'is_active_on_home' => false,
            'category' => 'Custom UI',
            'note' => 'Main Stack'
        ]);
    }

    public function test_admin_can_update_skill()
    {
        $user = User::factory()->create();
        $skill = Skill::create(['name' => 'Old Name', 'category' => 'Cloud & DevOps', 'identifier' => 'simple-icons:old']);

        $response = $this->actingAs($user)->putJson("/api/skills/{$skill->id}", [
            'name' => 'New Name',
            'category' => 'Another Custom',
            'identifier' => 'simple-icons:new',
            'is_active_on_home' => false,
            'note' => 'Learning',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('skills', [
            'name' => 'New Name', 
            'is_active_on_home' => false,
            'category' => 'Another Custom',
            'note' => 'Learning'
        ]);
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

    public function test_admin_can_reorder_skills()
    {
        $user = User::factory()->create();
        $skill1 = Skill::create(['name' => 'Skill 1', 'identifier' => 's1', 'order_number' => 0]);
        $skill2 = Skill::create(['name' => 'Skill 2', 'identifier' => 's2', 'order_number' => 1]);
        $skill3 = Skill::create(['name' => 'Skill 3', 'identifier' => 's3', 'order_number' => 2]);

        $response = $this->actingAs($user)->putJson('/api/skills/reorder', [
            'ordered_ids' => [$skill3->id, $skill1->id, $skill2->id]
        ]);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('skills', ['id' => $skill3->id, 'order_number' => 0]);
        $this->assertDatabaseHas('skills', ['id' => $skill1->id, 'order_number' => 1]);
        $this->assertDatabaseHas('skills', ['id' => $skill2->id, 'order_number' => 2]);
    }

    public function test_admin_can_update_category_name()
    {
        $user = User::factory()->create();
        $skill1 = Skill::create(['name' => 'Vue', 'identifier' => 'vue', 'category' => 'OldCategory']);
        $skill2 = Skill::create(['name' => 'React', 'identifier' => 'react', 'category' => 'OldCategory']);
        
        $profile = \App\Models\Profile::create([
            'name' => 'Admin Name',
            'job_title' => 'Admin Job',
            'about_description' => 'About Desc',
            'hero_description' => 'Hero Desc',
            'default_skill_category' => 'OldCategory',
            'hidden_skill_categories' => ['OldCategory', 'OtherCategory']
        ]);

        $response = $this->actingAs($user)->putJson('/api/skills/categories/OldCategory', [
            'newName' => 'NewCategory'
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('skills', ['id' => $skill1->id, 'category' => 'NewCategory']);
        $this->assertDatabaseHas('skills', ['id' => $skill2->id, 'category' => 'NewCategory']);

        $profile->refresh();
        $this->assertEquals('NewCategory', $profile->default_skill_category);
        $this->assertContains('NewCategory', $profile->hidden_skill_categories);
        $this->assertNotContains('OldCategory', $profile->hidden_skill_categories);
    }

    public function test_admin_can_delete_category()
    {
        $user = User::factory()->create();
        $skill1 = Skill::create(['name' => 'Vue', 'identifier' => 'vue', 'category' => 'ToDeleteCategory']);
        $skill2 = Skill::create(['name' => 'React', 'identifier' => 'react', 'category' => 'ToDeleteCategory']);
        
        $profile = \App\Models\Profile::create([
            'name' => 'Admin Name',
            'job_title' => 'Admin Job',
            'about_description' => 'About Desc',
            'hero_description' => 'Hero Desc',
            'default_skill_category' => 'ToDeleteCategory',
            'hidden_skill_categories' => ['ToDeleteCategory', 'OtherCategory']
        ]);

        $response = $this->actingAs($user)->deleteJson('/api/skills/categories/ToDeleteCategory');

        $response->assertStatus(200);

        $this->assertDatabaseHas('skills', ['id' => $skill1->id, 'category' => 'Uncategorized']);
        $this->assertDatabaseHas('skills', ['id' => $skill2->id, 'category' => 'Uncategorized']);

        $profile->refresh();
        $this->assertNull($profile->default_skill_category);
        $this->assertNotContains('ToDeleteCategory', $profile->hidden_skill_categories);
        $this->assertContains('OtherCategory', $profile->hidden_skill_categories);
    }
}
