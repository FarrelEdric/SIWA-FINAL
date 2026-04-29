<?php

namespace Database\Seeders;

use App\Models\House;
use App\Models\Resident;
use App\Models\OccupancyHistory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class OccupancySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        OccupancyHistory::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $residents = Resident::all();
        $houses = House::all();

        // Assign 15 residents to 15 houses (permanent - tetap)
        for ($i = 0; $i < 15; $i++) {
            OccupancyHistory::create([
                'house_id' => $houses[$i]->id,
                'resident_id' => $residents[$i]->id,
                'start_date' => Carbon::now()->subMonths(12),
                'end_date' => null, // Permanent, no end date
                'is_current' => true,
            ]);
        }

        // Assign 5 residents to 5 houses (temporary/kontrak)
        // These residents will be in houses 1-5 temporarily
        for ($i = 15; $i < 20; $i++) {
            $houseIndex = ($i - 15) % 5; // Rotate through houses 1-5

            OccupancyHistory::create([
                'house_id' => $houses[$houseIndex]->id,
                'resident_id' => $residents[$i]->id,
                'start_date' => Carbon::now()->subMonths(3),
                'end_date' => Carbon::now()->addMonths(3), // Kontrak 6 bulan total (3 bulan sudah lewat)
                'is_current' => true,
            ]);
        }
    }
}
