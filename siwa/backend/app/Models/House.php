<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class House extends Model
{
    use HasFactory;

    protected $fillable = [
        'house_number',
        'status',
    ];

    public function occupancyHistories()
    {
        return $this->hasMany(OccupancyHistory::class);
    }

    public function currentOccupancy()
    {
        return $this->hasOne(OccupancyHistory::class)->where('is_current', true);
    }

    public function currentResident()
    {
        return $this->hasOneThrough(
            Resident::class,
            OccupancyHistory::class,
            'house_id',
            'id',
            'id',
            'resident_id'
        )->where('occupancy_histories.is_current', true);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
