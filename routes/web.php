<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController; 
use App\Http\Controllers\DashboardController;

// Master Data Controllers
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\MedicineController;

// Patient Management Controllers
use App\Http\Controllers\PatientController;
use App\Http\Controllers\MedicalRecordController;

// Billing Controllers
use App\Http\Controllers\InvoiceController;

// Reports Controllers
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingsController;

use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\Authenticate;

// Authentication Routes
Route::get('/login', [LoginController::class, 'index'])->middleware([Authenticate::class])->name('login');
Route::post('/login', [LoginController::class, 'store']);
Route::get('/logout', [LoginController::class, 'destroy'])->middleware('auth');

// Protected Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/', [DashboardController::class, 'index']); 
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

// Admin RS Only Routes
Route::middleware(['auth', RoleMiddleware::class.':admin_rs'])->group(function () {
    
    
    // Patient Management
    Route::prefix('patients')->name('patients.')->group(function () {
        Route::get('/', [PatientController::class, 'index'])->name('index');
        Route::post('/', [PatientController::class, 'store'])->name('store');
        Route::get('/{patient}', [PatientController::class, 'show'])->name('show');
        Route::put('/{patient}', [PatientController::class, 'update'])->name('update');
        Route::delete('/{patient}', [PatientController::class, 'destroy'])->name('destroy');
    });
    
    // Medical Records
    Route::prefix('medical-records')->name('medical-records.')->group(function () {
        Route::get('/', [MedicalRecordController::class, 'index'])->name('index');
        Route::post('/', [MedicalRecordController::class, 'store'])->name('store');
        Route::get('/{medicalRecord}', [MedicalRecordController::class, 'show'])->name('show');
        Route::put('/{medicalRecord}', [MedicalRecordController::class, 'update'])->name('update');
        Route::delete('/{medicalRecord}', [MedicalRecordController::class, 'destroy'])->name('destroy');
    });
});

// Shared Invoice Routes for both roles
Route::middleware(['auth'])->group(function () {
    Route::prefix('invoices')->name('invoices.')->group(function () {
        // Shared routes (both roles can access)
        Route::get('/', [InvoiceController::class, 'index'])->middleware(RoleMiddleware::class.':admin_rs,admin_bpjs')->name('index');
        
        // Admin RS only routes - PUT THESE BEFORE PARAMETERIZED ROUTES
        Route::get('/create', [InvoiceController::class, 'create'])->middleware(RoleMiddleware::class.':admin_rs')->name('create');
        Route::post('/', [InvoiceController::class, 'store'])->middleware(RoleMiddleware::class.':admin_rs')->name('store');
        
        // Parameterized routes MUST come after static routes
        Route::get('/{invoice}', [InvoiceController::class, 'show'])->middleware(RoleMiddleware::class.':admin_rs,admin_bpjs')->name('show');
        Route::get('/{invoice}/print', [InvoiceController::class, 'print'])->middleware(RoleMiddleware::class.':admin_rs,admin_bpjs')->name('print');
        Route::get('/{invoice}/edit', [InvoiceController::class, 'edit'])->middleware(RoleMiddleware::class.':admin_rs')->name('edit');
        Route::put('/{invoice}', [InvoiceController::class, 'update'])->middleware(RoleMiddleware::class.':admin_rs')->name('update');
        Route::delete('/{invoice}', [InvoiceController::class, 'destroy'])->middleware(RoleMiddleware::class.':admin_rs')->name('destroy');
        Route::post('/{invoice}/submit', [InvoiceController::class, 'submit'])->middleware(RoleMiddleware::class.':admin_rs')->name('submit');

        // Admin BPJS only routes
        Route::post('/{invoice}/approve', [InvoiceController::class, 'approve'])->middleware(RoleMiddleware::class.':admin_bpjs')->name('approve');
        Route::post('/{invoice}/reject', [InvoiceController::class, 'reject'])->middleware(RoleMiddleware::class.':admin_bpjs')->name('reject');
    });
        // Master Data - Categories
    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', [CategoryController::class, 'index'])->name('index');
        Route::post('/', [CategoryController::class, 'store'])->name('store');
        Route::get('/{category}', [CategoryController::class, 'show'])->name('show');
        Route::put('/{category}', [CategoryController::class, 'update'])->name('update');
        Route::delete('/{category}', [CategoryController::class, 'destroy'])->name('destroy');
    });
    
    // Master Data - Services
    Route::prefix('services')->name('services.')->group(function () {
        Route::get('/', [ServiceController::class, 'index'])->name('index');
        Route::post('/', [ServiceController::class, 'store'])->name('store');
        Route::get('/{service}', [ServiceController::class, 'show'])->name('show');
        Route::put('/{service}', [ServiceController::class, 'update'])->name('update');
        Route::delete('/{service}', [ServiceController::class, 'destroy'])->name('destroy');
    });
    
    // Master Data - Medicines
    Route::prefix('medicines')->name('medicines.')->group(function () {
        Route::get('/', [MedicineController::class, 'index'])->name('index');
        Route::post('/', [MedicineController::class, 'store'])->name('store');
        Route::get('/{medicine}', [MedicineController::class, 'show'])->name('show');
        Route::put('/{medicine}', [MedicineController::class, 'update'])->name('update');
        Route::delete('/{medicine}', [MedicineController::class, 'destroy'])->name('destroy');
    });
    
});

// Reports Routes (Shared for both roles with different access)
Route::middleware(['auth', RoleMiddleware::class.':admin_rs,admin_bpjs'])->group(function () {
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::get('/invoices', [ReportController::class, 'invoices'])->name('invoices');
        // Patients report only for Admin RS
        Route::get('/patients', [ReportController::class, 'patients'])->middleware(RoleMiddleware::class.':admin_rs')->name('patients');
    });
});

// API Routes for AJAX
Route::prefix('api')->middleware(['auth'])->name('api.')->group(function () {
    Route::get('/patients/search', [PatientController::class, 'search'])->name('patients.search');
    Route::get('/categories/{category}/items', [CategoryController::class, 'getItems'])->name('categories.items');
    Route::post('/invoices/calculate', [InvoiceController::class, 'calculate'])->name('invoices.calculate');
});

// Settings Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings/profile', [SettingsController::class, 'updateProfile'])->name('settings.profile');
    Route::put('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password');
});