<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Service;
use App\Models\Medicine;
use App\Models\Patient;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Users
        User::create([
            'name' => 'Admin Rumah Sakit',
            'username' => 'admin_rs',
            'password' => bcrypt('password'),
            'role' => 'admin_rs'
        ]);

        User::create([
            'name' => 'Admin BPJS',
            'username' => 'admin_bpjs',
            'password' => bcrypt('password'),
            'role' => 'admin_bpjs'
        ]);

        // Create Categories
        $ugdCategory = Category::create([
            'name' => 'Unit Gawat Darurat',
            'code' => 'UGD',
            'description' => 'Layanan gawat darurat',
            'status' => true
        ]);

        $rawatJalanCategory = Category::create([
            'name' => 'Rawat Jalan',
            'code' => 'RJ',
            'description' => 'Layanan rawat jalan',
            'status' => true
        ]);

        $rawatInapCategory = Category::create([
            'name' => 'Rawat Inap',
            'code' => 'RI',
            'description' => 'Layanan rawat inap',
            'status' => true
        ]);

        // Create Services
        Service::create([
            'category_id' => $ugdCategory->id,
            'name' => 'Konsultasi Dokter UGD',
            'code' => 'UGD001',
            'tarif' => 150000,
            'description' => 'Konsultasi dokter di unit gawat darurat',
            'status' => true
        ]);

        Service::create([
            'category_id' => $rawatJalanCategory->id,
            'name' => 'Konsultasi Dokter Spesialis',
            'code' => 'RJ001',
            'tarif' => 200000,
            'description' => 'Konsultasi dokter spesialis',
            'status' => true
        ]);

        Service::create([
            'category_id' => $rawatInapCategory->id,
            'name' => 'Rawat Inap Kelas 3',
            'code' => 'RI001',
            'tarif' => 300000,
            'description' => 'Biaya rawat inap kelas 3 per hari',
            'status' => true
        ]);


        // Create Medicines
        Medicine::create([
            'name' => 'Paracetamol 500mg',
            'code' => 'MED001',
            'price' => 500,
            'stock' => 1000,
            'unit' => 'tablet',
            'description' => 'Obat penurun demam dan pereda nyeri',
            'status' => true
        ]);

        Medicine::create([
            'name' => 'Amoxicillin 500mg',
            'code' => 'MED002',
            'price' => 1000,
            'stock' => 500,
            'unit' => 'tablet',
            'description' => 'Antibiotik spektrum luas',
            'status' => true
        ]);

        Medicine::create([
            'name' => 'Antasida Tablet',
            'code' => 'MED003',
            'price' => 300,
            'stock' => 800,
            'unit' => 'tablet',
            'description' => 'Obat maag dan gangguan pencernaan',
            'status' => true
        ]);

        Medicine::create([
            'name' => 'Infus RL 500ml',
            'code' => 'MED004',
            'price' => 25000,
            'stock' => 200,
            'unit' => 'botol',
            'description' => 'Cairan infus Ringer Lactate',
            'status' => true
        ]);

        // Create Sample Patients
        Patient::create([
            'no_kpj' => '0001234567890',
            'nama_pasien' => 'Budi Santoso',
            'nik' => '3201234567890123',
            'alamat' => 'Jl. Merdeka No. 123, Jakarta Pusat',
            'telepon' => '081234567890',
            'tanggal_lahir' => '1985-05-15',
            'jenis_kelamin' => 'L'
        ]);

        Patient::create([
            'no_kpj' => '0001234567891',
            'nama_pasien' => 'Siti Aminah',
            'nik' => '3201234567890124',
            'alamat' => 'Jl. Sudirman No. 456, Jakarta Selatan',
            'telepon' => '081234567891',
            'tanggal_lahir' => '1990-08-20',
            'jenis_kelamin' => 'P'
        ]);

        Patient::create([
            'no_kpj' => '0001234567892',
            'nama_pasien' => 'Ahmad Wijaya',
            'nik' => '3201234567890125',
            'alamat' => 'Jl. Thamrin No. 789, Jakarta Pusat',
            'telepon' => '081234567892',
            'tanggal_lahir' => '1978-12-10',
            'jenis_kelamin' => 'L'
        ]);

        Patient::create([
            'no_kpj' => '0001234567893',
            'nama_pasien' => 'Dewi Sartika',
            'nik' => '3201234567890126',
            'alamat' => 'Jl. Gatot Subroto No. 321, Jakarta Selatan',
            'telepon' => '081234567893',
            'tanggal_lahir' => '1995-03-25',
            'jenis_kelamin' => 'P'
        ]);

        Patient::create([
            'no_kpj' => '0001234567894',
            'nama_pasien' => 'Rudi Hartono',
            'nik' => '3201234567890127',
            'alamat' => 'Jl. Kuningan No. 654, Jakarta Selatan',
            'telepon' => '081234567894',
            'tanggal_lahir' => '1982-11-08',
            'jenis_kelamin' => 'L'
        ]);
    }
}