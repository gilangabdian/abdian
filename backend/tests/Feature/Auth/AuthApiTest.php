<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase; // Ini penting! Biar database test bersih terus

    /**
     * Test Admin bisa login dengan password yang benar.
     */
    public function test_admin_can_login_with_correct_credentials()
    {
        // 1. Kita buat user dummy di database (seolah-olah hasil seeder)
        $user = User::factory()->create([
            'email' => 'qbdian@gmail.com',
            'password' => Hash::make('haloqbdian2121'),
        ]);

        // 2. Kita coba hit endpoint login
        $response = $this->postJson('/api/admin/login', [
            'email' => 'qbdian@gmail.com',
            'password' => 'haloqbdian2121',
        ]);

        // 3. Harapannya: Status 200 OK dan ada token di respon
        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user',
                'token',
            ]);
    }

    /**
     * Test Admin GAGAL login jika password salah.
     */
    public function test_admin_cannot_login_with_wrong_password()
    {
        // 1. Buat user
        User::factory()->create([
            'email' => 'qbdian@gmail.com',
            'password' => Hash::make('haloqbdian2121'),
        ]);

        // 2. Login pakai password ngawur
        $response = $this->postJson('/api/admin/login', [
            'email' => 'qbdian@gmail.com',
            'password' => 'salahbanget',
        ]);

        // 3. Harapannya: Status 401 Unauthorized
        $response->assertStatus(401);
    }
}
