<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 旧メール承認トークン（sha256 hash 64文字）
            $table->string('pending_email_approve_token', 64)->nullable()->after('pending_email_cancel_token');
            $table->timestamp('pending_email_approved_at')->nullable()->after('pending_email_approve_token');

            // 完了状態（confirmed / canceled / expired）
            $table->timestamp('pending_email_completed_at')->nullable()->after('pending_email_approved_at');
            $table->string('pending_email_completion_status', 20)->nullable()->after('pending_email_completed_at');

            // SQLiteなら index も気軽に追加でOK
            $table->index('pending_email_token');
            $table->index('pending_email_cancel_token');
            $table->index('pending_email_approve_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['pending_email_token']);
            $table->dropIndex(['pending_email_cancel_token']);
            $table->dropIndex(['pending_email_approve_token']);

            $table->dropColumn([
                'pending_email_approve_token',
                'pending_email_approved_at',
                'pending_email_completed_at',
                'pending_email_completion_status',
            ]);
        });
    }
};
