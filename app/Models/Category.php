<?php

// app/Models/Category.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
        ];
    }

    // Relationships
    public function services()
    {
        return $this->hasMany(Service::class);
    }


    public function invoiceCategories()
    {
        return $this->hasMany(InvoiceCategory::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }
}
