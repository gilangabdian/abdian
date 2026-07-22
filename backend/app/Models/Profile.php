<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    // Kunci 'id' agar tidak bisa diubah sembarangan, sisanya BEBAS diisi (Mass Assignment)
    protected $fillable = [
        'name',
        'job_title',
        'about_description',
        'is_available_for_work',
        'photo_path',
        'secondary_image',
        'cv_path',
        'hidden_skill_categories',
        'default_skill_category',
        'skill_categories_order',
        'skill_categories_info',
    ];

    protected $casts = [
        'is_available_for_work' => 'boolean',
        'hidden_skill_categories' => 'array',
        'skill_categories_order' => 'array',
        'skill_categories_info' => 'array',
    ];
}
