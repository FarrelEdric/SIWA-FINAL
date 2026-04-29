<?php

namespace App\Http\Controllers;

use App\Models\House;
use App\Models\Payment;
use App\Models\Resident;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->query('month', now()->month);
        $year = $request->query('year', now()->year);
        
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth();

        $perPage = $request->query('per_page', 10);
        $search = $request->query('search', '');
        
        $query = House::with(['currentResident']);
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('house_number', 'like', "%$search%")
                  ->orWhereHas('currentResident', function($sq) use ($search) {
                      $sq->where('full_name', 'like', "%$search%");
                  });
            });
        }

        $paginatedHouses = $query->paginate($perPage);
        
        $summary = collect($paginatedHouses->items())->map(function ($house) use ($startDate, $endDate) {
            $resident = $house->currentResident;
            
            $status = [
                'house_id' => $house->id,
                'house_number' => $house->house_number,
                'resident_name' => $resident ? $resident->full_name : 'Kosong',
                'resident_status' => $resident ? $resident->resident_status : null,
                'satpam' => 'none',
                'kebersihan' => 'none',
                'must_pay' => false,
            ];

            if ($resident) {
                $status['must_pay'] = true;
                
                // Check Satpam
                $satpamPayment = Payment::where('house_id', $house->id)
                    ->where('payment_type', 'satpam')
                    ->where(function($q) use ($startDate, $endDate) {
                        $q->where('payment_period_start', '<=', $endDate)
                          ->where('payment_period_end', '>=', $startDate);
                    })
                    ->first();
                
                $status['satpam'] = $satpamPayment ? 'lunas' : 'belum';

                // Check Kebersihan
                $kebersihanPayment = Payment::where('house_id', $house->id)
                    ->where('payment_type', 'kebersihan')
                    ->where(function($q) use ($startDate, $endDate) {
                        $q->where('payment_period_start', '<=', $endDate)
                          ->where('payment_period_end', '>=', $startDate);
                    })
                    ->first();
                
                $status['kebersihan'] = $kebersihanPayment ? 'lunas' : 'belum';
            } else {
                $status['satpam'] = 'none';
                $status['kebersihan'] = 'none';
                $status['must_pay'] = false;
            }

            return $status;
        });

        // Calculate total stats for the whole month
        $allHouses = House::with(['currentResident'])->get();
        $totalWajib = 0;
        $totalLunas = 0;
        $totalTunggakan = 0;

        foreach ($allHouses as $h) {
            $res = $h->currentResident;
            if ($res) {
                $totalWajib++;
                
                $sPay = Payment::where('house_id', $h->id)
                    ->where('payment_type', 'satpam')
                    ->where(function($q) use ($startDate, $endDate) {
                        $q->where('payment_period_start', '<=', $endDate)
                          ->where('payment_period_end', '>=', $startDate);
                    })->exists();

                $kPay = Payment::where('house_id', $h->id)
                    ->where('payment_type', 'kebersihan')
                    ->where(function($q) use ($startDate, $endDate) {
                        $q->where('payment_period_start', '<=', $endDate)
                          ->where('payment_period_end', '>=', $startDate);
                    })->exists();

                if ($sPay && $kPay) {
                    $totalLunas++;
                } else {
                    $totalTunggakan++;
                }
            }
        }

        return response()->json([
            'data' => $summary,
            'meta' => [
                'current_page' => $paginatedHouses->currentPage(),
                'last_page' => $paginatedHouses->lastPage(),
                'per_page' => $paginatedHouses->perPage(),
                'total' => $paginatedHouses->total(),
            ],
            'stats' => [
                'total_wajib' => $totalWajib,
                'total_lunas' => $totalLunas,
                'total_tunggakan' => $totalTunggakan,
            ]
        ]);
    }
}
