<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Jobs\SendOrderConfirmation;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * @param array{email:string,name?:?string,items:array<int,array{product_id:int,quantity:int}>,amount_given?:mixed} $data
     */
    public function create(array $data): Order
    {
        $wanted = [];
        foreach ($data['items'] as $line) {
            $id = (int) $line['product_id'];
            $wanted[$id] = ($wanted[$id] ?? 0) + (int) $line['quantity'];
        }
        ksort($wanted);

        $order = DB::transaction(function () use ($data, $wanted) {
            $products = Product::whereIn('id', array_keys($wanted))
                ->orderBy('id')->lockForUpdate()->get()->keyBy('id');

            $shortages = [];
            foreach ($wanted as $id => $qty) {
                $p = $products[$id];
                if ($p->stock < $qty) {
                    $shortages[] = ['product_id' => $id, 'name' => $p->name, 'requested' => $qty, 'available' => $p->stock];
                }
            }
            if ($shortages) {
                throw new InsufficientStockException($shortages);
            }

            $lines = [];
            $subtotal = $tax = 0;
            foreach ($wanted as $id => $qty) {
                $p = $products[$id];
                $unit = (int) round(((float) $p->price) * 100);
                $lineSub = $unit * $qty;
                $lineTax = (int) round($lineSub * ((float) $p->tax_percent) / 100);
                $subtotal += $lineSub;
                $tax += $lineTax;
                $lines[] = [
                    'product_id' => $id,
                    'quantity' => $qty,
                    'unit_price' => $unit / 100,
                    'tax_percent' => $p->tax_percent,
                    'line_subtotal' => $lineSub / 100,
                    'line_tax' => $lineTax / 100,
                    'line_total' => ($lineSub + $lineTax) / 100,
                ];
            }
            $grand = $subtotal + $tax;

            $given = $change = null;
            if (isset($data['amount_given']) && $data['amount_given'] !== '') {
                $given = (int) round(((float) $data['amount_given']) * 100);
                if ($given < $grand) {
                    throw ValidationException::withMessages([
                        'amount_given' => 'Amount given is less than the grand total.',
                    ]);
                }
                $change = $given - $grand;
            }

            foreach ($wanted as $id => $qty) {
                $affected = Product::whereKey($id)->where('stock', '>=', $qty)->decrement('stock', $qty);
                if ($affected !== 1) {
                    throw new InsufficientStockException([[
                        'product_id' => $id,
                        'name' => $products[$id]->name,
                        'requested' => $qty,
                        'available' => (int) Product::whereKey($id)->value('stock'),
                    ]]);
                }
            }

            $customer = Customer::firstOrCreate(
                ['email' => $data['email']],
                ['name' => $data['name'] ?? Str::before($data['email'], '@')]
            );

            $order = $customer->orders()->create([
                'number' => 'ORD-' . strtoupper(Str::random(10)),
                'subtotal' => $subtotal / 100,
                'tax_total' => $tax / 100,
                'grand_total' => $grand / 100,
                'amount_given' => $given === null ? null : $given / 100,
                'change_returned' => $change === null ? null : $change / 100,
            ]);
            $order->items()->createMany($lines);

            return $order->load('customer', 'items.product');
        });

        SendOrderConfirmation::dispatch($order)->afterCommit();

        return $order;
    }

    public static function changeBreakdown(float $change): array
    {
        $paise = (int) round($change * 100);
        $out = [];
        foreach ([500, 200, 100, 50, 20, 10, 5, 2, 1] as $d) {
            $n = intdiv($paise, $d * 100);
            if ($n) {
                $out[$d] = $n;
                $paise -= $n * $d * 100;
            }
        }
        if ($paise) {
            $out['paise'] = $paise;
        }

        return $out;
    }
}
