<?php

namespace Database\Factories;

use App\Models\Resident;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Resident>
 */
class ResidentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'full_name' => $this->faker->name(),
            'resident_status' => $this->faker->randomElement(['tetap', 'kontrak']),
            'phone_number' => $this->faker->phoneNumber(),
            'marital_status' => $this->faker->randomElement(['menikah', 'belum']),
            'ktp_photo' => null,
        ];
    }
}
