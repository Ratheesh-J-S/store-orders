<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Product::orderBy('name')->get(['id', 'name', 'code', 'price', 'tax_percent', 'stock'])]);
    }

    public function lowStock(Request $request): JsonResponse
    {
        $threshold = $request->validate(['threshold' => ['nullable', 'integer', 'min:0']])['threshold'] ?? config('inventory.low_stock_threshold');

        return response()->json([
            'threshold' => (int) $threshold,
            'data' => Product::where('stock', '<', $threshold)->orderBy('stock')->get(['id', 'name', 'code', 'stock']),
        ]);
    }
}
