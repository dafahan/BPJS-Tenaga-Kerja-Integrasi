<?php
// app/Models/MedicalRecord.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'no_rawat_medis',
        'tgl_kecelakaan',
        'tgl_pengobatan',
        'tgl_masuk',
        'tgl_keluar',
        'diagnosis',
        'keluhan',
        'jenis_rawat',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'tgl_kecelakaan' => 'date',
            'tgl_pengobatan' => 'date',
            'tgl_masuk' => 'date',
            'tgl_keluar' => 'date',
        ];
    }

    // Relationships
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    // Accessors
    public function getJenisRawatLengkapAttribute()
    {
        $types = [
            'rawat_jalan' => 'Rawat Jalan',
            'rawat_inap' => 'Rawat Inap',
            'ugd' => 'Unit Gawat Darurat'
        ];

        return $types[$this->jenis_rawat] ?? $this->jenis_rawat;
    }

    public function getDurasiRawatAttribute()
    {
        if (!$this->tgl_keluar) return null;
        
        return $this->tgl_masuk->diffInDays($this->tgl_keluar) + 1;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeByJenisRawat($query, $jenisRawat)
    {
        return $query->where('jenis_rawat', $jenisRawat);
    }
}
