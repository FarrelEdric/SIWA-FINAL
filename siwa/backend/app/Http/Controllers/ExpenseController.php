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
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric',
            'expense_date' => 'required|date',
            'category' => 'required|string',
            'recurring' => 'required|boolean',
        ]);

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
        return response()->json(null, 204);
    }

    public function destroyAll()
    {
        Expense::query()->delete();
        return response()->json(['message' => 'All expenses deleted'], 200);
    }
}
