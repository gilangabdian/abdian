<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'is_published' => 'nullable|boolean',
            'is_external' => 'nullable|boolean',
            'external_url' => 'nullable|required_if:is_external,true|url',
            'content' => 'nullable|required_if:is_external,false|string',
        ];
    }
}
