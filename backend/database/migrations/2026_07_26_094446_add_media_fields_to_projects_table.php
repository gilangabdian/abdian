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
        Schema::table('projects', function (Blueprint $table) {
            // Track whether thumbnail is an image or video
            $table->string('media_type')->default('image')->after('thumbnail_path');
            // Optional: YouTube embed URL
            $table->string('youtube_url')->nullable()->after('media_type');
            // Optional: Twitter/X tweet URL containing a video
            $table->string('twitter_url')->nullable()->after('youtube_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['media_type', 'youtube_url', 'twitter_url']);
        });
    }
};
