<?php

namespace Tests\Feature;

use App\Models\Artwork;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ArtworkApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create();
    }

    public function test_can_get_all_artworks()
    {
        Artwork::factory()->count(3)->create();

        $response = $this->getJson('/api/artworks');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_admin_can_upload_single_artwork()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('artwork1.jpg');

        $response = $this->actingAs($this->admin, 'sanctum')
                         ->post('/api/artworks', [
                             'image' => $file
                         ]);

        $response->assertStatus(201);
        $this->assertDatabaseCount('artworks', 1);
    }

    public function test_admin_can_upload_multiple_artworks_at_once()
    {
        Storage::fake('public');

        $file1 = UploadedFile::fake()->image('artwork1.jpg');
        $file2 = UploadedFile::fake()->image('artwork2.png');
        $file3 = UploadedFile::fake()->image('artwork3.webp');

        $response = $this->actingAs($this->admin, 'sanctum')
                         ->post('/api/artworks', [
                             'images' => [$file1, $file2, $file3]
                         ]);

        $response->assertStatus(201);
        $this->assertDatabaseCount('artworks', 3);
        $this->assertCount(3, $response->json('data'));
    }

    public function test_admin_can_delete_artwork()
    {
        $artwork = Artwork::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')
                         ->deleteJson("/api/artworks/{$artwork->id}");

        $response->assertStatus(200);
        $this->assertDatabaseCount('artworks', 0);
    }

    public function test_unauthorized_user_cannot_upload_or_delete_artwork()
    {
        $this->postJson('/api/artworks', [])->assertStatus(401);

        $artwork = Artwork::factory()->create();

        $this->deleteJson("/api/artworks/{$artwork->id}")->assertStatus(401);
    }

    public function test_admin_can_bulk_delete_artworks()
    {
        $artwork1 = Artwork::factory()->create();
        $artwork2 = Artwork::factory()->create();
        $artwork3 = Artwork::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')
                         ->postJson('/api/artworks/bulk-delete', [
                             'ids' => [$artwork1->id, $artwork2->id]
                         ]);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('artworks', ['id' => $artwork1->id]);
        $this->assertDatabaseMissing('artworks', ['id' => $artwork2->id]);
        $this->assertDatabaseHas('artworks', ['id' => $artwork3->id]);
    }
}
