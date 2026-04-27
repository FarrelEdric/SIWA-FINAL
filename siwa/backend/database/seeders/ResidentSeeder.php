<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ResidentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        \App\Models\Resident::truncate();
        \App\Models\Resident::factory()->count(20)->create();// Kita suruh factory buatkan 20 data sekaligus
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
    }
}
