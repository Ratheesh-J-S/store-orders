<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    // public function run(): void
    // {
    //     // User::factory(10)->create();

    //     User::factory()->create([
    //         'name' => 'Test User',
    //         'email' => 'test@example.com',
    //     ]);
    // }\

    public function run(): void
    {
        $catalog = [
            ['Colgate Toothpaste', 'COL-100', 50, 12, 40],
            ['Parle-G Biscuit', 'PAR-005', 10, 12, 60],
            ['Bread', 'BRD-001', 40, 5, 4],
            ['Milk 1L', 'MLK-001', 56, 5, 9],
            ['Eggs (12)', 'EGG-012', 84, 5, 2],
            ['Basmati Rice 1kg', 'RIC-001', 120, 5, 35],
        ];
        foreach ($catalog as [$name, $code, $price, $tax, $stock]) {
            Product::updateOrCreate(['code' => $code], [
                'name'          => $name,
                'price'         => $price,
                'tax_percent'   => $tax,
                'stock'         => $stock,
            ]);
        }

        Product::factory()->count(6)->create();

        Customer::updateOrCreate(
            ['email' => 'thomas@example.com'],
            ['name'  => 'Thomas']
        );
        // Customer::factory()->count(5)->create();
    }
}
