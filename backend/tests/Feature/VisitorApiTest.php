<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Visitor;
use App\Models\User;
use Illuminate\Support\Facades\Http;

class VisitorApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_log_visitor_with_device_details()
    {
        $response = $this->withHeaders([
            'User-Agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        ])->postJson('/api/visitors', [
            'device_id' => 'device-123',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('visitors', [
            'device_id' => 'device-123',
        ]);
    }

    public function test_returning_visitor_updates_device_details()
    {
        // Simulate a visitor first logged without device data (or old data)
        Visitor::create([
            'device_id' => 'returning-device-456',
            'device_type' => 'unknown',
            'os' => null,
            'browser' => null,
            'device_name' => null,
        ]);

        // Same device returns, now we parse User-Agent
        $response = $this->withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        ])->postJson('/api/visitors', [
            'device_id' => 'returning-device-456',
        ]);

        $response->assertStatus(201);

        // Ensure database count hasn't increased, but row updated
        $this->assertDatabaseCount('visitors', 1);
        $this->assertDatabaseHas('visitors', [
            'device_id' => 'returning-device-456',
            'device_type' => 'desktop',
        ]);
    }

    public function test_admin_can_get_all_visitors_paginated()
    {
        $admin = User::factory()->create();
        Visitor::factory()->count(15)->create();

        $response = $this->actingAs($admin)->getJson('/api/admin/visitors');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'current_page', 'last_page', 'total'])
            ->assertJsonCount(10, 'data'); // First page has 10 items
    }

    public function test_admin_can_delete_single_visitor()
    {
        $admin = User::factory()->create();
        $visitor = Visitor::factory()->create();

        $response = $this->actingAs($admin)->deleteJson("/api/admin/visitors/{$visitor->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('visitors', ['id' => $visitor->id]);
    }

    public function test_admin_can_clear_all_visitors()
    {
        $admin = User::factory()->create();
        Visitor::factory()->count(5)->create();

        $response = $this->actingAs($admin)->deleteJson('/api/admin/visitors');

        $response->assertStatus(200);
        $this->assertDatabaseCount('visitors', 0);
    }

    public function test_guest_cannot_delete_visitors()
    {
        $visitor = Visitor::factory()->create();
        $response = $this->deleteJson("/api/admin/visitors/{$visitor->id}");
        $response->assertStatus(401);

        $response = $this->deleteJson('/api/admin/visitors');
        $response->assertStatus(401);
    }

    public function test_guest_cannot_get_visitors()
    {
        $response = $this->getJson('/api/admin/visitors');

        $response->assertStatus(401);
    }
    public function test_ignores_bots()
    {
        $response = $this->withHeaders(['User-Agent' => 'Googlebot/2.1 (+http://www.google.com/bot.html)'])
                         ->postJson('/api/visitors', [
            'device_id' => 'bot-device',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Bots are not logged.']);

        $this->assertDatabaseMissing('visitors', [
            'device_id' => 'bot-device',
        ]);
    }

    public function test_logs_location_for_new_visitor()
    {
        $response = $this->postJson('/api/visitors', [
            'device_id' => 'geo-tested-device',
            'ip_address' => '8.8.8.8',
            'city' => 'Mountain View',
            'region' => 'California',
            'country' => 'United States',
            'isp' => 'Google LLC',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('visitors', [
            'device_id' => 'geo-tested-device',
            'ip_address' => '8.8.8.8',
            'city' => 'Mountain View',
            'country' => 'United States',
            'isp' => 'Google LLC',
        ]);
    }
    public function test_reads_location_from_payload()
    {
        // Simulate request passing location in payload
        $response = $this->postJson('/api/visitors', [
            'device_id' => 'proxy-tested-device',
            'ip_address' => '198.51.100.10',
            'city' => 'San Francisco',
        ]);

        $response->assertStatus(201);
        
        // Assert that the real IP (from payload) is logged
        $this->assertDatabaseHas('visitors', [
            'device_id' => 'proxy-tested-device',
            'ip_address' => '198.51.100.10',
            'city' => 'San Francisco',
        ]);
    }

    public function test_can_leave_mark_and_get_count()
    {
        $response = $this->postJson('/api/visitors/mark', [
            'device_id' => 'mark-device-1',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.total_marks', 1)
                 ->assertJsonPath('data.already_marked', false);

        $this->assertDatabaseHas('visitors', [
            'device_id' => 'mark-device-1',
            'left_mark' => true,
        ]);

        $getCount = $this->getJson('/api/visitors/mark/count');
        $getCount->assertStatus(200)
                 ->assertJsonPath('data.total_marks', 1);
    }

    public function test_cannot_leave_mark_twice_for_same_device()
    {
        $this->postJson('/api/visitors/mark', [
            'device_id' => 'mark-device-2',
        ]);

        $response = $this->postJson('/api/visitors/mark', [
            'device_id' => 'mark-device-2',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.total_marks', 1)
                 ->assertJsonPath('data.already_marked', true);

        $getCount = $this->getJson('/api/visitors/mark/count');
        $getCount->assertStatus(200)
                 ->assertJsonPath('data.total_marks', 1);
    }

    public function test_cannot_leave_mark_again_when_localstorage_cleared_same_ip_and_browser()
    {
        $chromeWindowsUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

        // 1. Initial mark with device-1 from IP 203.0.113.5
        $firstResponse = $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.5'])
            ->withHeaders(['User-Agent' => $chromeWindowsUserAgent])
            ->postJson('/api/visitors/mark', [
                'device_id' => 'device-persisted-1',
            ]);

        $firstResponse->assertStatus(200)
            ->assertJsonPath('data.total_marks', 1)
            ->assertJsonPath('data.already_marked', false)
            ->assertPlainCookie('v_marked', '1');

        $this->assertDatabaseHas('visitors', [
            'device_id'  => 'device-persisted-1',
            'left_mark'  => true,
            'ip_address' => '203.0.113.5',
            'os'         => 'Windows',
            'browser'    => 'Chrome',
        ]);

        // 2. Simulate User clearing localStorage: New device_id generated, but same IP & Browser
        $secondResponse = $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.5'])
            ->withHeaders(['User-Agent' => $chromeWindowsUserAgent])
            ->postJson('/api/visitors/mark', [
                'device_id' => 'device-persisted-2',
            ]);

        $secondResponse->assertStatus(200)
            ->assertJsonPath('data.total_marks', 1)
            ->assertJsonPath('data.already_marked', true);

        // Verify total marks in database did NOT increment
        $this->assertEquals(1, Visitor::where('left_mark', true)->count());

        // 3. User checks mark count on homepage load with new device_id
        $getCount = $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.5'])
            ->withHeaders(['User-Agent' => $chromeWindowsUserAgent])
            ->getJson('/api/visitors/mark/count?device_id=device-persisted-2');

        $getCount->assertStatus(200)
            ->assertJsonPath('data.total_marks', 1)
            ->assertJsonPath('data.already_marked', true);
    }

    public function test_cannot_leave_mark_again_when_both_localstorage_and_cookie_are_cleared()
    {
        $safariIosUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

        // 1. Initial mark
        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.42'])
            ->withHeaders(['User-Agent' => $safariIosUserAgent])
            ->postJson('/api/visitors/mark', [
                'device_id' => 'ios-device-1',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.total_marks', 1)
            ->assertJsonPath('data.already_marked', false);

        // 2. User clears LocalStorage AND clears Cookies completely (clean request without cookies, new device_id)
        $response = $this->flushHeaders()
            ->withServerVariables(['REMOTE_ADDR' => '198.51.100.42'])
            ->withHeaders(['User-Agent' => $safariIosUserAgent])
            ->postJson('/api/visitors/mark', [
                'device_id' => 'ios-device-2-fresh-storage',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.total_marks', 1)
            ->assertJsonPath('data.already_marked', true);

        $this->assertEquals(1, Visitor::where('left_mark', true)->count());
    }

    public function test_different_visitor_from_different_ip_can_leave_mark()
    {
        $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

        // Visitor 1 marks
        $this->withServerVariables(['REMOTE_ADDR' => '100.1.1.1'])
            ->withHeaders(['User-Agent' => $userAgent])
            ->postJson('/api/visitors/mark', ['device_id' => 'client-1'])
            ->assertJsonPath('data.total_marks', 1);

        // Visitor 2 from different IP marks
        $this->withServerVariables(['REMOTE_ADDR' => '100.2.2.2'])
            ->withHeaders(['User-Agent' => $userAgent])
            ->postJson('/api/visitors/mark', ['device_id' => 'client-2'])
            ->assertJsonPath('data.total_marks', 2)
            ->assertJsonPath('data.already_marked', false);

        $this->assertEquals(2, Visitor::where('left_mark', true)->count());
    }

    public function test_cannot_leave_mark_again_when_switching_device_emulation_on_same_ip()
    {
        $ip = '203.0.113.88';
        $windowsUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        $pixel9UserAgent = 'Mozilla/5.0 (Linux; Android 14; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
        $iphoneUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

        // 1. Initial mark on Windows desktop
        $this->withServerVariables(['REMOTE_ADDR' => $ip])
            ->withHeaders(['User-Agent' => $windowsUserAgent])
            ->postJson('/api/visitors/mark', ['device_id' => 'win-device-1'])
            ->assertStatus(200)
            ->assertJsonPath('data.total_marks', 1)
            ->assertJsonPath('data.already_marked', false);

        // 2. User switches DevTools to Pixel 9 (Android User-Agent, clean storage, new device_id)
        $this->flushHeaders()
            ->withServerVariables(['REMOTE_ADDR' => $ip])
            ->withHeaders(['User-Agent' => $pixel9UserAgent])
            ->postJson('/api/visitors/mark', ['device_id' => 'pixel-9-device-2'])
            ->assertStatus(200)
            ->assertJsonPath('data.total_marks', 1)
            ->assertJsonPath('data.already_marked', true);

        // 3. User switches DevTools to iPhone (iOS Safari User-Agent, clean storage, new device_id)
        $this->flushHeaders()
            ->withServerVariables(['REMOTE_ADDR' => $ip])
            ->withHeaders(['User-Agent' => $iphoneUserAgent])
            ->getJson('/api/visitors/mark/count?device_id=iphone-device-3')
            ->assertStatus(200)
            ->assertJsonPath('data.total_marks', 1)
            ->assertJsonPath('data.already_marked', true);

        $this->flushHeaders()
            ->withServerVariables(['REMOTE_ADDR' => $ip])
            ->withHeaders(['User-Agent' => $iphoneUserAgent])
            ->postJson('/api/visitors/mark', ['device_id' => 'iphone-device-3'])
            ->assertStatus(200)
            ->assertJsonPath('data.total_marks', 1)
            ->assertJsonPath('data.already_marked', true);

        // Database total marked visitors MUST remain exactly 1
        $this->assertEquals(1, Visitor::where('left_mark', true)->count());
    }
}
