<?php

namespace Tests\Feature\Portfolio;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_single_contact()
    {
        $contact = Contact::create([
            'platform_name' => 'LinkedIn',
            'url' => 'https://linkedin.com/in/me',
            'icon' => 'mdi:linkedin', // Sudah disesuaikan dengan string Iconify
        ]);

        $response = $this->getJson('/api/contacts/' . $contact->id);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'platform_name' => 'LinkedIn',
                'url' => 'https://linkedin.com/in/me',
            ]);
    }

    public function test_get_single_contact_not_found()
    {
        $this->getJson('/api/contacts/999')->assertStatus(404);
    }

    public function test_public_user_can_get_contacts()
    {
        Contact::create([
            'platform_name' => 'IG',
            'url' => 'https://instagram.com/me',
            'icon' => 'mdi:instagram',
        ]);

        $response = $this->getJson('/api/contacts');
        $response->assertStatus(200);
    }

    public function test_admin_can_create_contact_with_http_url()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/contacts', [
            'platform_name' => 'LinkedIn',
            'url' => 'https://linkedin.com/in/me',
            'icon' => 'mdi:linkedin',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('contacts', ['platform_name' => 'LinkedIn']);
    }

    // TEST BARU: Memastikan URL dengan format mailto: berhasil lolos validasi
    public function test_admin_can_create_contact_with_mailto_url()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/contacts', [
            'platform_name' => 'Email',
            'url' => 'mailto:qbdian@gmail.com',
            'icon' => 'mdi:email',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('contacts', [
            'platform_name' => 'Email',
            'url' => 'mailto:qbdian@gmail.com',
        ]);
    }

    public function test_admin_can_delete_contact()
    {
        $user = User::factory()->create();
        $contact = Contact::create([
            'platform_name' => 'Twitter',
            'url' => 'https://x.com/me',
            'icon' => 'simple-icons:x',
        ]);

        $response = $this->actingAs($user)->deleteJson("/api/contacts/{$contact->id}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('contacts', ['id' => $contact->id]);
    }
}
