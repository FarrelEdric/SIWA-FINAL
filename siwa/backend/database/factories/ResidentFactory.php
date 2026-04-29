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
        $firstNames = [
            'Budi',
            'Ahmad',
            'Siti',
            'Rini',
            'Arif',
            'Dewi',
            'Handoko',
            'Nurmalasari',
            'Bambang',
            'Widya',
            'Eko',
            'Lindawati',
            'Hendra',
            'Putri',
            'Irwan',
            'Sinta',
            'Joko',
            'Umi',
            'Krisna',
            'Lestari'
        ];

        $lastNames = [
            'Susanto',
            'Wijaya',
            'Hermawan',
            'Setiawan',
            'Kusuma',
            'Rahman',
            'Pratama',
            'Santoso',
            'Budiman',
            'Nugraha',
            'Adityawan',
            'Gunawan',
            'Hartono',
            'Sutrisno',
            'Soeharto',
            'Bambang',
            'Permana',
            'Hidayat',
            'Kuncoro',
            'Wirasana'
        ];

        $fullName = $this->faker->randomElement($firstNames) . ' ' . $this->faker->randomElement($lastNames);

        // Generate Indonesian phone number starting with 08
        $phoneNumber = '08' . $this->faker->numberBetween(12, 99) . '-' .
            $this->faker->numerify('####') . '-' .
            $this->faker->numerify('####');

        return [
            'full_name' => $fullName,
            'resident_status' => $this->faker->randomElement(['tetap', 'kontrak']),
            'phone_number' => $phoneNumber,
            'marital_status' => $this->faker->randomElement(['menikah', 'belum']),
            'ktp_photo' => null,
        ];
    }
}
