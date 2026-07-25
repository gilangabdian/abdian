<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->boolean('show_featured_projects_on_home')->default(true)->after('skill_categories_info');
            $table->boolean('show_featured_certificates_on_home')->default(true)->after('show_featured_projects_on_home');
            $table->boolean('show_experiences_on_home')->default(true)->after('show_featured_certificates_on_home');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn([
                'show_featured_projects_on_home',
                'show_featured_certificates_on_home',
                'show_experiences_on_home'
            ]);
        });
    }
};
