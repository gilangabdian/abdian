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
            // Make thumbnail_path nullable so admins can remove thumbnails
            $table->string('thumbnail_path')->nullable()->change();
            // Remove default 'image' from media_type so it can be null when thumbnail is removed
            $table->string('media_type')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('thumbnail_path')->nullable(false)->change();
            $table->string('media_type')->default('image')->change();
        });
    }
};
