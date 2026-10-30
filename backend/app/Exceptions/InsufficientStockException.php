<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

class InsufficientStockException extends RuntimeException
{
    /** @param array<int, array{product_id:int,name:string,requested:int,available:int}> $shortages */
    public function __construct(public readonly array $shortages)
    {
        parent::__construct('Insufficient stock for one or more products.');
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'shortages' => $this->shortages,
        ], 422);
    }
}
