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
            $table->boolean('is_about_page_active')->default(true)->after('show_tech_on_home');
            $table->boolean('is_certificates_page_active')->default(true)->after('is_about_page_active');
            $table->boolean('is_contacts_page_active')->default(true)->after('is_certificates_page_active');
            $table->boolean('show_resume_button')->default(true)->after('is_contacts_page_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn([
                'is_about_page_active',
                'is_certificates_page_active',
                'is_contacts_page_active',
                'show_resume_button'
            ]);
        });
    }
};
