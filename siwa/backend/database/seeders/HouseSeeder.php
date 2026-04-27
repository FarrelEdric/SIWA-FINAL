<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 1; $i <= 20; $i++) {
            \App\Models\House::create([
                'house_number' => 'A' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'status' => 'tidak_dihuni',
            ]);
        }
    }
}
