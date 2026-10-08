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
            $table->boolean('is_status_schedule_enabled')->default(false)->after('location_timezone');
            $table->json('status_schedule_days')->nullable()->after('is_status_schedule_enabled');
            $table->time('status_schedule_start_time')->nullable()->after('status_schedule_days');
            $table->time('status_schedule_end_time')->nullable()->after('status_schedule_start_time');
            $table->string('status_message_active')->nullable()->after('status_schedule_end_time');
            $table->string('status_message_inactive')->nullable()->after('status_message_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn([
                'is_status_schedule_enabled',
                'status_schedule_days',
                'status_schedule_start_time',
                'status_schedule_end_time',
                'status_message_active',
                'status_message_inactive'
            ]);
        });
    }
};
