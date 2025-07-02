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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code')->unique();
            $table->decimal('tarif', 15, 2);
            $table->text('description')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->decimal('price', 15, 2);
            $table->integer('stock')->default(0);
            $table->string('unit'); // tablet, ml, box, etc.
            $table->text('description')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
        Schema::create('actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code')->unique();
            $table->decimal('tarif', 15, 2);
            $table->text('description')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('no_kpj')->unique();
            $table->string('nama_pasien');
            $table->string('nik', 16)->unique();
            $table->text('alamat')->nullable();
            $table->string('telepon')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable();
            $table->timestamps();
        });
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->string('no_rawat_medis')->unique();
            $table->date('tgl_kecelakaan')->nullable();
            $table->date('tgl_pengobatan');
            $table->date('tgl_masuk');
            $table->date('tgl_keluar')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('keluhan')->nullable();
            $table->enum('jenis_rawat', ['rawat_jalan', 'rawat_inap', 'ugd']);
            $table->enum('status', ['active', 'completed', 'cancelled'])->default('active');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medical_record_id')->constrained()->onDelete('cascade');
            $table->string('invoice_number')->unique();
            $table->decimal('total_amount', 15, 2);
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected', 'paid'])->default('draft');
            $table->text('notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
        Schema::create('invoice_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->enum('item_type', ['service', 'medicine', 'action']);
            $table->unsignedBigInteger('item_id'); // polymorphic reference
            $table->string('item_name'); // store name for historical data
            $table->string('item_code'); // store code for historical data
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();

            // Add index for polymorphic relationship
            $table->index(['item_type', 'item_id']);
        });
        Schema::create('invoice_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('category_name'); // store name for historical data
            $table->decimal('total_amount', 15, 2);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
        Schema::dropIfExists('services');
        Schema::dropIfExists('medicines');
        Schema::dropIfExists('actions');
        Schema::dropIfExists('patients');
        Schema::dropIfExists('medical_records');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('invoice_details');
        Schema::dropIfExists('invoice_categories'); 
    }
};
