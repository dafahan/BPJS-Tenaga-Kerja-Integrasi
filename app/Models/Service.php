<?php
// app/Models/Service.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'code',
        'tarif',
        'description',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'tarif' => 'decimal:2',
            'status' => 'boolean',
        ];
    }

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function invoiceDetails()
    {
        return $this->morphMany(InvoiceDetail::class, 'item');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    // Accessors
    public function getFormattedTarifAttribute()
    {
        return 'Rp ' . number_format($this->tarif, 0, ',', '.');
    }
}