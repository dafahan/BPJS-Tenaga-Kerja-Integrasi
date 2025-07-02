<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        
        .letterhead {
            width: 100%;
            margin-bottom: 15px;
            border-bottom: 3px solid #333;
            padding-bottom: 15px;
        }
        
        .letterhead table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .logo-left {
            width: 15%;
            vertical-align: middle;
            text-align: left;
        }
        
        .header-center {
            width: 70%;
            text-align: center;
            vertical-align: middle;
        }
        
        .logo-right {
            width: 15%;
            vertical-align: middle;
            text-align: right;
        }
        
        .letterhead img {
            max-height: 90px;
            max-width: 120px;
        }
        
        .letterhead h1 {
            margin: 0;
            font-size: 18px;
            color: #333;
            font-weight: bold;
        }
        
        .letterhead h2 {
            margin: 5px 0 0 0;
            font-size: 14px;
            color: #666;
            font-weight: normal;
        }
        
        .letterhead .subtitle {
            margin: 2px 0 0 0;
            font-size: 11px;
            color: #888;
        }
        
        .invoice-info {
            width: 100%;
            margin-bottom: 20px;
        }
        
        .invoice-info table {
            width: 100%;
        }
        
        .invoice-info .left {
            width: 50%;
            vertical-align: top;
        }
        
        .invoice-info .right {
            width: 50%;
            text-align: right;
            vertical-align: top;
        }
        
        .patient-info {
            background: #f8f9fa;
            padding: 15px;
            border: 1px solid #ddd;
            margin-bottom: 20px;
        }
        
        .patient-info h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #333;
        }
        
        .info-row {
            margin-bottom: 5px;
        }
        
        .info-label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }
        
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .details-table th, .details-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        .details-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        
        .details-table .number {
            text-align: right;
        }
        
        .category-section {
            margin-bottom: 20px;
        }
        
        .category-section h4 {
            margin: 0 0 10px 0;
            padding: 8px;
            background-color: #e9ecef;
            border: 1px solid #ddd;
        }
        
        .total-section {
            border-top: 2px solid #333;
            padding-top: 10px;
            text-align: right;
        }
        
        .total-row {
            margin-bottom: 5px;
        }
        
        .grand-total {
            font-size: 16px;
            font-weight: bold;
            border-top: 1px solid #333;
            padding-top: 5px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-draft { background: #6c757d; color: white; }
        .status-submitted { background: #ffc107; color: #212529; }
        .status-approved { background: #28a745; color: white; }
        .status-rejected { background: #dc3545; color: white; }
        
        .footer {
            margin-top: 30px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
            font-size: 10px;
            text-align: center;
            color: #666;
        }
        
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="letterhead">
        <table>
            <tr>
                <td class="logo-left">
                    @if($logoRSI)
                        <img src="{{ $logoRSI }}" alt="Logo RSI" />
                    @endif
                </td>
                <td class="header-center">
                    <h1>INVOICE PEMBAYARAN BPJS</h1>
                    <h2>Sistem Billing Rumah Sakit - BPJS</h2>
                    <p class="subtitle">Kerjasama Rumah Sakit Islam dengan BPJS Kesehatan</p>
                </td>
                <td class="logo-right">
                    @if($logoBPJS)
                        <img src="{{ $logoBPJS }}" alt="Logo BPJS" />
                    @endif
                </td>
            </tr>
        </table>
    </div>
    
    <div class="invoice-info">
        <table>
            <tr>
                <td class="left">
        
                    <div class="info-row">
                        <span class="info-label">No. Invoice:</span>
                        <strong>{{ $invoice->invoice_number }}</strong>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tanggal JKK:</span>
                       {{ $invoice->tanggal_jkk ? \Carbon\Carbon::parse($invoice->tanggal_jkk)->format('d/m/Y') : '-' }}
                    </div>
                    <div class="info-row">
                        <span class="info-label">Tanggal:</span>
                        {{ $invoice->created_at->format('d/m/Y H:i') }}
                    </div>
                    <div class="info-row">
                        <span class="info-label">Status:</span>
                        <span class="status-badge status-{{ $invoice->status }}">
                            {{ ucfirst($invoice->status) }}
                        </span>
                    </div>
                
                </td>
                <td class="right">
                    <div class="info-row">
                        <span class="info-label">Dibuat oleh:</span>
                        {{ $invoice->creator->name }}
                    </div>
                    @if($invoice->approved_at)
                    <div class="info-row">
                        <span class="info-label">Disetujui:</span>
                        {{ $invoice->approved_at->format('d/m/Y H:i') }}
                    </div>
                    @endif
                    @if($invoice->approver)
                    <div class="info-row">
                        <span class="info-label">Disetujui oleh:</span>
                        {{ $invoice->approver->name }}
                    </div>
                    @endif
                </td>
            </tr>
        </table>
    </div>
    
    <div class="patient-info">
        <h3>Informasi Pasien & Rawat Medis</h3>
        <div class="info-row">
            <span class="info-label">Nama Pasien:</span>
            {{ $invoice->medicalRecord->patient->nama_pasien }}
        </div>
        <div class="info-row">
            <span class="info-label">No. KPJ:</span>
            {{ $invoice->medicalRecord->patient->no_kpj }}
        </div>
        <div class="info-row">
            <span class="info-label">NIK:</span>
            {{ $invoice->medicalRecord->patient->nik }}
        </div>
        <div class="info-row">
            <span class="info-label">No. Rawat Medis:</span>
            {{ $invoice->medicalRecord->no_rawat_medis }}
        </div>
        <div class="info-row">
            <span class="info-label">Jenis Rawat:</span>
            {{ $invoice->medicalRecord->jenis_rawat_lengkap }}
        </div>
        <div class="info-row">
            <span class="info-label">Diagnosis:</span>
            {{ $invoice->medicalRecord->diagnosis }}
        </div>
        <div class="info-row">
            <span class="info-label">Tanggal Masuk:</span>
            {{ $invoice->medicalRecord->tgl_masuk->format('d/m/Y') }}
        </div>
        @if($invoice->medicalRecord->tgl_keluar)
        <div class="info-row">
            <span class="info-label">Tanggal Keluar:</span>
            {{ $invoice->medicalRecord->tgl_keluar->format('d/m/Y') }}
        </div>
        @endif
    </div>
    
    @if($invoice->invoiceDetails->count() > 0)
    <h3>Detail Tagihan Per Item</h3>
    <table class="details-table">
        <thead>
            <tr>
                <th>No</th>
                <th>Jenis</th>
                <th>Kode</th>
                <th>Nama Item</th>
                <th>Qty</th>
                <th>Harga Satuan</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->invoiceDetails as $index => $detail)
            <tr>
                <td class="number">{{ $index + 1 }}</td>
                <td>{{ ucfirst($detail->item_type) }}</td>
                <td>{{ $detail->item_code }}</td>
                <td>{{ $detail->item_name }}</td>
                <td class="number">{{ $detail->quantity }}</td>
                <td class="number">Rp {{ number_format($detail->unit_price, 0, ',', '.') }}</td>
                <td class="number">Rp {{ number_format($detail->subtotal, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <th colspan="6">Subtotal Detail Items</th>
                <th class="number">Rp {{ number_format($invoice->invoiceDetails->sum('subtotal'), 0, ',', '.') }}</th>
            </tr>
        </tfoot>
    </table>
    @endif
    
    @if($invoice->invoiceCategories->count() > 0)
    <div class="category-section">
        <h3>Tagihan Per Kategori</h3>
        @foreach($invoice->invoiceCategories as $category)
        <div class="category-item">
            <h4>{{ $category->category_name }}</h4>
            <div class="info-row">
                <span class="info-label">Jumlah:</span>
                <strong>Rp {{ number_format($category->total_amount, 0, ',', '.') }}</strong>
            </div>
            @if($category->description)
            <div class="info-row">
                <span class="info-label">Keterangan:</span>
                {{ $category->description }}
            </div>
            @endif
        </div>
        @endforeach
        
        <div class="total-row" style="text-align: right; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
            <strong>Subtotal Kategori: Rp {{ number_format($invoice->invoiceCategories->sum('total_amount'), 0, ',', '.') }}</strong>
        </div>
    </div>
    @endif
    
    <div class="total-section">
        @if($invoice->invoiceDetails->count() > 0)
        <div class="total-row">
            <strong>Total Detail Items: Rp {{ number_format($invoice->invoiceDetails->sum('subtotal'), 0, ',', '.') }}</strong>
        </div>
        @endif
        
        @if($invoice->invoiceCategories->count() > 0)
        <div class="total-row">
            <strong>Total Kategori: Rp {{ number_format($invoice->invoiceCategories->sum('total_amount'), 0, ',', '.') }}</strong>
        </div>
        @endif
        
        <div class="grand-total">
            <strong>TOTAL KESELURUHAN: Rp {{ number_format($invoice->total_amount, 0, ',', '.') }}</strong>
        </div>
    </div>
    
    @if($invoice->notes)
    <div style="margin-top: 20px; padding: 10px; background: #f8f9fa; border: 1px solid #ddd;">
        <strong>Catatan:</strong><br>
        {{ $invoice->notes }}
    </div>
    @endif
    
    <div class="footer">
        <p>Dokumen ini digenerate secara otomatis oleh Sistem Billing Rumah Sakit - BPJS</p>
        <p>Dicetak pada: {{ now()->format('d/m/Y H:i:s') }}</p>
    </div>
</body>
</html>