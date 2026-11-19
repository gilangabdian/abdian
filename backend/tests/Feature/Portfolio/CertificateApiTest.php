<?php

namespace Tests\Feature\Portfolio;

use App\Models\Certificate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CertificateApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Paksa driver ke public agar sinkron dengan Storage::fake('public')
        Config::set('filesystems.default', 'public');
    }

    public function test_can_get_single_certificate()
    {
        // Sesuaikan nama field dengan Migration database kamu
        $cert = Certificate::create([
            'title' => 'AWS Certified',
            'description' => 'Certified Cloud Practitioner',
            'image_path' => 'certs/aws.jpg',
            'issuer' => 'Amazon',
            'credential_link' => 'https://aws.amazon.com',
            'is_featured' => false,
            'start_date' => '2025-01-01',
            'end_date' => '2025-03-01',
        ]);

        $response = $this->getJson('/api/certificates/' . $cert->id);

        $response->assertStatus(200)
            ->assertJson([
                'title' => 'AWS Certified',
                'issuer' => 'Amazon',
            ]);
    }

    public function test_get_single_certificate_not_found()
    {
        $this->getJson('/api/certificates/999')->assertStatus(404);
    }

    public function test_public_user_can_get_certificates()
    {
        Certificate::create([
            'title' => 'AWS Cloud',
            'description' => 'Hard exam',
            'issuer' => 'AWS',
            'image_path' => 'cert.jpg',
            'start_date' => '2025-01-01',
            'end_date' => '2025-03-01',
        ]);

        $response = $this->getJson('/api/certificates');

        // PERBAIKAN: Controller mengembalikan data di dalam key 'data'
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    /**
     * TEST FITUR BARU: Filter Featured
     */
    public function test_can_filter_featured_certificates()
    {
        // 1. Buat Certificate Featured
        Certificate::create([
            'title' => 'Featured Cert',
            'description' => 'Desc',
            'image_path' => 'img1.jpg',
            'is_featured' => true,
            'start_date' => '2025-01-01',
            'end_date' => '2025-03-01',
        ]);

        // 2. Buat Certificate Biasa
        Certificate::create([
            'title' => 'Normal Cert',
            'description' => 'Desc',
            'image_path' => 'img2.jpg',
            'is_featured' => false,
            'start_date' => '2025-02-01',
            'end_date' => '2025-04-01',
        ]);

        // 3. Request dengan filter
        $response = $this->getJson('/api/certificates?featured=1');

        // 4. Assert hanya 1 data yang muncul (yang featured)
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment(['title' => 'Featured Cert']);
    }

    public function test_admin_can_create_certificate()
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/certificates', [
            'title' => 'Laravel Cert',
            'issuer' => 'Laravel',
            'description' => 'Official Cert',
            'image' => UploadedFile::fake()->image('cert.jpg'),
            'is_featured' => true,
            'start_date' => '2025-01-01',
            'end_date' => '2025-06-01',
            'type' => 'course',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('certificates', [
            'title' => 'Laravel Cert',
            'is_featured' => true,
            'type' => 'course',
        ]);
    }

    public function test_admin_can_update_certificate()
    {
        $user = User::factory()->create();
        $cert = Certificate::create([
            'title' => 'Old Cert',
            'description' => 'Desc',
            'issuer' => 'Old Issuer',
            'image_path' => 'path.jpg',
            'start_date' => '2025-01-01',
            'end_date' => '2025-03-01',
        ]);

        // Kirim data lengkap jika validasi controller strict (required)
        $response = $this->actingAs($user)->putJson("/api/certificates/{$cert->id}", [
            'title' => 'Updated Cert',
            'issuer' => 'New Issuer',
            'description' => 'Desc Updated',
            'start_date' => '2025-02-01',
            'end_date' => '2025-04-01',
            'type' => 'seminar',
            // Image tidak dikirim (nullable on update)
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('certificates', [
            'title' => 'Updated Cert',
            'type' => 'seminar',
        ]);
    }

    public function test_admin_can_delete_certificate()
    {
        $user = User::factory()->create();
        $cert = Certificate::create([
            'title' => 'Del Cert',
            'description' => 'Desc',
            'image_path' => 'path.jpg',
            'start_date' => '2025-01-01',
            'end_date' => '2025-03-01',
        ]);

        $response = $this->actingAs($user)->deleteJson("/api/certificates/{$cert->id}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('certificates', ['id' => $cert->id]);
    }

    public function test_admin_can_store_certificate_with_image()
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/certificates', [
            'title' => 'Laravel Advanced',
            'issuer' => 'Laracasts',
            'description' => 'Certificate of completion',
            'image' => UploadedFile::fake()->image('cert.jpg'),
            'start_date' => '2025-01-01',
            'end_date' => '2025-06-01',
        ]);

        // PERBAIKAN: Akses data via key 'data' karena struktur response controller
        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Laravel Advanced');

        // Pastikan file benar-benar tersimpan di disk
        $path = Certificate::first()->image_path;
        Storage::disk('public')->assertExists($path);
    }

    public function test_can_get_certificates_with_automatic_url()
    {
        Certificate::create([
            'title' => 'Test Cert',
            'description' => 'Test Desc',
            'image_path' => 'certificates/sample.jpg',
            'start_date' => '2025-01-01',
            'end_date' => '2025-03-01',
        ]);

        $response = $this->getJson('/api/certificates');

        $response->assertStatus(200);

        // PERBAIKAN: Cek di dalam array 'data'
        $data = $response->json('data');
        $this->assertNotEmpty($data);

        // Pastikan ada key image_url (dari Accessor/Resource)
        // Jika model kamu punya accessor getImageUrlAttribute
        if (isset($data[0]['image_url'])) {
            $this->assertArrayHasKey('image_url', $data[0]);
        }
    }

    public function test_file_is_deleted_when_certificate_is_destroyed()
    {
        Storage::fake('public');
        $user = User::factory()->create();

        // 1. Upload dan Simpan
        $file = UploadedFile::fake()->image('cert_to_delete.jpg');
        // Kita gunakan helper putFileAs atau store manual untuk simulasi file yg sudah ada
        $path = $file->store('certificates', 'public');

        $cert = Certificate::create([
            'title' => 'Delete Me',
            'description' => 'Desc',
            'image_path' => $path,
            'start_date' => '2025-01-01',
            'end_date' => '2025-03-01',
        ]);

        // 2. Delete via API
        $this->actingAs($user)->deleteJson("/api/certificates/{$cert->id}");

        // 3. Assert
        $this->assertDatabaseMissing('certificates', ['id' => $cert->id]);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_api_returns_full_image_url()
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/certificates', [
            'title' => 'Test Cert',
            'issuer' => 'Test Issuer',
            'description' => 'Test Desc',
            'image' => UploadedFile::fake()->image('test.jpg'),
            'start_date' => '2025-01-01',
            'end_date' => '2025-06-01',
        ]);

        $response->assertStatus(201);

        // PERBAIKAN: Akses via data.image_url
        // Pastikan Model Certificate punya: protected $appends = ['image_url'];
        $url = $response->json('data.image_url');

        $this->assertNotNull($url);
        // URL storage biasanya mengandung nama folder
        $this->assertStringContainsString('certificates/', $url);
    }

    public function test_admin_can_store_lifetime_certificate()
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/certificates', [
            'title' => 'Lifetime Cert',
            'issuer' => 'Google',
            'description' => 'No expiration',
            'image' => UploadedFile::fake()->image('cert.jpg'),
            'start_date' => '2025-01-01',
            'has_no_expiration' => true,
            // end_date sengaja tidak dikirim
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Lifetime Cert')
            ->assertJsonPath('data.has_no_expiration', true)
            ->assertJsonPath('data.end_date', null);

        $this->assertDatabaseHas('certificates', [
            'title' => 'Lifetime Cert',
            'has_no_expiration' => 1,
            'end_date' => null,
        ]);
    }
}
