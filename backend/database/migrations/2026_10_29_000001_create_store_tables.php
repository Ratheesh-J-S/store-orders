<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('code')->unique();
            $t->decimal('price', 10, 2);
            $t->decimal('tax_percent', 5, 2)->default(0);
            $t->unsignedInteger('stock')->default(0)->index();
            $t->timestamps();
        });

        Schema::create('customers', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('email')->unique();
            $t->timestamps();
        });

        Schema::create('orders', function (Blueprint $t) {
            $t->id();
            $t->string('number')->unique();
            $t->foreignId('customer_id')->constrained()->restrictOnDelete();
            $t->decimal('subtotal', 12, 2);
            $t->decimal('tax_total', 12, 2);
            $t->decimal('grand_total', 12, 2);
            $t->decimal('amount_given', 12, 2)->nullable();
            $t->decimal('change_returned', 12, 2)->nullable();
            $t->timestamps();
            $t->index(['customer_id', 'created_at']);
        });

        Schema::create('order_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('order_id')->constrained()->cascadeOnDelete();
            $t->foreignId('product_id')->constrained()->restrictOnDelete();
            $t->unsignedInteger('quantity');
            $t->decimal('unit_price', 10, 2);
            $t->decimal('tax_percent', 5, 2);
            $t->decimal('line_subtotal', 12, 2);
            $t->decimal('line_tax', 12, 2);
            $t->decimal('line_total', 12, 2);
            $t->timestamps();
            $t->unique(['order_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('products');
    }
};
