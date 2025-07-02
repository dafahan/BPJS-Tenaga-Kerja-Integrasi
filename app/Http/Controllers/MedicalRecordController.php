<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicalRecordController extends Controller
{
    public function index()
    {
        $medicalRecords = MedicalRecord::with(['patient', 'creator'])
            ->withCount('invoices')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('MedicalRecords', [
            'medicalRecords' => $medicalRecords
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'no_rawat_medis' => 'required|string|max:50|unique:medical_records',
            'tgl_kecelakaan' => 'required|date',
            'tgl_pengobatan' => 'required|date',
            'tgl_masuk' => 'required|date',
            'tgl_keluar' => 'nullable|date|after_or_equal:tgl_masuk',
            'diagnosis' => 'required|string',
            'keluhan' => 'required|string',
            'jenis_rawat' => 'required|in:rawat_jalan,rawat_inap,ugd',
            'status' => 'in:active,completed'
        ]);

        $validated['created_by'] = auth()->id();
        $validated['status'] = $validated['status'] ?? 'active';

        $medicalRecord = MedicalRecord::create($validated);

        return response()->json([
            'message' => 'Medical record created successfully',
            'medicalRecord' => $medicalRecord->load(['patient', 'creator'])
        ]);
    }

    public function show(MedicalRecord $medicalRecord)
    {
        $medicalRecord->load(['patient', 'creator', 'invoices']);
        
        return Inertia::render('MedicalRecordsShow', [
            'medicalRecord' => $medicalRecord
        ]);
    }

    public function update(Request $request, MedicalRecord $medicalRecord)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'no_rawat_medis' => 'required|string|max:50|unique:medical_records,no_rawat_medis,' . $medicalRecord->id,
            'tgl_kecelakaan' => 'required|date',
            'tgl_pengobatan' => 'required|date',
            'tgl_masuk' => 'required|date',
            'tgl_keluar' => 'nullable|date|after_or_equal:tgl_masuk',
            'diagnosis' => 'required|string',
            'keluhan' => 'required|string',
            'jenis_rawat' => 'required|in:rawat_jalan,rawat_inap,ugd',
            'status' => 'in:active,completed'
        ]);

        $medicalRecord->update($validated);

        return response()->json([
            'message' => 'Medical record updated successfully',
            'medicalRecord' => $medicalRecord->load(['patient', 'creator'])
        ]);
    }

    public function destroy(MedicalRecord $medicalRecord)
    {
        $medicalRecord->delete();

        return response()->json([
            'message' => 'Medical record deleted successfully'
        ]);
    }
}