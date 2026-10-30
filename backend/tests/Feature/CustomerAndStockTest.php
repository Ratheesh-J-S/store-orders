<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Product;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class CustomerAndStockTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_history_by_email_returns_only_that_customers_orders(): void
    {
        Queue::fake();
        $p = Product::factory()->create(['stock' => 50]);
        $svc = app(OrderService::class);
        $line = [['product_id' => $p->id, 'quantity' => 1]];

        $svc->create(['email' => 'a@example.com', 'name' => 'A', 'items' => $line]);
        $svc->create(['email' => 'a@example.com', 'items' => $line]);
        $svc->create(['email' => 'b@example.com', 'name' => 'B', 'items' => $line]);

        $this->getJson('/api/customers/a@example.com/orders')
            ->assertOk()->assertJsonCount(2, 'data')->assertJsonPath('data.0.customer.email', 'a@example.com');
    }

    public function test_unknown_customer_history_is_404(): void
    {
        $this->getJson('/api/customers/nobody@example.com/orders')->assertNotFound();
    }

    public function test_low_stock_uses_config_threshold_and_query_override(): void
    {
        config(['inventory.low_stock_threshold' => 10]);
        Product::factory()->create(['name' => 'Low', 'stock' => 3]);
        Product::factory()->create(['name' => 'Edge', 'stock' => 10]); // not below 10
        Product::factory()->create(['name' => 'Plenty', 'stock' => 50]);

        $this->getJson('/api/products/low-stock')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Low');
        $this->getJson('/api/products/low-stock?threshold=11')->assertJsonCount(2, 'data');
        $this->getJson('/api/products/low-stock?threshold=abc')->assertStatus(422);
    }

    public function test_change_breakdown(): void
    {
        $this->assertSame([20 => 1, 2 => 1, 'paise' => 80], OrderService::changeBreakdown(22.80));
        $this->assertSame([], OrderService::changeBreakdown(0));
    }
}
