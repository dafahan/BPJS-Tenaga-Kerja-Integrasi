<?php

// app/Models/User.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function createdMedicalRecords()
    {
        return $this->hasMany(MedicalRecord::class, 'created_by');
    }

    public function createdInvoices()
    {
        return $this->hasMany(Invoice::class, 'created_by');
    }

    public function approvedInvoices()
    {
        return $this->hasMany(Invoice::class, 'approved_by');
    }

    // Role helpers
    public function isAdminRS()
    {
        return $this->role === 'admin_rs';
    }

    public function isAdminBPJS()
    {
        return $this->role === 'admin_bpjs';
    }
}