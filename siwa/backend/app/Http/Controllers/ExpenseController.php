<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index()
    {
        return response()->json(Expense::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric',
            'expense_date' => 'required|date',
            'category' => 'required|string',
            'recurring' => 'required|boolean',
        ]);

        $expense = Expense::create($validated);
        return response()->json($expense, 21);
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
            'amount' => 'numeric',
            'expense_date' => 'date',
            'category' => 'string',
            'recurring' => 'boolean',
        ]);

        $expense->update($validated);
        return response()->json($expense);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return response()->json(null, 24);
    }
}
