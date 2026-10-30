<?php

namespace App\Http\Resources;

use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'number'    => $this->number,

            'customer' => [
                'name'  => $this->customer->name,
                'email' => $this->customer->email
            ],

            'items'     => $this->items->map(fn($i) => [
                'product_id'    => $i->product_id,
                'product'       => $i->product->name,
                'quantity'      => $i->quantity,
                'unit_price'    => $i->unit_price,
                'tax_percent'   => $i->tax_percent,
                'line_subtotal' => $i->line_subtotal,
                'line_tax'      => $i->line_tax,
                'line_total'    => $i->line_total,
            ])->values(),

            'subtotal'          => $this->subtotal,
            'tax_total'         => $this->tax_total,
            'grand_total'       => $this->grand_total,
            'amount_given'      => $this->amount_given,
            'change_returned'   => $this->change_returned,
            'change_breakdown'  => $this->change_returned !== null ? OrderService::changeBreakdown((float) $this->change_returned) : null,
            'created_at'        => $this->created_at?->toIso8601String(),
        ];
    }
}
