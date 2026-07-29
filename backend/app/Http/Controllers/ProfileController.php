<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\Contact;
use App\Models\Profile;
use App\Traits\ImageUploadTrait;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    use ImageUploadTrait;

    public function update(UpdateProfileRequest $request)
    {
        // 1. Ambil data teks
        $data = $request->safe()->except(['hero_photos', 'cv']);

        if (isset($data['hidden_skill_categories']) && is_array($data['hidden_skill_categories'])) {
            $data['hidden_skill_categories'] = array_values(array_filter($data['hidden_skill_categories'], function($val) {
                return $val !== null;
            }));
        }

        // 2. Ambil Profile atau Siapkan Instance Baru
        // PENTING: Gunakan firstOrNew.
        // Ini TIDAK menyimpan ke DB dulu, jadi aman dari error "Field 'name' doesn't have a default value"
        $profile = Profile::firstOrNew([], ['id' => 1]);

        // 3. (Removed config)

        // 4. Handle Uploads
        // (Logika ini tetap jalan normal karena $profile->photo_path tersedia jika data ada)

        // 4. Handle Hero Photos
        if ($request->has('hero_photos')) {
            $heroPhotos = [];
            $mixedPhotos = $request->all()['hero_photos'] ?? [];
            $baseUrl = url(Storage::url(''));

            foreach ($mixedPhotos as $photo) {
                if (is_string($photo)) {
                    // Cek jika ini URL lokal storage, ubah jadi path relatif
                    if (str_starts_with($photo, $baseUrl)) {
                        $relativePath = ltrim(str_replace($baseUrl, '', $photo), '/');
                        $heroPhotos[] = $relativePath;
                    } else {
                        // URL full dari Cloudinary atau eksternal
                        $heroPhotos[] = $photo;
                    }
                } elseif ($photo instanceof \Illuminate\Http\UploadedFile) {
                    $uploadedPath = $this->handleFileUpload(
                        $photo,
                        'hero_photos'
                    );
                    $heroPhotos[] = $uploadedPath;
                }
            }
            $data['hero_photos'] = $heroPhotos;
        }

        // Handle CV
        if ($request->hasFile('cv')) {
            $data['cv_path'] = $this->handleFileUpload(
                $request->file('cv'),
                'cv',
                $profile->cv_path,
                'auto'
            );
        }

        // 5. Save & Refresh
        // DISINILAH penyimpanan ke Database terjadi.
        // Karena $data sudah berisi 'name', 'job_title' (dari request) DAN file paths,
        // maka Database akan menerimanya dengan sukses.
        $profile->fill($data);
        $profile->save();
        $profile->refresh();

        // 6. Append URLs
        if (is_array($profile->hero_photos)) {
            $profile->hero_photo_urls = array_map(function($path) {
                return $this->resolveUrl($path);
            }, $profile->hero_photos);
        } else {
            $profile->hero_photo_urls = [];
        }
        $profile->cv_url = $this->resolveUrl($profile->cv_path);

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $profile,
        ]);
    }

    // ... sisa method index, handleFileUpload, dan resolveUrl JANGAN DIUBAH (tetap pakai yang lama) ...

    public function index()
    {
        $profile = Profile::first();
        $contacts = Contact::whereRaw('LOWER(platform_name) != ?', ['email'])->get();

        if ($profile) {
            if (is_array($profile->hero_photos)) {
                $profile->hero_photo_urls = array_map(function($path) {
                    return $this->resolveUrl($path);
                }, $profile->hero_photos);
            } else {
                $profile->hero_photo_urls = [];
            }
            $profile->cv_url = $this->resolveUrl($profile->cv_path);
        }

        return response()->json([
            'about' => $profile,
            'social_media' => $contacts,
        ]);
    }



    private function resolveUrl($path)
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http')) {
            return $path;
        }

        return Storage::url($path);
    }
}
