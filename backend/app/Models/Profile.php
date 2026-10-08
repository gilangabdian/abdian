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
        'status_message',
        'status_last_updated_at',
        'location_timezone',
        'is_status_schedule_enabled',
        'status_schedule_days',
        'status_schedule_start_time',
        'status_schedule_end_time',
        'status_message_active',
        'status_message_inactive',
        'hero_photos',
        'cv_path',
        'hidden_skill_categories',
        'default_skill_category',
        'skill_categories_order',
        'skill_categories_info',
        'show_featured_projects_on_home',
        'show_featured_certificates_on_home',
        'show_experiences_on_home',
        'show_tech_on_home',
        'is_about_page_active',
        'is_certificates_page_active',
        'is_contacts_page_active',
        'show_resume_button',
    ];

    protected $casts = [
        'hero_photos' => 'array',
        'status_last_updated_at' => 'datetime',
        'is_status_schedule_enabled' => 'boolean',
        'status_schedule_days' => 'array',
        'hidden_skill_categories' => 'array',
        'skill_categories_order' => 'array',
        'skill_categories_info' => 'array',
        'show_featured_projects_on_home' => 'boolean',
        'show_featured_certificates_on_home' => 'boolean',
        'show_experiences_on_home' => 'boolean',
        'show_tech_on_home' => 'boolean',
        'is_about_page_active' => 'boolean',
        'is_certificates_page_active' => 'boolean',
        'is_contacts_page_active' => 'boolean',
        'show_resume_button' => 'boolean',
    ];
}
