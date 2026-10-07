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
            $table->dropColumn('is_available_for_work');
            $table->string('status_message')->nullable()->after('about_description');
            $table->timestamp('status_last_updated_at')->nullable()->after('status_message');
            $table->string('location_timezone')->default('Asia/Jakarta')->after('status_last_updated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->boolean('is_available_for_work')->default(true);
            $table->dropColumn(['status_message', 'status_last_updated_at', 'location_timezone']);
        });
    }
};
