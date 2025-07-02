<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceDetail;
use App\Models\InvoiceCategory;
use App\Models\MedicalRecord;
use App\Models\Category;
use App\Models\Service;
use App\Models\Medicine;
use App\Models\Action;
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
        $actions = Action::active()->orderBy('name')->get();

        return Inertia::render('Invoices', [
            'invoices' => $invoices,
            'filters' => $request->only('status'),
            'medicalRecords' => $medicalRecords,
            'categories' => $categories,
            'services' => $services,
            'medicines' => $medicines,
            'actions' => $actions
        ]);
    }

    public function create()
    {
        // This method is no longer needed since we use modal
        return redirect()->route('invoices.index');
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            'medical_record_id' => 'required|exists:medical_records,id',
            'invoice_number' => 'required|string|unique:invoices',
            'tanggal_jkk' => 'required|date',
            'notes' => 'nullable|string',
            'details' => 'nullable|array',
            'details.*.item_type' => 'required_with:details|in:service,medicine,action',
            'details.*.item_id' => 'required_with:details|integer',
            'details.*.quantity' => 'required_with:details|integer|min:1',
            'details.*.unit_price' => 'required_with:details|numeric|min:0',
            'categories' => 'nullable|array',
            'categories.*.category_id' => 'required|exists:categories,id',
            'categories.*.total_amount' => 'required|numeric|min:0',
            'categories.*.description' => 'nullable|string'
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
        // add invoice details
        $totalDetails = 0;
        if (isset($validated['details']) && !empty($validated['details'])) {
            foreach ($validated['details'] as $detail) {
                $subtotal = $detail['quantity'] * $detail['unit_price'];
                
                // Get item info
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

                $totalDetails += $subtotal;
            }
        }

        // Add invoice categories
        $totalCategories = 0;
        if (isset($validated['categories'])) {
            foreach ($validated['categories'] as $categoryData) {
                $category = Category::find($categoryData['category_id']);
                
                InvoiceCategory::create([
                    'invoice_id' => $invoice->id,
                    'category_id' => $categoryData['category_id'],
                    'category_name' => $category->name,
                    'total_amount' => $categoryData['total_amount'],
                    'description' => $categoryData['description'] ?? null
                ]);

                $totalCategories += $categoryData['total_amount'];
            }
        }

        // Update total amount
        $invoice->update(['total_amount' => $totalDetails + $totalCategories]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Invoice created successfully',
                'invoice' => $invoice->load(['medicalRecord.patient'])
            ]);
        }

        return redirect()->route('invoices.index')->with('success', 'Invoice created successfully');
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
        $actions = Action::active()->orderBy('name')->get();

        return Inertia::render('InvoiceEdit', [
            'invoice' => $invoice,
            'medicalRecords' => $medicalRecords,
            'categories' => $categories,
            'services' => $services,
            'medicines' => $medicines,
            'actions' => $actions
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        
        if ($invoice->status !== 'draft' && auth()->user()->role === 'admin_rs') {
            if ($request->expectsJson()) {
                return response()->json(['success' => false, 'message' => 'Cannot edit submitted invoice'], 422);
            }
            return redirect()->back()->with('error', 'Cannot edit submitted invoice');
        }

        $validated = $request->validate([
            'tanggal_jkk' => 'required|date',
            'notes' => 'nullable|string',
            'details' => 'nullable|array',
            'details.*.item_type' => 'required_with:details|in:service,medicine,action',
            'details.*.item_id' => 'required_with:details|integer',
            'details.*.quantity' => 'required_with:details|integer|min:1',
            'details.*.unit_price' => 'required_with:details|numeric|min:0',
            'categories' => 'nullable|array',
            'categories.*.category_id' => 'required|exists:categories,id',
            'categories.*.total_amount' => 'required|numeric|min:0',
            'categories.*.description' => 'nullable|string'
        ]);

        $invoice->update([
            'tanggal_jkk' => $validated['tanggal_jkk'],
            'notes' => $validated['notes'] ?? null
        ]);

        // Delete existing details and categories
        $invoice->invoiceDetails()->delete();
        $invoice->invoiceCategories()->delete();

        // Re-add details and categories (same logic as store)
        $totalDetails = 0;
        if (isset($validated['details']) && !empty($validated['details'])) {
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

                $totalDetails += $subtotal;
            }
        }

        $totalCategories = 0;
        if (isset($validated['categories'])) {
            foreach ($validated['categories'] as $categoryData) {
                $category = Category::find($categoryData['category_id']);
                
                InvoiceCategory::create([
                    'invoice_id' => $invoice->id,
                    'category_id' => $categoryData['category_id'],
                    'category_name' => $category->name,
                    'total_amount' => $categoryData['total_amount'],
                    'description' => $categoryData['description'] ?? null
                ]);

                $totalCategories += $categoryData['total_amount'];
            }
        }

        $invoice->update(['total_amount' => $totalDetails + $totalCategories]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Invoice updated successfully',
                'invoice' => $invoice->load(['medicalRecord.patient'])
            ]);
        }

        return redirect()->back()->with('success', 'Invoice updated successfully');
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
            case 'action':
                return Action::find($id)->name ?? '';
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
            case 'action':
                return Action::find($id)->code ?? '';
            default:
                return '';
        }
    }
}