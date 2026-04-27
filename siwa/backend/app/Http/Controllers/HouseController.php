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

    public function index()
    {
        return response()->json(House::with(['currentResident', 'occupancyHistories.resident'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'house_number' => 'required|string|unique:houses,house_number',
            'status' => 'required|in:dihuni,tidak_dihuni',
        ]);

        $house = House::create($validated);
        return response()->json($house, 21);
    }

    public function show(House $house)
    {
        return response()->json($house->load(['currentResident', 'occupancyHistories.resident']));
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
        return response()->json(null, 24);
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
