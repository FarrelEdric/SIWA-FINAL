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

    public function index(Request $request)
    {
        $query = Payment::with(['house', 'resident']);

        // Backward compatible: without pagination params, return full list.
        if (!$request->has('page') && !$request->has('per_page')) {
            return response()->json($query->get());
        }

        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        return response()->json(
            $query->orderByDesc('id')->paginate($perPage)
        );
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
        return response()->json($payment, 201);
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
