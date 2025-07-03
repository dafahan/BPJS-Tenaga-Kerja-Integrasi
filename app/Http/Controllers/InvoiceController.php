<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceDetail;
use App\Models\InvoiceCategory;
use App\Models\MedicalRecord;
use App\Models\Category;
use App\Models\Service;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Invoice::with(['medicalRecord.patient', 'creator', 'approver', 'invoiceDetails', 'invoiceCategories']);

        // Filter by status if provided
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Role-based filtering
        if ($user->role === 'admin_bpjs') {
            $query->whereIn('status', ['submitted', 'approved', 'rejected']);
        }

        $invoices = $query->orderBy('created_at', 'desc')->paginate(20);

        // Load data for modal forms
        $medicalRecords = MedicalRecord::with('patient')
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get();
            
        $categories = Category::active()->orderBy('name')->get();
        $services = Service::active()->orderBy('name')->get();
        $medicines = Medicine::active()->orderBy('name')->get();

        return Inertia::render('Invoices', [
            'invoices' => $invoices,
            'filters' => $request->only('status'),
            'medicalRecords' => $medicalRecords,
            'categories' => $categories,
            'services' => $services,
            'medicines' => $medicines,
        ]);
    }

    public function create()
    {
        // This method is no longer needed since we use modal
        return redirect()->route('invoices.index');
    }

    // Update InvoiceController.php store method
    public function store(Request $request)
    {
        $validated = $request->validate([
            'medical_record_id' => 'required|exists:medical_records,id',
            'invoice_number' => 'required|string|unique:invoices',
            'tanggal_jkk' => 'required|date',
            'notes' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.item_type' => 'required|in:service,medicine',
            'details.*.item_id' => 'required|integer',
            'details.*.quantity' => 'required|integer|min:1',
            'details.*.unit_price' => 'required|numeric|min:0',
        ]);

        $invoice = Invoice::create([
            'medical_record_id' => $validated['medical_record_id'],
            'invoice_number' => $validated['invoice_number'],
            'tanggal_jkk' => $validated['tanggal_jkk'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'draft',
            'created_by' => auth()->id(),
            'total_amount' => 0
        ]);

        $totalAmount = 0;
        foreach ($validated['details'] as $detail) {
            $subtotal = $detail['quantity'] * $detail['unit_price'];
            
            $itemName = $this->getItemName($detail['item_type'], $detail['item_id']);
            $itemCode = $this->getItemCode($detail['item_type'], $detail['item_id']);

            InvoiceDetail::create([
                'invoice_id' => $invoice->id,
                'item_type' => $detail['item_type'],
                'item_id' => $detail['item_id'],
                'item_name' => $itemName,
                'item_code' => $itemCode,
                'quantity' => $detail['quantity'],
                'unit_price' => $detail['unit_price'],
                'subtotal' => $subtotal
            ]);

            $totalAmount += $subtotal;
        }

        $invoice->update(['total_amount' => $totalAmount]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Invoice created successfully',
                'invoice' => $invoice->load(['medicalRecord.patient'])
            ]);
        }

        return redirect()->route('invoices.index')->with('success', 'Invoice created successfully');
    }

    // Update InvoiceController.php update method
    public function update(Request $request, Invoice $invoice)
    {
        if ($invoice->status !== 'draft') {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Cannot edit submitted invoice'], 422);
            }
            return redirect()->back()->with('error', 'Cannot edit submitted invoice');
        }

        $validated = $request->validate([
            'tanggal_jkk' => 'required|date',
            'notes' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.item_type' => 'required|in:service,medicine',
            'details.*.item_id' => 'required|integer',
            'details.*.quantity' => 'required|integer|min:1',
            'details.*.unit_price' => 'required|numeric|min:0',
        ]);

        $invoice->update([
            'tanggal_jkk' => $validated['tanggal_jkk'],
            'notes' => $validated['notes'] ?? null
        ]);
        
        $invoice->invoiceDetails()->delete();

        $totalAmount = 0;
        foreach ($validated['details'] as $detail) {
            $subtotal = $detail['quantity'] * $detail['unit_price'];
            
            $itemName = $this->getItemName($detail['item_type'], $detail['item_id']);
            $itemCode = $this->getItemCode($detail['item_type'], $detail['item_id']);

            InvoiceDetail::create([
                'invoice_id' => $invoice->id,
                'item_type' => $detail['item_type'],
                'item_id' => $detail['item_id'],
                'item_name' => $itemName,
                'item_code' => $itemCode,
                'quantity' => $detail['quantity'],
                'unit_price' => $detail['unit_price'],
                'subtotal' => $subtotal
            ]);

            $totalAmount += $subtotal;
        }

        $invoice->update(['total_amount' => $totalAmount]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Invoice updated successfully',
                'invoice' => $invoice->load(['medicalRecord.patient'])
            ]);
        }

        return redirect()->back()->with('success', 'Invoice updated successfully');
    }

    public function show(Invoice $invoice)
    {
        $invoice->load([
            'medicalRecord.patient',
            'invoiceDetails',
            'invoiceCategories',
            'creator',
            'approver'
        ]);

        return Inertia::render('InvoicesShow', [
            'invoice' => $invoice
        ]);
    }

    public function edit(Invoice $invoice)
    {
        if ($invoice->status !== 'draft') {
            return redirect()->route('invoices.index')->with('error', 'Cannot edit submitted invoice');
        }

        $invoice->load([
            'medicalRecord.patient',
            'invoiceDetails',
            'invoiceCategories'
        ]);
        
        $medicalRecords = MedicalRecord::with('patient')
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get();
            
        $categories = Category::active()->orderBy('name')->get();
        $services = Service::active()->orderBy('name')->get();
        $medicines = Medicine::active()->orderBy('name')->get();

        return Inertia::render('InvoiceEdit', [
            'invoice' => $invoice,
            'medicalRecords' => $medicalRecords,
            'categories' => $categories,
            'services' => $services,
            'medicines' => $medicines,
        ]);
    }



    public function submit(Invoice $invoice)
    {
        if ($invoice->status !== 'draft') {
            if (request()->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Invoice already submitted'], 422);
            }
            return redirect()->back()->with('error', 'Invoice already submitted');
        }

        $invoice->update([
            'status' => 'submitted',
            'submitted_at' => now()
        ]);

        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Invoice submitted successfully'
            ]);
        }

        return redirect()->back()->with('success', 'Invoice submitted successfully');
    }

    public function approve(Invoice $invoice)
    {
        if ($invoice->status !== 'submitted') {
            if (request()->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Invoice not in submitted status'], 422);
            }
            return redirect()->back()->with('error', 'Invoice not in submitted status');
        }

        $invoice->approve(auth()->id());

        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Invoice approved successfully'
            ]);
        }

        return redirect()->back()->with('success', 'Invoice approved successfully');
    }

    public function reject(Request $request, Invoice $invoice)
    {
        if ($invoice->status !== 'submitted') {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Invoice not in submitted status'], 422);
            }
            return redirect()->back()->with('error', 'Invoice not in submitted status');
        }

        $validated = $request->validate([
            'notes' => 'required|string'
        ]);

        $invoice->reject(auth()->id(), $validated['notes']);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Invoice rejected successfully'
            ]);
        }

        return redirect()->back()->with('success', 'Invoice rejected successfully');
    }

    public function destroy(Invoice $invoice)
    {
        if ($invoice->status !== 'draft') {
            if (request()->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Cannot delete submitted invoice'], 422);
            }
            return redirect()->back()->with('error', 'Cannot delete submitted invoice');
        }

        $invoice->delete();

        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Invoice deleted successfully'
            ]);
        }

        return redirect()->back()->with('success', 'Invoice deleted successfully');
    }

    public function print(Invoice $invoice)
    {
        $invoice->load([
            'medicalRecord.patient',
            'invoiceDetails',
            'invoiceCategories'
        ]);

        // Convert logos to base64 for PDF
        $logoRSI = null;
        $logoBPJS = null;
        
        $logoRSIPath = public_path('Logo_RSI.jpg');
        if (file_exists($logoRSIPath)) {
            $logoRSI = 'data:image/jpeg;base64,' . base64_encode(file_get_contents($logoRSIPath));
        }
        
        $logoBPJSPath = public_path('Logo_BPJS.svg');
        if (file_exists($logoBPJSPath)) {
            $logoBPJS = 'data:image/svg+xml;base64,' . base64_encode(file_get_contents($logoBPJSPath));
        }

        $pdf = Pdf::loadView('invoices.print', compact('invoice', 'logoRSI', 'logoBPJS'));
        $pdf->setPaper('a4', 'portrait');
        
        // Use stream for viewing in browser, download for force download
        if (request()->has('download')) {
            return $pdf->download("invoice-{$invoice->invoice_number}.pdf");
        }
        
        return $pdf->stream("invoice-{$invoice->invoice_number}.pdf");
    }

    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'details' => 'required|array',
            'details.*.quantity' => 'required|integer|min:1',
            'details.*.unit_price' => 'required|numeric|min:0',
            'categories' => 'nullable|array',
            'categories.*.total_amount' => 'required|numeric|min:0'
        ]);

        $detailsTotal = collect($validated['details'])->sum(function ($detail) {
            return $detail['quantity'] * $detail['unit_price'];
        });

        $categoriesTotal = collect($validated['categories'] ?? [])->sum('total_amount');

        return response()->json([
            'details_total' => $detailsTotal,
            'categories_total' => $categoriesTotal,
            'grand_total' => $detailsTotal + $categoriesTotal
        ]);
    }

    private function getItemName($type, $id)
    {
        switch ($type) {
            case 'service':
                return Service::find($id)->name ?? '';
            case 'medicine':
                return Medicine::find($id)->name ?? '';
            default:
                return '';
        }
    }

    private function getItemCode($type, $id)
    {
        switch ($type) {
            case 'service':
                return Service::find($id)->code ?? '';
            case 'medicine':
                return Medicine::find($id)->code ?? '';
            default:
                return '';
        }
    }
}