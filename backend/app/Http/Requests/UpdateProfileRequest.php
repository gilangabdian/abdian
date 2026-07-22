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
            'photo_path' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // Max 2MB
            'secondary_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'cv' => 'nullable|mimes:pdf|max:10240', // Max 10MB
            'is_available_for_work' => 'nullable|boolean',
            'hidden_skill_categories' => 'nullable|array',
            'hidden_skill_categories.*' => 'string',
        ];
    }
}
