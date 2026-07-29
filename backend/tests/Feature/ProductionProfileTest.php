<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductionProfileTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Skenario 1: Test Update Text Saja (Paling sering gagal karena fillable)
     */
    public function test_it_updates_profile_text_successfully()
    {
        // 1. Login sebagai User
        $user = User::factory()->create();

        // 2. Buat data profile awal
        Profile::create([
            'name' => 'Nama Lama',
            'job_title' => 'Job Lama',
            'about_description' => 'Deskripsi Lama',
        ]);

        // 3. Hit Endpoint Update dengan data baru
        $response = $this->actingAs($user)
            ->postJson('/api/profile', [
                'name' => 'Gilang Ages',
                'job_title' => 'Senior Developer',
                'about_description' => 'Ini deskripsi baru yang harus tersimpan.',
            ]);

        // 4. Cek Response Sukses
        $response->assertStatus(200);

        // 5. [KRUSIAL] Cek Database: Apakah data benar-benar berubah?
        $this->assertDatabaseHas('profiles', [
            'name' => 'Gilang Ages',
            'job_title' => 'Senior Developer',
            'about_description' => 'Ini deskripsi baru yang harus tersimpan.',
        ]);

        // Pastikan data lama sudah hilang
        $this->assertDatabaseMissing('profiles', [
            'name' => 'Nama Lama',
        ]);
    }

    /**
     * Skenario 2: Test Upload Foto (Simulasi Local Storage agar aman dijalankan di CI/CD)
     */
    public function test_it_handles_file_upload_correctly()
    {
        $user = User::factory()->create();
        Storage::fake('public'); // Mock storage agar tidak mengotori folder asli

        $file = UploadedFile::fake()->image('profile.jpg');

        $response = $this->actingAs($user)
            ->postJson('/api/profile', [
                'name' => 'Gilang',
                'job_title' => 'Dev',
                'about_description' => 'Desc',
                'hero_photos' => [$file],
            ]);

        $response->assertStatus(200);

        // Pastikan path tersimpan di DB
        $profile = Profile::first();
        $this->assertNotNull($profile->hero_photos);

        // Pastikan file ada di 'disk' storage fake
        // Note: Controller menyimpan hash name, jadi kita cek folder hero_photos tidak kosong
        $this->assertNotEmpty(Storage::disk('public')->allFiles('hero_photos'));
    }

    /**
     * Skenario 3: Validasi (Safety Net)
     */
    public function test_it_prevents_empty_updates()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/profile', []); // Kirim data kosong

        $response->assertStatus(422) // Harus Error Validation
            ->assertJsonValidationErrors(['name', 'job_title']);
    }
}
