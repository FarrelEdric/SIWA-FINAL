<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\House;
use App\Services\BillingService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected $billingService;

    public function __construct(BillingService $billingService)
    {
        $this->billingService = $billingService;
    }

    public function index()
    {
        return response()->json(Payment::with(['house', 'resident'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'house_id' => 'required|exists:houses,id',
            'resident_id' => 'required|exists:residents,id',
            'payment_type' => 'required|in:satpam,kebersihan',
            'amount' => 'required|numeric',
            'payment_period_start' => 'required|date',
            'payment_period_end' => 'required|date',
        ]);

        $payment = $this->billingService->recordPayment($validated);
        return response()->json($payment, 21);
    }

    public function show(Payment $payment)
    {
        return response()->json($payment->load(['house', 'resident']));
    }

    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'house_id' => 'required|exists:houses,id',
            'payment_type' => 'required|in:satpam,kebersihan',
        ]);

        $house = House::findOrFail($validated['house_id']);
        $amount = $this->billingService->calculateBill($house, $validated['payment_type']);

        return response()->json(['amount' => $amount]);
    }
}
