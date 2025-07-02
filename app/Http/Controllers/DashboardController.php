<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Patient;
use App\Models\Invoice;
use App\Models\MedicalRecord;
use App\Models\Category;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        $stats = [
            'total_patients' => Patient::count(),
            'total_invoices' => Invoice::count(),
            'pending_invoices' => Invoice::where('status', 'submitted')->count(),
            'approved_invoices' => Invoice::where('status', 'approved')->count(),
            'rejected_invoices' => Invoice::where('status', 'rejected')->count(),
            'total_revenue' => Invoice::where('status', 'approved')->sum('total_amount'),
            'active_medical_records' => MedicalRecord::where('status', 'active')->count(),
        ];

        // Recent invoices
        $recentInvoices = Invoice::with(['medicalRecord.patient'])
            ->latest()
            ->take(5)
            ->get();

        // Monthly revenue chart data
        $monthlyRevenue = Invoice::where('status', 'approved')
            ->whereYear('created_at', now()->year)
            ->selectRaw('MONTH(created_at) as month, SUM(total_amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->pluck('total', 'month');

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentInvoices' => $recentInvoices,
            'monthlyRevenue' => $monthlyRevenue,
            'userRole' => $user->role
        ]);
    }
}