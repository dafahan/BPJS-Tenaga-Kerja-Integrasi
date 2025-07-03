<?php

// app/Models/Invoice.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'medical_record_id',
        'invoice_number',
        'tanggal_jkk',
        'total_amount',
        'status',
        'notes',
        'submitted_at',
        'approved_at',
        'approved_by',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'tanggal_jkk' => 'date',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    // Relationships
    public function medicalRecord()
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    public function patient()
    {
        return $this->hasOneThrough(Patient::class, MedicalRecord::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function invoiceDetails()
    {
        return $this->hasMany(InvoiceDetail::class);
    }

    public function invoiceCategories()
    {
        return $this->hasMany(InvoiceCategory::class);
    }

    // Accessors
    public function getFormattedTotalAmountAttribute()
    {
        return 'Rp ' . number_format($this->total_amount, 0, ',', '.');
    }

    public function getStatusLabelAttribute()
    {
        $statuses = [
            'draft' => 'Draft',
            'submitted' => 'Diajukan',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            'paid' => 'Dibayar'
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    // Methods
    public function calculateTotal()
    {
        $detailsTotal = $this->invoiceDetails()->sum('subtotal');
        $categoriesTotal = $this->invoiceCategories()->sum('total_amount');
        
        $this->update(['total_amount' => $detailsTotal + $categoriesTotal]);
        
        return $this->total_amount;
    }

    public function approve($userId)
    {
        $this->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $userId
        ]);
    }

    public function reject($userId, $notes = null)
    {
        $this->update([
            'status' => 'rejected',
            'approved_by' => $userId,
            'notes' => $notes
        ]);
    }
}