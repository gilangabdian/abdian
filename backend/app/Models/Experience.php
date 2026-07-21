<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    protected $fillable = ['company_name', 'role', 'status', 'location', 'start_date', 'end_date', 'description', 'is_active'];
    protected $casts = ['start_date' => 'date', 'end_date' => 'date', 'is_active' => 'boolean'];
}
