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

        $houses = House::with(['currentResident'])->get();
        
        $summary = $houses->map(function ($house) use ($startDate, $endDate) {
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

            // Logic: 
            // - Penghuni tetap ALWAYS tagged.
            // - Others only if occupied.
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
                // Empty house
                $status['satpam'] = 'none';
                $status['kebersihan'] = 'none';
                $status['must_pay'] = false;
            }

            return $status;
        });

        return response()->json($summary);
    }
}
