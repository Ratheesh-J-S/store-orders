<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Product> */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'          => ucfirst(fake()->unique()->words(2, true)),
            'code'          => strtoupper(fake()->unique()->bothify('??-####')),
            'price'         => fake()->randomFloat(2, 5, 500),
            'tax_percent'   => fake()->randomElement([0, 5, 12, 18]),
            'stock'         => fake()->numberBetween(0, 100),
        ];
    }
}
