<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $fillable = ['name', 'identifier', 'category', 'is_active_on_home'];

    protected $casts = [
        'is_active_on_home' => 'boolean',
    ];

    public function projects()
    {
        return $this->belongsToMany(Project::class, 'project_skill');
    }
}
