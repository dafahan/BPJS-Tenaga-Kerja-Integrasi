<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicineController extends Controller
{
    public function index()
    {
        $medicines = Medicine::orderBy('name')->get();

        return Inertia::render('Medicines', [
            'medicines' => $medicines
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:medicines',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'description' => 'nullable|string',
            'status' => 'boolean'
        ]);

        $medicine = Medicine::create($validated);

        return response()->json([
            'message' => 'Medicine created successfully',
            'medicine' => $medicine
        ]);
    }

    public function show(Medicine $medicine)
    {
        return response()->json($medicine);
    }

    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:medicines,code,' . $medicine->id,
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'description' => 'nullable|string',
            'status' => 'boolean'
        ]);

        $medicine->update($validated);

        return response()->json([
            'message' => 'Medicine updated successfully',
            'medicine' => $medicine
        ]);
    }

    public function destroy(Medicine $medicine)
    {
        $medicine->delete();

        return response()->json([
            'message' => 'Medicine deleted successfully'
        ]);
    }
}