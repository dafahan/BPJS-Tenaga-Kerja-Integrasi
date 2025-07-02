<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Patient;
use App\Models\MedicalRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports', [
            'userRole' => auth()->user()->role
        ]);
    }

    public function invoices(Request $request)
    {
        $query = Invoice::with(['medicalRecord.patient', 'creator', 'approver']);

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $invoices = $query->orderBy('created_at', 'desc')->get();

        $summary = [
            'total_invoices' => $invoices->count(),
            'total_amount' => $invoices->sum('total_amount'),
            'approved_amount' => $invoices->where('status', 'approved')->sum('total_amount'),
            'pending_count' => $invoices->where('status', 'submitted')->count(),
            'approved_count' => $invoices->where('status', 'approved')->count(),
            'rejected_count' => $invoices->where('status', 'rejected')->count(),
        ];

        return Inertia::render('ReportsInvoices', [
            'invoices' => $invoices,
            'summary' => $summary,
            'filters' => $request->only(['date_from', 'date_to', 'status'])
        ]);
    }

    public function patients(Request $request)
    {
        $query = Patient::with(['medicalRecords', 'invoices'])
            ->withCount(['medicalRecords', 'invoices']);

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $patients = $query->orderBy('nama_pasien')->get();

        $summary = [
            'total_patients' => $patients->count(),
            'total_medical_records' => $patients->sum('medical_records_count'),
            'total_invoices' => $patients->sum('invoices_count'),
            'active_patients' => $patients->filter(function($patient) {
                return $patient->medicalRecords->where('status', 'active')->count() > 0;
            })->count()
        ];

        return Inertia::render('ReportsPatients', [
            'patients' => $patients,
            'summary' => $summary,
            'filters' => $request->only(['date_from', 'date_to'])
        ]);
    }
}