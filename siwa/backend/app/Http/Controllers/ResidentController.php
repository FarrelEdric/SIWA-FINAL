<?php

namespace App\Http\Controllers;

use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResidentController extends Controller
{
    public function index(Request $request)
    {
        // Backward compatible: without pagination params, return full list.
        if (!$request->has('page') && !$request->has('per_page')) {
            return response()->json(Resident::all());
        }

        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        return response()->json(
            Resident::query()
                ->orderByDesc('id')
                ->paginate($perPage)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'ktp_photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'resident_status' => 'required|in:tetap,kontrak',
            'phone_number' => 'required|string|max:20',
            'marital_status' => 'required|in:menikah,belum',
        ]);

        if ($request->hasFile('ktp_photo')) {
            $path = $request->file('ktp_photo')->store('ktp_photos', 'public');
            $validated['ktp_photo'] = $path;
        }

        $resident = Resident::create($validated);
        return response()->json($resident, 201);
    }

    public function show(Resident $resident)
    {
        return response()->json($resident);
    }

    public function update(Request $request, Resident $resident)
    {
        $validated = $request->validate([
            'full_name' => 'string|max:255',
            'ktp_photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'resident_status' => 'in:tetap,kontrak',
            'phone_number' => 'string|max:20',
            'marital_status' => 'in:menikah,belum',
        ]);

        if ($request->hasFile('ktp_photo')) {
            if ($resident->ktp_photo) {
                Storage::disk('public')->delete($resident->ktp_photo);
            }
            $path = $request->file('ktp_photo')->store('ktp_photos', 'public');
            $validated['ktp_photo'] = $path;
        }

        $resident->update($validated);
        return response()->json($resident);
    }

    public function destroy(Resident $resident)
    {
        if ($resident->ktp_photo) {
            Storage::disk('public')->delete($resident->ktp_photo);
        }
        $resident->delete();
        return response()->json(null, 204);
    }

    public function destroyAll()
    {
        $photoPaths = Resident::query()
            ->whereNotNull('ktp_photo')
            ->pluck('ktp_photo')
            ->filter()
            ->values();

        foreach ($photoPaths as $path) {
            Storage::disk('public')->delete($path);
        }

        Resident::query()->delete();

        return response()->json(['message' => 'All residents deleted'], 200);
    }
}
