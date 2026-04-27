<?php

namespace App\Http\Controllers;

use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResidentController extends Controller
{
    public function index()
    {
        return response()->json(Resident::all());
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
        return response()->json($resident, 21);
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
        return response()->json(null, 24);
    }
}
