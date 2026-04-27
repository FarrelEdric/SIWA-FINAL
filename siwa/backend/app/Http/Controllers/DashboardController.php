<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Expense;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->query('month', now()->month);
        $year = $request->query('year', now()->year);

        $date = Carbon::create($year, $month, 1);

        $totalIncome = Payment::whereMonth('payment_date', $month)
            ->whereYear('payment_date', $year)
            ->sum('amount');

        $totalExpense = Expense::whereMonth('expense_date', $month)
            ->whereYear('expense_date', $year)
            ->sum('amount');

        $balance = $totalIncome - $totalExpense;

        // Chart Data (Last 12 Months)
        $chartData = [];
        for ($i = 11; $i >= 0; $i--) {
            $currentDate = now()->subMonths($i);
            $m = $currentDate->month;
            $y = $currentDate->year;

            $income = Payment::whereMonth('payment_date', $m)
                ->whereYear('payment_date', $y)
                ->sum('amount');

            $expense = Expense::whereMonth('expense_date', $m)
                ->whereYear('expense_date', $y)
                ->sum('amount');

            $chartData[] = [
                'month' => $currentDate->format('M Y'),
                'income' => (float)$income,
                'expense' => (float)$expense,
            ];
        }

        $incomeDetails = Payment::with(['house', 'resident'])
            ->whereMonth('payment_date', $month)
            ->whereYear('payment_date', $year)
            ->get();

        $expenseDetails = Expense::whereMonth('expense_date', $month)
            ->whereYear('expense_date', $year)
            ->get();

        return response()->json([
            'summary' => [
                'total_income' => (float)$totalIncome,
                'total_expense' => (float)$totalExpense,
                'balance' => (float)$balance,
            ],
            'chart' => $chartData,
            'details' => [
                'income' => $incomeDetails,
                'expense' => $expenseDetails,
            ]
        ]);
    }
}
