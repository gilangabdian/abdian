<?php

namespace Tests\Feature;

use App\Models\Photo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PhotoApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create();
    }

    public function test_can_get_all_photos()
    {
        Photo::factory()->count(3)->create();

        $response = $this->getJson('/api/photos');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_admin_can_upload_single_photo()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('photo1.jpg');

        $response = $this->actingAs($this->admin, 'sanctum')
                         ->post('/api/photos', [
                             'image' => $file
                         ]);

        $response->assertStatus(201);
        $this->assertDatabaseCount('photos', 1);
    }

    public function test_admin_can_upload_multiple_photos_at_once()
    {
        Storage::fake('public');

        $file1 = UploadedFile::fake()->image('photo1.jpg');
        $file2 = UploadedFile::fake()->image('photo2.png');
        $file3 = UploadedFile::fake()->image('photo3.webp');

        $response = $this->actingAs($this->admin, 'sanctum')
                         ->post('/api/photos', [
                             'images' => [$file1, $file2, $file3]
                         ]);

        $response->assertStatus(201);
        $this->assertDatabaseCount('photos', 3);
        $this->assertCount(3, $response->json('data'));
    }

    public function test_admin_can_delete_photo()
    {
        $photo = Photo::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')
                         ->deleteJson("/api/photos/{$photo->id}");

        $response->assertStatus(200);
        $this->assertDatabaseCount('photos', 0);
    }

    public function test_unauthorized_user_cannot_upload_or_delete_photo()
    {
        $this->postJson('/api/photos', [])->assertStatus(401);

        $photo = Photo::factory()->create();

        $this->deleteJson("/api/photos/{$photo->id}")->assertStatus(401);
    }

    public function test_admin_can_bulk_delete_photos()
    {
        $photo1 = Photo::factory()->create();
        $photo2 = Photo::factory()->create();
        $photo3 = Photo::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')
                         ->postJson('/api/photos/bulk-delete', [
                             'ids' => [$photo1->id, $photo2->id]
                         ]);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('photos', ['id' => $photo1->id]);
        $this->assertDatabaseMissing('photos', ['id' => $photo2->id]);
        $this->assertDatabaseHas('photos', ['id' => $photo3->id]);
    }
}
