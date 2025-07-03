<?php
// app/Models/InvoiceDetail.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'item_type',
        'item_id',
        'item_name',
        'item_code',
        'quantity',
        'unit_price',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    // Relationships
    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function item()
    {
        return $this->morphTo();
    }

    // Accessors
    public function getFormattedUnitPriceAttribute()
    {
        return 'Rp ' . number_format($this->unit_price, 0, ',', '.');
    }

    public function getFormattedSubtotalAttribute()
    {
        return 'Rp ' . number_format($this->subtotal, 0, ',', '.');
    }

    public function getItemTypeLabelAttribute()
    {
        $types = [
            'service' => 'Layanan',
            'medicine' => 'Obat',
        ];

        return $types[$this->item_type] ?? $this->item_type;
    }

    // Methods
    public function calculateSubtotal()
    {
        $this->subtotal = $this->quantity * $this->unit_price;
        $this->save();
        
        return $this->subtotal;
    }

    // Boot method to auto-calculate subtotal
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($invoiceDetail) {
            $invoiceDetail->subtotal = $invoiceDetail->quantity * $invoiceDetail->unit_price;
        });
    }
}