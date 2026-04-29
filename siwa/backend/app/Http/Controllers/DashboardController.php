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

        // Chart Data (January to December for Selected Year)
        $chartData = [];
        for ($m = 1; $m <= 12; $m++) {
            $income = Payment::whereMonth('payment_date', $m)
                ->whereYear('payment_date', $year)
                ->sum('amount');

            $expense = Expense::whereMonth('expense_date', $m)
                ->whereYear('expense_date', $year)
                ->sum('amount');

            $chartData[] = [
                'month' => Carbon::create($year, $m, 1)->format('M'),
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
