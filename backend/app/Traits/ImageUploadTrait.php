<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Cloudinary\Cloudinary;
use Illuminate\Support\Str;

trait ImageUploadTrait
{
    /**
     * Upload an image to the appropriate disk (Cloudinary with WebP or Local)
     *
     * @param UploadedFile $file The image file to upload
     * @param string $folder The folder name (e.g., 'projects', 'artworks')
     * @param string|null $oldPath Optional old file path/URL to delete
     * @param string $resourceType Type of resource ('image', 'video', etc)
     * @return string The URL or path to the uploaded image
     */
    protected function handleFileUpload(UploadedFile $file, string $folder, ?string $oldPath = null, string $resourceType = 'image'): string
    {
        $disk = config('filesystems.default', 'public');

        // Delete old file if it exists
        if ($oldPath) {
            $this->deleteFile($oldPath, $disk);
        }

        if ($disk === 'cloudinary') {
            // Upload to Cloudinary using their API for better control over transformations
            $cloudinary = new Cloudinary(config('cloudinary.cloud_url'));
            
            $result = $cloudinary->uploadApi()->upload($file->getRealPath(), [
                'folder' => $folder,
                'resource_type' => $resourceType,
                'access_mode' => 'public',
                'overwrite' => true,
            ]);

            // Inject f_auto,q_auto into the Cloudinary URL to serve WebP/AVIF (for images) 
            // and WebM/MP4 (for videos) automatically for optimal compression.
            // EXCEPT for PDFs and SVGs because it would convert them into a raster image.
            $ext = strtolower($file->getClientOriginalExtension());
            if ($ext !== 'pdf' && $ext !== 'svg') {
                return str_replace('/upload/', '/upload/f_auto,q_auto/', $result['secure_url']);
            }

            return $result['secure_url'];
        } else {
            // Local fallback (development)
            return $file->store($folder, 'public');
        }
    }

    /**
     * Parse a Cloudinary URL to extract public_id and resource_type
     *
     * @param string $url
     * @return array{public_id: string, resource_type: string}|null
     */
    protected function parseCloudinaryUrl(string $url): ?array
    {
        if (!str_contains($url, 'res.cloudinary.com')) {
            return null;
        }

        // Determine resource_type (video or image)
        $resourceType = 'image';
        if (str_contains($url, '/video/upload/')) {
            $resourceType = 'video';
        } elseif (str_contains($url, '/raw/upload/')) {
            $resourceType = 'raw';
        }

        $parts = explode('/upload/', $url);
        if (count($parts) < 2) {
            return null;
        }

        $afterUpload = $parts[1];
        // Remove query parameters if any
        $afterUpload = explode('?', $afterUpload)[0];

        // Check if there is a version tag /v\d+/
        if (preg_match('/(?:^|\/)v\d+\/(.+)$/', $afterUpload, $matches)) {
            $pathWithoutVersion = $matches[1];
        } else {
            // Strip any transformation segment (e.g. f_auto,q_auto or w_500,h_500)
            $segments = explode('/', $afterUpload);
            $cleanSegments = [];
            $foundContent = false;
            foreach ($segments as $segment) {
                if (!$foundContent && (str_contains($segment, ',') || preg_match('/^[a-z]{1,2}_/', $segment))) {
                    continue;
                }
                $foundContent = true;
                $cleanSegments[] = $segment;
            }
            $pathWithoutVersion = implode('/', $cleanSegments);
        }

        // Strip file extension (.jpg, .png, .mp4, .webp, etc.)
        $publicId = preg_replace('/\.[^.\/]+$/', '', $pathWithoutVersion);

        if (empty($publicId)) {
            return null;
        }

        return [
            'public_id' => $publicId,
            'resource_type' => $resourceType,
        ];
    }

    /**
     * Delete an image from disk or Cloudinary intelligently based on URL & environment
     *
     * @param string|null $path The URL or path to delete
     * @param string|null $disk Force a specific disk, or null to auto-detect
     * @return void
     */
    protected function deleteFile(?string $path, ?string $disk = null): void
    {
        if (!$path) {
            return;
        }

        // 1. Smart Detection: If it's a Cloudinary URL
        if (str_contains($path, 'res.cloudinary.com')) {
            $parsed = $this->parseCloudinaryUrl($path);
            if ($parsed && !empty($parsed['public_id'])) {
                try {
                    $cloudUrl = config('cloudinary.cloud_url');
                    if ($cloudUrl) {
                        $cloudinary = new Cloudinary($cloudUrl);
                        $cloudinary->uploadApi()->destroy($parsed['public_id'], [
                            'resource_type' => $parsed['resource_type'],
                            'invalidate' => true,
                        ]);
                    }
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning("Failed to delete Cloudinary file: {$path}. Reason: " . $e->getMessage());
                }
            }
            return;
        }

        // 2. Local Storage Deletion (when in development or path is a local relative path)
        if (!str_starts_with($path, 'http')) {
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }
}
