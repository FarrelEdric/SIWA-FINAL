<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OccupancyHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'house_id',
        'resident_id',
        'start_date',
        'end_date',
        'is_current',
    ];

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }
}
