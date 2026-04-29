<?php

namespace App\Http\Controllers;

use App\Models\House;
use App\Services\OccupancyService;
use Illuminate\Http\Request;

class HouseController extends Controller
{
    protected $occupancyService;

    public function __construct(OccupancyService $occupancyService)
    {
        $this->occupancyService = $occupancyService;
    }

    public function index(Request $request)
    {
        $query = House::with(['currentResident', 'occupancyHistories.resident', 'payments.resident']);

        $q = trim((string) $request->query('q', ''));
        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $like = '%' . $q . '%';
                $sub->where('house_number', 'like', $like)
                    ->orWhere('status', 'like', $like)
                    ->orWhereHas('currentResident', function ($r) use ($like) {
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
            'house_number' => 'required|string|unique:houses,house_number',
            'status' => 'required|in:dihuni,tidak_dihuni',
        ]);

        $house = House::create($validated);
        return response()->json($house, 201);
    }

    public function show(House $house)
    {
        return response()->json($house->load(['currentResident', 'occupancyHistories.resident', 'payments.resident']));
    }

    public function update(Request $request, House $house)
    {
        $validated = $request->validate([
            'house_number' => 'string|unique:houses,house_number,' . $house->id,
            'status' => 'in:dihuni,tidak_dihuni',
        ]);

        $house->update($validated);
        return response()->json($house);
    }

    public function destroy(House $house)
    {
        $house->delete();
        return response()->json(null, 204);
    }

    public function assignResident(Request $request, House $house)
    {
        $validated = $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'start_date' => 'required|date',
        ]);

        $history = $this->occupancyService->assignResident($house, $validated['resident_id'], $validated['start_date']);
        return response()->json($history);
    }

    public function vacate(Request $request, House $house)
    {
        $validated = $request->validate([
            'end_date' => 'required|date',
        ]);

        $this->occupancyService->vacateHouse($house, $validated['end_date']);
        return response()->json(['message' => 'House vacated']);
    }
}
