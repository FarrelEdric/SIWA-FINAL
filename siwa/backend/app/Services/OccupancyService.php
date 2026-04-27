<?php

namespace App\Services;

use App\Models\House;
use App\Models\OccupancyHistory;
use Illuminate\Support\Facades\DB;

class OccupancyService
{
    public function assignResident(House $house, int $residentId, string $startDate)
    {
        return DB::transaction(function () use ($house, $residentId, $startDate) {
            // End current occupancy if exists
            $house->currentOccupancy()->update([
                'end_date' => $startDate,
                'is_current' => false,
            ]);

            // Create new occupancy history
            $history = OccupancyHistory::create([
                'house_id' => $house->id,
                'resident_id' => $residentId,
                'start_date' => $startDate,
                'is_current' => true,
            ]);

            // Update house status
            $house->update(['status' => 'dihuni']);

            return $history;
        });
    }

    public function vacateHouse(House $house, string $endDate)
    {
        return DB::transaction(function () use ($house, $endDate) {
            $house->currentOccupancy()->update([
                'end_date' => $endDate,
                'is_current' => false,
            ]);

            $house->update(['status' => 'tidak_dihuni']);
        });
    }
}
