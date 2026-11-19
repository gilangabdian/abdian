<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config; // <--- Wajib import ini
use Tests\TestCase;

class AdminSetupTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Kita setup dulu environment-nya sebelum setiap test jalan.
     * Kita paksa config 'services.admin' berisi data dummy khusus test.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Set config environment hanya untuk sesi testing ini
        // Ini menjamin test tetap jalan meskipun kamu ganti password di .env asli
        Config::set('services.admin.email', 'test_admin@luma.com');
        Config::set('services.admin.password', 'rahasia_test_123');
    }

    /**
     * Test 1: Pastikan Seeder bisa jalan dan membaca config dengan benar.
     */
    public function test_seeder_creates_admin_successfully()
    {
        // 1. Jalankan seeder
        $this->seed();

        // 2. Cek database pakai data dari Config (bukan string manual lagi)
        $this->assertDatabaseHas('users', [
            'email' => config('services.admin.email'), // Dinamis
            'name' => 'Abdian',
        ]);
    }

    /**
     * Test 2: Pastikan kalau seeder dijalankan berkali-kali, tidak error/duplikat.
     */
    public function test_seeder_is_idempotent_no_duplicates()
    {
        // Ambil email target dari config
        $targetEmail = config('services.admin.email');

        // Jalankan seeder 2x (Simulasi deploy ulang)
        $this->seed();
        $this->seed();

        // Pastikan jumlah user dengan email tersebut tetap CUMA 1
        $count = User::where('email', $targetEmail)->count();
        $this->assertEquals(1, $count, 'Admin user tidak boleh ganda.');
    }

    /**
     * Test 3: Pastikan password dari config valid untuk login.
     */
    public function test_admin_can_login_with_seeded_credentials()
    {
        $this->seed();

        // Ambil kredensial test yang sudah kita set di setUp()
        $email = config('services.admin.email');
        $password = config('services.admin.password');

        // Tembak API Login dengan data dinamis
        $response = $this->postJson('api/admin/login', [
            'email' => $email,
            'password' => $password,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'name',
                    'email',
                ],
                'token',
            ]);
    }

    public function test_swagger_documentation_page_loads_correctly()
    {
        $response = $this->get('/api-docs');
        $response->assertStatus(200);
        $response->assertSee('Swagger UI');
    }
}
