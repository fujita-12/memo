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
        Schema::create('password_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('password_list_id')->constrained('password_lists')->cascadeOnDelete();
            $table->string('title');
            $table->text('secret'); // 暗号化済み文字列
            $table->timestamps();

            $table->index(['password_list_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_items');
    }
};
