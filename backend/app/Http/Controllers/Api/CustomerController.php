<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerController extends Controller
{
    public function show(string $email): JsonResponse
    {
        $customer = Customer::where('email', $email)->firstOrFail();
        return response()->json(['data' => $customer->only('name', 'email')]);
    }

    public function orders(string $email): AnonymousResourceCollection
    {
        $customer = Customer::where('email', $email)->firstOrFail();
        $orders = $customer->orders()->with('customer', 'items.product')->latest()->latest('id')->paginate(20);
        return OrderResource::collection($orders);
    }
}
