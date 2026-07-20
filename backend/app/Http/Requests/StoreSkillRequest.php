<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSkillRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            // Identifier wajib string (contoh: 'simple-icons:react')
            'identifier' => 'required|string|max:255',
            // Category opsional, disesuaikan dengan kategori UI baru
            'category' => 'nullable|string|in:Frontend,Backend,Cloud & DevOps,Mobile,Databases',

            // HAPUS BAGIAN INI:
            // 'icon' => 'required|image|mimes:svg,png,jpg,webp|max:1024',
        ];
    }
}
