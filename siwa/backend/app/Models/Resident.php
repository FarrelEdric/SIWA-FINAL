<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resident extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'ktp_photo',
        'resident_status',
        'phone_number',
        'marital_status',
    ];

    public function occupancyHistories()
    {
        return $this->hasMany(OccupancyHistory::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
