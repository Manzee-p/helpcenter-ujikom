<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_warnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('users')->cascadeOnDelete();
            $table->enum('warning_type', ['system', 'admin']);
            $table->text('message');
            $table->timestamps();

            $table->index(['vendor_id', 'warning_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_warnings');
    }
};
