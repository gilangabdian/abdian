<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Config::set('filesystems.default', 'public');
    }

    public function test_admin_can_update_profile_text_only()
    {
        $user = User::factory()->create();

        // Setup data awal (Gunakan 'about_description' sesuai error log)
        Profile::create([
            'name' => 'Old Name',
            'email' => 'old@example.com',
            'job_title' => 'Old Job',
            'about_description' => 'Old Desc', // <--- PERBAIKAN DISINI
            'bio' => 'Old Bio',
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/profile', [
                'name' => 'New Name',
                'email' => 'new@example.com',
                'job_title' => 'New Job',
                'about_description' => 'New Description', // <--- PERBAIKAN DISINI
                'bio' => 'New Bio',
                'hidden_skill_categories' => ['Frontend'],
                'skill_categories_order' => ['Backend', 'UI/UX', 'Frontend'],
                'show_featured_projects_on_home' => false,
                'show_featured_certificates_on_home' => false,
                'show_experiences_on_home' => false,
                'show_tech_on_home' => false,
                'is_about_page_active' => false,
                'is_certificates_page_active' => false,
                'show_resume_button' => false,
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Profile updated successfully']);

        $this->assertDatabaseHas('profiles', [
            'name' => 'New Name',
            'job_title' => 'New Job',
        ]);
        
        $profile = Profile::first();
        $this->assertEquals(['Frontend'], $profile->hidden_skill_categories);
        $this->assertEquals(['Backend', 'UI/UX', 'Frontend'], $profile->skill_categories_order);
        $this->assertFalse($profile->show_featured_projects_on_home);
        $this->assertFalse($profile->show_featured_certificates_on_home);
        $this->assertFalse($profile->show_experiences_on_home);
        $this->assertFalse($profile->show_tech_on_home);
        $this->assertFalse($profile->is_about_page_active);
        $this->assertFalse($profile->is_certificates_page_active);
        $this->assertFalse($profile->show_resume_button);
    }

    public function test_admin_can_upload_photo_secondary_image_and_cv()
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $photo = UploadedFile::fake()->image('avatar.jpg');
        $secondaryData = UploadedFile::fake()->image('illustration.png');
        $cv = UploadedFile::fake()->create('resume.pdf', 100);

        $response = $this->actingAs($user)
            ->postJson('/api/profile', [
                'name' => 'Gilang',
                'email' => 'gilang@test.com',
                'job_title' => 'Fullstack',
                'about_description' => 'Coding', // <--- PERBAIKAN DISINI (Wajib diisi)
                'bio' => 'Hello',
                'hero_photos' => [
                    $photo,
                    $secondaryData,
                    'http://existing-url.com/image.jpg'
                ],
                'cv' => $cv,
            ]);

        // Debugging: Jika masih error, uncomment ini
        // $response->dump();

        $response->assertStatus(200);

        $profile = Profile::first();

        $this->assertNotNull($profile->hero_photos, 'Hero photos array null');
        $this->assertCount(3, $profile->hero_photos);
        $this->assertNotNull($profile->cv_path, 'CV path null');

        $this->assertEquals('http://existing-url.com/image.jpg', $profile->hero_photos[0]);
        Storage::disk('public')->assertExists($profile->hero_photos[1]);
        Storage::disk('public')->assertExists($profile->hero_photos[2]);
    }

    public function test_admin_can_upload_mixed_hero_photos_with_explicit_indices()
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $photo1 = UploadedFile::fake()->image('photo1.jpg');
        $photo2 = UploadedFile::fake()->image('photo2.jpg');
        $url1 = 'http://existing-url.com/img1.jpg';
        $url2 = 'http://existing-url.com/img2.jpg';

        $response = $this->actingAs($user)
            ->post('/api/profile', [
                'name' => 'Gilang',
                'job_title' => 'Fullstack',
                'about_description' => 'Coding',
                'hero_photos' => [
                    0 => $url1,
                    1 => $photo1,
                    2 => $url2,
                    3 => $photo2,
                ],
            ]);

        $response->assertStatus(200);

        $profile = Profile::first();

        $this->assertNotNull($profile->hero_photos, 'Hero photos array null');
        $this->assertCount(4, $profile->hero_photos);

        // Verify all elements are present
        $this->assertContains($url1, $profile->hero_photos);
        $this->assertContains($url2, $profile->hero_photos);
        
        $files = array_diff($profile->hero_photos, [$url1, $url2]);
        $this->assertCount(2, $files);
        foreach ($files as $file) {
            Storage::disk('public')->assertExists($file);
        }
    }

    public function test_upload_exceeds_max_files_limit()
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $photos = [];
        for ($i = 0; $i < 11; $i++) {
            $photos[$i] = UploadedFile::fake()->image("photo{$i}.jpg");
        }

        $response = $this->actingAs($user)
            ->post('/api/profile', [
                'name' => 'Gilang',
                'job_title' => 'Fullstack',
                'about_description' => 'Coding',
                'hero_photos' => $photos,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['hero_photos']);
    }

    public function test_validation_error_works()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/profile', [
                'name' => '',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_profile_index_filters_out_email_social_media()
    {
        // Create profile
        Profile::create([
            'name' => 'Gilang',
            'email' => 'gilang@test.com',
            'job_title' => 'Fullstack',
            'about_description' => 'Coding',
            'bio' => 'Hello',
        ]);

        // Create some contacts
        \App\Models\Contact::create([
            'platform_name' => 'GitHub',
            'url' => 'https://github.com',
            'icon' => 'mdi:github',
        ]);

        \App\Models\Contact::create([
            'platform_name' => 'LinkedIn',
            'url' => 'https://linkedin.com',
            'icon' => 'mdi:linkedin',
        ]);

        \App\Models\Contact::create([
            'platform_name' => 'Email', // Mixed case to test case-insensitivity
            'url' => 'mailto:test@example.com',
            'icon' => 'mdi:email',
        ]);

        \App\Models\Contact::create([
            'platform_name' => 'email', // Lower case
            'url' => 'mailto:test2@example.com',
            'icon' => 'mdi:email',
        ]);

        $response = $this->getJson('/api/profile');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'social_media')
            ->assertJsonMissing(['platform_name' => 'Email'])
            ->assertJsonMissing(['platform_name' => 'email']);
    }
}
