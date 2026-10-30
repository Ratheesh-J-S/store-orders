<?php

namespace Tests\Feature;

use App\Jobs\SendOrderConfirmation;
use App\Models\Customer;
use App\Models\Product;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class CreateOrderTest extends TestCase
{
    use RefreshDatabase;

    private function product(array $o = []): Product
    {
        return Product::factory()->create($o + ['price' => 100, 'tax_percent' => 18, 'stock' => 10]);
    }

    public function test_creates_order_with_totals_and_deducts_stock(): void
    {
        Queue::fake();
        $a = $this->product();
        $b = $this->product(['price' => 50, 'tax_percent' => 12]);

        $res = $this->postJson('/api/orders', [
            'email' => 'new@example.com',
            'name' => 'New Person',
            'items' => [['product_id' => $a->id, 'quantity' => 2], ['product_id' => $b->id, 'quantity' => 1]],
            'amount_given' => 300,
        ])->assertCreated();

        // a: 200 + 36 tax ; b: 50 + 6 tax  => 250 / 42 / 292
        $res->assertJsonPath('data.subtotal', '250.00')
            ->assertJsonPath('data.tax_total', '42.00')
            ->assertJsonPath('data.grand_total', '292.00')
            ->assertJsonPath('data.change_returned', '8.00');

        $this->assertSame(8, $a->fresh()->stock);
        $this->assertSame(9, $b->fresh()->stock);
        $this->assertDatabaseHas('customers', ['email' => 'new@example.com', 'name' => 'New Person']);
        Queue::assertPushed(SendOrderConfirmation::class, 1);
    }

    public function test_insufficient_stock_is_rejected_and_nothing_changes(): void
    {
        Queue::fake();
        $ok = $this->product(['stock' => 5]);
        $low = $this->product(['stock' => 1]);

        $this->postJson('/api/orders', [
            'email' => 'a@example.com',
            'name' => 'A',
            'items' => [['product_id' => $ok->id, 'quantity' => 3], ['product_id' => $low->id, 'quantity' => 2]],
        ])->assertStatus(422)->assertJsonPath('shortages.0.available', 1);

        // Whole order rolled back: no partial deduction, no order, no customer, no job.
        $this->assertSame(5, $ok->fresh()->stock);
        $this->assertSame(1, $low->fresh()->stock);
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('customers', 0);
        Queue::assertNothingPushed();
    }

    public function test_last_unit_can_only_be_sold_once(): void
    {
        Queue::fake();
        $p = $this->product(['stock' => 1]);
        $payload = fn($email) => ['email' => $email, 'name' => 'X', 'items' => [['product_id' => $p->id, 'quantity' => 1]]];

        $this->postJson('/api/orders', $payload('one@example.com'))->assertCreated();
        $this->postJson('/api/orders', $payload('two@example.com'))->assertStatus(422);

        $this->assertSame(0, $p->fresh()->stock);
        $this->assertDatabaseCount('orders', 1);
    }

    public function test_duplicate_lines_are_merged_before_the_stock_check(): void
    {
        Queue::fake();
        $p = $this->product(['stock' => 3]);

        $this->postJson('/api/orders', [
            'email' => 'd@example.com',
            'name' => 'D',
            'items' => [['product_id' => $p->id, 'quantity' => 2], ['product_id' => $p->id, 'quantity' => 2]],
        ])->assertStatus(422); // 4 > 3 even though each line alone would fit
    }

    public function test_validation_errors(): void
    {
        $p = $this->product();
        $this->postJson('/api/orders', ['email' => 'bad', 'items' => []])->assertStatus(422)->assertJsonValidationErrors(['email', 'items']);
        $this->postJson('/api/orders', ['email' => 'x@example.com', 'items' => [['product_id' => $p->id, 'quantity' => 1]]])
            ->assertStatus(422)->assertJsonValidationErrors(['name']);
        $this->postJson('/api/orders', ['email' => 'x@example.com', 'name' => 'X', 'items' => [['product_id' => $p->id, 'quantity' => 0]]])
            ->assertStatus(422)->assertJsonValidationErrors(['items.0.quantity']);
        $this->postJson('/api/orders', ['email' => 'x@example.com', 'name' => 'X', 'items' => [['product_id' => 999, 'quantity' => 1]]])
            ->assertStatus(422)->assertJsonValidationErrors(['items.0.product_id']);
    }

    public function test_amount_given_below_total_is_rejected_and_rolls_back(): void
    {
        $p = $this->product(['stock' => 5]);
        $this->postJson('/api/orders', [
            'email' => 'p@example.com',
            'name' => 'P',
            'amount_given' => 10,
            'items' => [['product_id' => $p->id, 'quantity' => 1]],
        ])->assertStatus(422)->assertJsonValidationErrors(['amount_given']);

        $this->assertSame(5, $p->fresh()->stock);
    }

    public function test_existing_customer_is_reused_and_name_is_optional(): void
    {
        Queue::fake();
        $c = Customer::factory()->create(['email' => 'old@example.com']);
        $p = $this->product();

        $this->postJson('/api/orders', ['email' => 'old@example.com', 'items' => [['product_id' => $p->id, 'quantity' => 1]]])->assertCreated();
        $this->assertDatabaseCount('customers', 1);
        $this->assertSame(1, $c->orders()->count());
    }

    public function test_confirmation_job_logs_the_email(): void
    {
        $p = $this->product();
        $order = app(OrderService::class)->create([
            'email' => 'j@example.com',
            'name' => 'J',
            'items' => [['product_id' => $p->id, 'quantity' => 1]],
        ]);

        Log::spy();
        (new SendOrderConfirmation($order))->handle();
        Log::shouldHaveReceived('info')->once();
    }
}
