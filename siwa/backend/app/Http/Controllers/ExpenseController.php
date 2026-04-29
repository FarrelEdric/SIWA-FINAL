<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::query();

        $q = trim((string) $request->query('q', ''));
        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $like = '%' . $q . '%';
                $sub->where('title', 'like', $like)
                    ->orWhere('category', 'like', $like)
                    ->orWhere('description', 'like', $like)
                    ->orWhere('amount', 'like', $like);
            });
        }

        if ($request->has('month') && $request->query('month') != '') {
            $query->whereMonth('expense_date', $request->query('month'));
        }
        if ($request->has('year') && $request->query('year') != '') {
            $query->whereYear('expense_date', $request->query('year'));
        }

        $month = $request->query('month');
        $year = $request->query('year');

        $incomeQuery = \App\Models\Payment::query();
        if ($month) $incomeQuery->whereMonth('payment_date', $month);
        if ($year) $incomeQuery->whereYear('payment_date', $year);
        $totalIncome = $incomeQuery->sum('amount');

        $totalGlobalIncome = \App\Models\Payment::sum('amount');
        $totalGlobalExpense = Expense::sum('amount');
        $globalBalance = $totalGlobalIncome - $totalGlobalExpense;

        $totalPeriodExpense = (clone $query)->sum('amount');

        // Backward compatible: without pagination params, return full list.
        if (!$request->has('page') && !$request->has('per_page')) {
            $items = $query->orderByDesc('id')->get();
            return response()->json([
                'data' => $items,
                'summary' => [
                    'total_income' => (float)$totalIncome,
                    'total_expense' => (float)$totalPeriodExpense,
                    'global_balance' => (float)$globalBalance,
                ]
            ]);
        }

        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $paginated = $query->orderByDesc('id')->paginate($perPage);

        return response()->json([
            'data' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
            'summary' => [
                'total_income' => (float)$totalIncome,
                'total_expense' => (float)$totalPeriodExpense,
                'global_balance' => (float)$globalBalance,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:1',
            'expense_date' => 'required|date',
            'category' => 'required|string',
            'recurring' => 'required|boolean',
        ]);

        // Validasi Saldo Utama
        $totalIncome = \App\Models\Payment::sum('amount');
        $totalExpense = Expense::sum('amount');
        $currentBalance = $totalIncome - $totalExpense;

        if ($validated['amount'] > $currentBalance) {
            return response()->json([
                'message' => 'Saldo Utama tidak mencukupi untuk melakukan pengeluaran ini. (Saldo saat ini: Rp ' . number_format($currentBalance, 0, ',', '.') . ')'
            ], 422);
        }

        $expense = Expense::create($validated);
        return response()->json($expense, 201);
    }

    public function show(Expense $expense)
    {
        return response()->json($expense);
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'amount' => 'numeric|min:1',
            'expense_date' => 'date',
            'category' => 'string',
            'recurring' => 'boolean',
        ]);

        if (isset($validated['amount'])) {
            $totalIncome = \App\Models\Payment::sum('amount');
            $totalExpenseExceptThis = Expense::where('id', '!=', $expense->id)->sum('amount');
            $maxAllowed = $totalIncome - $totalExpenseExceptThis;

            if ($validated['amount'] > $maxAllowed) {
                return response()->json([
                    'message' => 'Saldo Utama tidak mencukupi untuk memperbarui nominal pengeluaran ini. (Maksimum yang diperbolehkan: Rp ' . number_format($maxAllowed, 0, ',', '.') . ')'
                ], 422);
            }
        }

        $expense->update($validated);
        return response()->json($expense);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return response()->json(null, 204);
    }

    public function destroyAll()
    {
        Expense::query()->delete();
        return response()->json(['message' => 'All expenses deleted'], 200);
    }
}
