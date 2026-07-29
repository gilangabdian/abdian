<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Ubah ke true
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'job_title' => 'required|string|max:255',
            'about_description' => 'required|string',
            'hero_photos' => 'nullable|array|max:10',
            'hero_photos.*' => [
                function ($attribute, $value, $fail) {
                    if (is_string($value)) {
                        return; // URL foto lama
                    }
                    if ($value instanceof \Illuminate\Http\UploadedFile) {
                        $validator = \Illuminate\Support\Facades\Validator::make(
                            ['file' => $value],
                            ['file' => 'image|mimes:jpeg,png,jpg,webp,avif|max:10240']
                        );
                        if ($validator->fails()) {
                            $fail($validator->errors()->first('file'));
                        }
                        return;
                    }
                    $fail('Format foto tidak valid. Harus berupa file gambar atau URL string.');
                },
            ],
            'cv' => 'nullable|mimes:pdf|max:10240', // Max 10MB
            'is_available_for_work' => 'nullable|boolean',
            'hidden_skill_categories' => 'nullable|array',
            'hidden_skill_categories.*' => 'nullable|string',
            'default_skill_category' => 'nullable|string',
            'skill_categories_order' => 'nullable|array',
            'skill_categories_order.*' => 'nullable|string',
            'skill_categories_info' => 'nullable|array',
            'skill_categories_info.*' => 'nullable|string',
            'show_featured_projects_on_home' => 'nullable|boolean',
            'show_featured_certificates_on_home' => 'nullable|boolean',
            'show_experiences_on_home' => 'nullable|boolean',
            'show_tech_on_home' => 'nullable|boolean',
        ];
    }

    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        \Illuminate\Support\Facades\Log::error('Profile Validation Failed', $validator->errors()->toArray());
        parent::failedValidation($validator);
    }
}
