<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'number',
        'customer_id',
        'subtotal',
        'tax_total',
        'grand_total',
        'amount_given',
        'change_returned',
    ];

    protected $casts = [
        'subtotal'          => 'decimal:2',
        'tax_total'         => 'decimal:2',
        'grand_total'       => 'decimal:2',
        'amount_given'      => 'decimal:2',
        'change_returned'   => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
