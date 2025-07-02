<?php
// app/Models/Patient.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'no_kpj',
        'nama_pasien',
        'nik',
        'alamat',
        'telepon',
        'tanggal_lahir',
        'jenis_kelamin',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
        ];
    }

    // Relationships
    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class);
    }

    public function invoices()
    {
        return $this->hasManyThrough(Invoice::class, MedicalRecord::class);
    }

    // Accessors
    public function getUmurAttribute()
    {
        return $this->tanggal_lahir ? Carbon::parse($this->tanggal_lahir)->age : null;
    }

    public function getJenisKelaminLengkapAttribute()
    {
        return $this->jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan';
    }

    // Scopes
    public function scopeByKPJ($query, $noKpj)
    {
        return $query->where('no_kpj', $noKpj);
    }

    public function scopeByNIK($query, $nik)
    {
        return $query->where('nik', $nik);
    }
}