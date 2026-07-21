<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExperienceRequest extends FormRequest
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
            'company_name' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|string|in:Full-time,Part-time,Freelance,Internship,Contract,Education',
            'location' => 'required|string|max:255',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date', // End date harus setelah start
            'description' => 'sometimes|required|string',
            'is_active' => 'sometimes|boolean',
        ];
    }
}
