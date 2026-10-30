<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendOrderConfirmation implements ShouldQueue
{
    use Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [10, 60];

    public function __construct(public Order $order) {}

    public function handle(): void
    {
        $o = $this->order->loadMissing('customer', 'items.product');

        Log::info('Order confirmation email sent (simulated)', [
            'to'            => $o->customer->email,
            'order'         => $o->number,
            'grand_total'   => $o->grand_total,
            'lines'         => $o->items->map(fn($i) => "{$i->product->name} x{$i->quantity}")->all(),
        ]);
    }
}
