<?php

namespace Tests\Feature;

use Tests\TestCase;

class CorsTest extends TestCase
{
    public function test_cors_allows_localhost_3000()
    {
        $response = $this->withHeaders([
            'Origin' => 'http://localhost:3000',
            'Access-Control-Request-Method' => 'GET',
        ])->optionsJson('/api/blogs');

        $response->assertStatus(204);
        $response->assertHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    }

    public function test_cors_allows_production_domain()
    {
        $response = $this->withHeaders([
            'Origin' => 'https://abdian.my.id',
            'Access-Control-Request-Method' => 'GET',
        ])->optionsJson('/api/blogs');

        $response->assertStatus(204);
        $response->assertHeader('Access-Control-Allow-Origin', 'https://abdian.my.id');
    }

    public function test_cors_does_not_allow_obsolete_5173()
    {
        $response = $this->withHeaders([
            'Origin' => 'http://localhost:5173',
            'Access-Control-Request-Method' => 'GET',
        ])->optionsJson('/api/blogs');

        // Laravel fruitcake/cors does not return Access-Control-Allow-Origin header for rejected origins
        $this->assertFalse($response->headers->has('Access-Control-Allow-Origin') && $response->headers->get('Access-Control-Allow-Origin') === 'http://localhost:5173');
    }
}
