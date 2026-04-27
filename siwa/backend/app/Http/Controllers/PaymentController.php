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

        $q = trim((string) $request->query('q', ''));
        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $like = '%' . $q . '%';
                $sub->where('payment_type', 'like', $like)
                    ->orWhere('status', 'like', $like)
                    ->orWhereHas('house', function ($h) use ($like) {
                        $h->where('house_number', 'like', $like);
                    })
                    ->orWhereHas('resident', function ($r) use ($like) {
                        $r->where('full_name', 'like', $like)
                            ->orWhere('phone_number', 'like', $like);
                    });
            });
        }

        // Backward compatible: without pagination params, return full list.
        if (!$request->has('page') && !$request->has('per_page')) {
            return response()->json($query->orderByDesc('id')->get());
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

    public function destroy(Payment $payment)
    {
        $payment->delete();
        return response()->json(null, 204);
    }

    public function destroyBulk(Request $request)
    {
        $ids = $request->input('ids');

        if ($ids === 'all') {
            Payment::truncate();
            return response()->json(['message' => 'All payments deleted']);
        }

        if (is_array($ids) && count($ids) > 0) {
            Payment::whereIn('id', $ids)->delete();
            return response()->json(['message' => 'Selected payments deleted']);
        }

        return response()->json(['message' => 'No payments selected'], 400);
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
