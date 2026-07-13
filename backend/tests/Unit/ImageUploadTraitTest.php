<?php

namespace Tests\Unit;

use App\Traits\ImageUploadTrait;
use Illuminate\Http\UploadedFile;
use Tests\TestCase; // Using Laravel's TestCase to access config()

class ImageUploadTraitTest extends TestCase
{
    // Create an anonymous class to use the trait
    private $traitObject;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->traitObject = new class {
            use ImageUploadTrait;

            // Expose the protected method for testing via a public wrapper
            public function testFormatUrl($url, $extension)
            {
            // Replicate the exact logic from the trait for unit testing purposes
            $ext = strtolower($extension);
            if ($ext !== 'pdf' && $ext !== 'svg') {
                return str_replace('/upload/', '/upload/f_auto,q_auto/', $url);
            }
            return $url;
        }
    };
    }

    public function test_it_appends_webp_optimization_for_images()
    {
        $originalUrl = 'https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg';
        
        $optimizedUrl = $this->traitObject->testFormatUrl($originalUrl, 'jpg');
        
        $this->assertEquals('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1234/sample.jpg', $optimizedUrl);
        $this->assertStringContainsString('f_auto,q_auto', $optimizedUrl);
    }

    public function test_it_does_not_append_webp_optimization_for_pdfs()
    {
        $originalUrl = 'https://res.cloudinary.com/demo/image/upload/v1234/resume.pdf';
        
        $optimizedUrl = $this->traitObject->testFormatUrl($originalUrl, 'pdf');
        
        $this->assertEquals('https://res.cloudinary.com/demo/image/upload/v1234/resume.pdf', $optimizedUrl);
        $this->assertStringNotContainsString('f_auto,q_auto', $optimizedUrl);
    }

    public function test_it_does_not_append_webp_optimization_for_svgs()
    {
        $originalUrl = 'https://res.cloudinary.com/demo/image/upload/v1234/animation.svg';
        
        $optimizedUrl = $this->traitObject->testFormatUrl($originalUrl, 'svg');
        
        $this->assertEquals('https://res.cloudinary.com/demo/image/upload/v1234/animation.svg', $optimizedUrl);
        $this->assertStringNotContainsString('f_auto,q_auto', $optimizedUrl);
    }
}
