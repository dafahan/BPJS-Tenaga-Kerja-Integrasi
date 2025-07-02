<?php

// routes/web.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController; 
use App\Http\Controllers\HomeController; 
use App\Http\Controllers\DashboardController;

// Master Data Controllers
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\ActionController;

// Patient Management Controllers
use App\Http\Controllers\PatientController;
use App\Http\Controllers\MedicalRecordController;

// Billing Controllers
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\InvoiceDetailController;
use App\Http\Controllers\InvoiceCategoryController;

// Reports Controllers
use App\Http\Controllers\ReportController;

// BPJS Management Controllers
use App\Http\Controllers\BPJSController;

// System Controllers
use App\Http\Controllers\LogController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\ProfileController;

use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\Authenticate;

// Authentication Routes
Route::get('/login', [LoginController::class, 'index'])->middleware([Authenticate::class])->name('login');
Route::post('/login', [LoginController::class, 'store']);
Route::get('/logout', [LoginController::class, 'destroy'])->middleware('auth');

// Protected Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/', [HomeController::class, 'index']); 
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

// Routes accessible by both Admin RS and Admin BPJS
Route::middleware(['auth', RoleMiddleware::class.':admin_bpjs,admin_rs'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // System Routes (accessible to all authenticated users)
    Route::prefix('logs')->name('logs.')->group(function () {
        Route::get('/', [LogController::class, 'index'])->name('index');
        Route::get('/{log}', [LogController::class, 'show'])->name('show');
    });
    
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [SettingController::class, 'index'])->name('index');
        Route::put('/', [SettingController::class, 'update'])->name('update');
    });
    
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'index'])->name('index');
        Route::put('/', [ProfileController::class, 'update'])->name('update');
        Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');
    });
    
    // Invoice Routes (shared access with different permissions)
    Route::prefix('invoices')->name('invoices.')->group(function () {
        Route::get('/', [InvoiceController::class, 'index'])->name('index');
        Route::get('/submitted', [InvoiceController::class, 'submitted'])->name('submitted');
        Route::get('/approved', [InvoiceController::class, 'approved'])->name('approved');
        Route::get('/rejected', [InvoiceController::class, 'rejected'])->name('rejected');
        Route::get('/{invoice}', [InvoiceController::class, 'show'])->name('show');
        Route::get('/{invoice}/print', [InvoiceController::class, 'print'])->name('print');
    });
    
    // Reports Routes (shared access)
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/invoices', [ReportController::class, 'invoices'])->name('invoices');
        Route::get('/billing-summary', [ReportController::class, 'billingSummary'])->name('billing-summary');
        Route::post('/invoices/export', [ReportController::class, 'exportInvoices'])->name('invoices.export');
        Route::post('/billing-summary/export', [ReportController::class, 'exportBillingSummary'])->name('billing-summary.export');
    });
});

// Admin RS Only Routes
Route::middleware(['auth', RoleMiddleware::class.':admin_rs'])->group(function () {
    
    // Master Data Routes
    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', [CategoryController::class, 'index'])->name('index');
        Route::get('/create', [CategoryController::class, 'create'])->name('create');
        Route::post('/', [CategoryController::class, 'store'])->name('store');
        Route::get('/{category}', [CategoryController::class, 'show'])->name('show');
        Route::get('/{category}/edit', [CategoryController::class, 'edit'])->name('edit');
        Route::put('/{category}', [CategoryController::class, 'update'])->name('update');
        Route::delete('/{category}', [CategoryController::class, 'destroy'])->name('destroy');
        Route::patch('/{category}/toggle-status', [CategoryController::class, 'toggleStatus'])->name('toggle-status');
    });
    
    Route::prefix('services')->name('services.')->group(function () {
        Route::get('/', [ServiceController::class, 'index'])->name('index');
        Route::get('/create', [ServiceController::class, 'create'])->name('create');
        Route::post('/', [ServiceController::class, 'store'])->name('store');
        Route::get('/{service}', [ServiceController::class, 'show'])->name('show');
        Route::get('/{service}/edit', [ServiceController::class, 'edit'])->name('edit');
        Route::put('/{service}', [ServiceController::class, 'update'])->name('update');
        Route::delete('/{service}', [ServiceController::class, 'destroy'])->name('destroy');
        Route::patch('/{service}/toggle-status', [ServiceController::class, 'toggleStatus'])->name('toggle-status');
        Route::get('/by-category/{category}', [ServiceController::class, 'byCategory'])->name('by-category');
    });
    
    Route::prefix('medicines')->name('medicines.')->group(function () {
        Route::get('/', [MedicineController::class, 'index'])->name('index');
        Route::get('/create', [MedicineController::class, 'create'])->name('create');
        Route::post('/', [MedicineController::class, 'store'])->name('store');
        Route::get('/{medicine}', [MedicineController::class, 'show'])->name('show');
        Route::get('/{medicine}/edit', [MedicineController::class, 'edit'])->name('edit');
        Route::put('/{medicine}', [MedicineController::class, 'update'])->name('update');
        Route::delete('/{medicine}', [MedicineController::class, 'destroy'])->name('destroy');
        Route::patch('/{medicine}/toggle-status', [MedicineController::class, 'toggleStatus'])->name('toggle-status');
        Route::patch('/{medicine}/update-stock', [MedicineController::class, 'updateStock'])->name('update-stock');
    });
    
    Route::prefix('actions')->name('actions.')->group(function () {
        Route::get('/', [ActionController::class, 'index'])->name('index');
        Route::get('/create', [ActionController::class, 'create'])->name('create');
        Route::post('/', [ActionController::class, 'store'])->name('store');
        Route::get('/{action}', [ActionController::class, 'show'])->name('show');
        Route::get('/{action}/edit', [ActionController::class, 'edit'])->name('edit');
        Route::put('/{action}', [ActionController::class, 'update'])->name('update');
        Route::delete('/{action}', [ActionController::class, 'destroy'])->name('destroy');
        Route::patch('/{action}/toggle-status', [ActionController::class, 'toggleStatus'])->name('toggle-status');
        Route::get('/by-category/{category}', [ActionController::class, 'byCategory'])->name('by-category');
    });
    
    // Patient Management Routes
    Route::prefix('patients')->name('patients.')->group(function () {
        Route::get('/', [PatientController::class, 'index'])->name('index');
        Route::get('/create', [PatientController::class, 'create'])->name('create');
        Route::post('/', [PatientController::class, 'store'])->name('store');
        Route::get('/{patient}', [PatientController::class, 'show'])->name('show');
        Route::get('/{patient}/edit', [PatientController::class, 'edit'])->name('edit');
        Route::put('/{patient}', [PatientController::class, 'update'])->name('update');
        Route::delete('/{patient}', [PatientController::class, 'destroy'])->name('destroy');
        Route::get('/search/by-kpj', [PatientController::class, 'searchByKPJ'])->name('search.kpj');
        Route::get('/search/by-nik', [PatientController::class, 'searchByNIK'])->name('search.nik');
    });
    
    Route::prefix('medical-records')->name('medical-records.')->group(function () {
        Route::get('/', [MedicalRecordController::class, 'index'])->name('index');
        Route::get('/create', [MedicalRecordController::class, 'create'])->name('create');
        Route::post('/', [MedicalRecordController::class, 'store'])->name('store');
        Route::get('/{medicalRecord}', [MedicalRecordController::class, 'show'])->name('show');
        Route::get('/{medicalRecord}/edit', [MedicalRecordController::class, 'edit'])->name('edit');
        Route::put('/{medicalRecord}', [MedicalRecordController::class, 'update'])->name('update');
        Route::delete('/{medicalRecord}', [MedicalRecordController::class, 'destroy'])->name('destroy');
        Route::patch('/{medicalRecord}/complete', [MedicalRecordController::class, 'complete'])->name('complete');
        Route::get('/patient/{patient}', [MedicalRecordController::class, 'byPatient'])->name('by-patient');
    });
    
    // Invoice Management Routes (Admin RS specific)
    Route::prefix('invoices')->name('invoices.')->group(function () {
        Route::get('/create', [InvoiceController::class, 'create'])->name('create');
        Route::post('/', [InvoiceController::class, 'store'])->name('store');
        Route::get('/draft', [InvoiceController::class, 'draft'])->name('draft');
        Route::get('/{invoice}/edit', [InvoiceController::class, 'edit'])->name('edit');
        Route::put('/{invoice}', [InvoiceController::class, 'update'])->name('update');
        Route::delete('/{invoice}', [InvoiceController::class, 'destroy'])->name('destroy');
        Route::post('/{invoice}/submit', [InvoiceController::class, 'submit'])->name('submit');
        Route::get('/medical-record/{medicalRecord}', [InvoiceController::class, 'createFromMedicalRecord'])->name('create-from-medical-record');
        
        // Invoice Details Management
        Route::prefix('{invoice}/details')->name('details.')->group(function () {
            Route::post('/', [InvoiceDetailController::class, 'store'])->name('store');
            Route::put('/{invoiceDetail}', [InvoiceDetailController::class, 'update'])->name('update');
            Route::delete('/{invoiceDetail}', [InvoiceDetailController::class, 'destroy'])->name('destroy');
        });
        
        // Invoice Categories Management
        Route::prefix('{invoice}/categories')->name('categories.')->group(function () {
            Route::post('/', [InvoiceCategoryController::class, 'store'])->name('store');
            Route::put('/{invoiceCategory}', [InvoiceCategoryController::class, 'update'])->name('update');
            Route::delete('/{invoiceCategory}', [InvoiceCategoryController::class, 'destroy'])->name('destroy');
        });
    });
    
    // Reports Routes (Admin RS specific)
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/patients', [ReportController::class, 'patients'])->name('patients');
        Route::get('/templates', [ReportController::class, 'templates'])->name('templates');
        Route::post('/patients/export', [ReportController::class, 'exportPatients'])->name('patients.export');
    });
});

// Admin BPJS Only Routes
Route::middleware(['auth', RoleMiddleware::class.':admin_bpjs'])->group(function () {
    
    // Invoice Management (BPJS specific)
    Route::prefix('invoices')->name('invoices.')->group(function () {
        Route::get('/pending', [InvoiceController::class, 'pending'])->name('pending');
        Route::post('/{invoice}/approve', [InvoiceController::class, 'approve'])->name('approve');
        Route::post('/{invoice}/reject', [InvoiceController::class, 'reject'])->name('reject');
    });
    
    // BPJS Management Routes
    Route::prefix('bpjs')->name('bpjs.')->group(function () {
        Route::get('/submissions', [BPJSController::class, 'submissions'])->name('submissions');
        Route::get('/approval-queue', [BPJSController::class, 'approvalQueue'])->name('approval-queue');
        Route::get('/payments', [BPJSController::class, 'payments'])->name('payments');
        Route::get('/reports', [BPJSController::class, 'reports'])->name('reports');
        
        Route::post('/bulk-approve', [BPJSController::class, 'bulkApprove'])->name('bulk-approve');
        Route::post('/bulk-reject', [BPJSController::class, 'bulkReject'])->name('bulk-reject');
        Route::post('/process-payment/{invoice}', [BPJSController::class, 'processPayment'])->name('process-payment');
        
        Route::get('/reports/export', [BPJSController::class, 'exportReports'])->name('reports.export');
    });
});

// API Routes for AJAX calls
Route::prefix('api')->middleware(['auth'])->name('api.')->group(function () {
    
    // Search endpoints
    Route::get('/patients/search', [PatientController::class, 'apiSearch'])->name('patients.search');
    Route::get('/services/search', [ServiceController::class, 'apiSearch'])->name('services.search');
    Route::get('/medicines/search', [MedicineController::class, 'apiSearch'])->name('medicines.search');
    Route::get('/actions/search', [ActionController::class, 'apiSearch'])->name('actions.search');
    
    // Quick data endpoints
    Route::get('/categories/{category}/services', [CategoryController::class, 'getServices'])->name('categories.services');
    Route::get('/categories/{category}/actions', [CategoryController::class, 'getActions'])->name('categories.actions');
    Route::get('/patients/{patient}/medical-records', [PatientController::class, 'getMedicalRecords'])->name('patients.medical-records');
    Route::get('/medical-records/{medicalRecord}/invoices', [MedicalRecordController::class, 'getInvoices'])->name('medical-records.invoices');
    
    // Invoice calculation endpoints
    Route::post('/invoices/calculate', [InvoiceController::class, 'calculate'])->name('invoices.calculate');
    Route::get('/invoices/{invoice}/summary', [InvoiceController::class, 'getSummary'])->name('invoices.summary');
});

// Download/Export Routes
Route::prefix('download')->middleware(['auth'])->name('download.')->group(function () {
    Route::get('/invoice/{invoice}/pdf', [InvoiceController::class, 'downloadPDF'])->name('invoice.pdf');
    Route::get('/invoice/{invoice}/excel', [InvoiceController::class, 'downloadExcel'])->name('invoice.excel');
    Route::get('/patients/template', [PatientController::class, 'downloadTemplate'])->name('patients.template');
    Route::get('/medicines/template', [MedicineController::class, 'downloadTemplate'])->name('medicines.template');
});

// Import Routes
Route::prefix('import')->middleware(['auth', RoleMiddleware::class.':admin_rs'])->name('import.')->group(function () {
    Route::post('/patients', [PatientController::class, 'import'])->name('patients');
    Route::post('/medicines', [MedicineController::class, 'import'])->name('medicines');
    Route::post('/services', [ServiceController::class, 'import'])->name('services');
});