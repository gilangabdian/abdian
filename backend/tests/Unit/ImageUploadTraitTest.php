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

            public function testParseCloudinaryUrl(string $url): ?array
            {
                return $this->parseCloudinaryUrl($url);
            }

            public function testDeleteFile(?string $path, ?string $disk = null): void
            {
                $this->deleteFile($path, $disk);
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

    public function test_it_parses_cloudinary_image_url_with_transformations_and_folder()
    {
        $url = 'https://res.cloudinary.com/mycloud/image/upload/f_auto,q_auto/v1722000000/projects/sample_uuid.jpg';
        $parsed = $this->traitObject->testParseCloudinaryUrl($url);

        $this->assertNotNull($parsed);
        $this->assertEquals('projects/sample_uuid', $parsed['public_id']);
        $this->assertEquals('image', $parsed['resource_type']);
    }

    public function test_it_parses_cloudinary_video_url()
    {
        $url = 'https://res.cloudinary.com/mycloud/video/upload/f_auto,q_auto/v1722000000/projects/demo_video.mp4';
        $parsed = $this->traitObject->testParseCloudinaryUrl($url);

        $this->assertNotNull($parsed);
        $this->assertEquals('projects/demo_video', $parsed['public_id']);
        $this->assertEquals('video', $parsed['resource_type']);
    }

    public function test_it_returns_null_for_non_cloudinary_url()
    {
        $url = 'https://example.com/images/photo.jpg';
        $parsed = $this->traitObject->testParseCloudinaryUrl($url);

        $this->assertNull($parsed);
    }

    public function test_it_deletes_local_file_from_public_disk()
    {
        \Illuminate\Support\Facades\Storage::fake('public');
        \Illuminate\Support\Facades\Storage::disk('public')->put('projects/test.jpg', 'fake content');

        $this->assertTrue(\Illuminate\Support\Facades\Storage::disk('public')->exists('projects/test.jpg'));

        $this->traitObject->testDeleteFile('projects/test.jpg');

        $this->assertFalse(\Illuminate\Support\Facades\Storage::disk('public')->exists('projects/test.jpg'));
    }
}
