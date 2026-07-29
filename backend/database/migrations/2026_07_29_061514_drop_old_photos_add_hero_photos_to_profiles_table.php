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
            $table->dropColumn('photo_path');
            $table->dropColumn('secondary_image');
            $table->json('hero_photos')->nullable()->after('about_description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn('hero_photos');
            $table->string('photo_path')->nullable();
            $table->string('secondary_image')->nullable();
        });
    }
};
