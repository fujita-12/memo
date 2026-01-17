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
        Schema::create('password_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('password_item_id')->constrained('password_items')->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->timestamps();

            $table->index(['password_item_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_entries');
    }
};
