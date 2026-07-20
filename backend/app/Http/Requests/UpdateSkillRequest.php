<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSkillRequest extends FormRequest
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
            'name' => 'sometimes|required|string|max:255',
            'identifier' => 'sometimes|required|string',
            'category' => 'sometimes|required|string|in:Frontend,Backend,Cloud & DevOps,Mobile,Databases',
            'icon' => 'nullable|image|mimes:svg,png,jpg,webp|max:1024',
        ];
    }
}
