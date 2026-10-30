<?php

use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::post('orders', [OrderController::class, 'store']);
Route::prefix('products')
    ->group(function () {
        Route::get('/', [ProductController::class, 'index']);
        Route::get('/low-stock', [ProductController::class, 'lowStock']);
    });

Route::prefix('customers')
    ->group(function () {
        Route::get('/{email}', [CustomerController::class, 'show']);
        Route::get('/{email}/orders', [CustomerController::class, 'orders']);
    });
