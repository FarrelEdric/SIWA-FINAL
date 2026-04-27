<?php

namespace App\Services;

use App\Models\House;
use App\Models\Payment;
use App\Models\Resident;
use Carbon\Carbon;

class BillingService
{
    const FEES = [
        'satpam' => 100000,
        'kebersihan' => 15000,
    ];

    public function calculateBill(House $house, string $type)
    {
        $resident = $house->currentResident;

        if (!$resident) {
            return 0; // Empty house
        }

        if ($resident->resident_status === 'kontrak') {
            // Contract house only billed if occupied (handled by if above)
            return self::FEES[$type] ?? 0;
        }

        return self::FEES[$type] ?? 0;
    }

    public function recordPayment(array $data)
    {
        return Payment::create([
            'house_id' => $data['house_id'],
            'resident_id' => $data['resident_id'],
            'payment_type' => $data['payment_type'],
            'amount' => $data['amount'],
            'payment_period_start' => $data['payment_period_start'],
            'payment_period_end' => $data['payment_period_end'],
            'payment_date' => now(),
            'status' => 'paid',
        ]);
    }
}
