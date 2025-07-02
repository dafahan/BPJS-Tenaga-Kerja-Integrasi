<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function index()
    {
        $patients = Patient::with('medicalRecords')
            ->withCount('medicalRecords')
            ->orderBy('nama_pasien')
            ->paginate(20);

        return Inertia::render('Patients', [
            'patients' => $patients
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'no_kpj' => 'required|string|max:50|unique:patients',
            'nama_pasien' => 'required|string|max:255',
            'nik' => 'required|string|max:16|unique:patients',
            'alamat' => 'required|string',
            'telepon' => 'nullable|string|max:20',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|in:L,P'
        ]);

        $patient = Patient::create($validated);

        return response()->json([
            'message' => 'Patient created successfully',
            'patient' => $patient
        ]);
    }

    public function show(Patient $patient)
    {
        $patient->load(['medicalRecords.invoices']);
        
        return response()->json($patient);
    }

    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'no_kpj' => 'required|string|max:50|unique:patients,no_kpj,' . $patient->id,
            'nama_pasien' => 'required|string|max:255',
            'nik' => 'required|string|max:16|unique:patients,nik,' . $patient->id,
            'alamat' => 'required|string',
            'telepon' => 'nullable|string|max:20',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|in:L,P'
        ]);

        $patient->update($validated);

        return response()->json([
            'message' => 'Patient updated successfully',
            'patient' => $patient
        ]);
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();

        return response()->json([
            'message' => 'Patient deleted successfully'
        ]);
    }

    public function search(Request $request)
    {
        $search = $request->get('q');
        
        $patients = Patient::where('nama_pasien', 'like', "%{$search}%")
            ->orWhere('no_kpj', 'like', "%{$search}%")
            ->orWhere('nik', 'like', "%{$search}%")
            ->limit(10)
            ->get();

        return response()->json($patients);
    }
}