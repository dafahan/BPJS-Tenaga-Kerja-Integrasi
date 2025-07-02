import { Head, router } from '@inertiajs/react';
import { ArrowLeft, User, Calendar, FileText, Plus, Eye } from 'lucide-react';
import Layout from '@/js/Layouts/Layout';
export default function Show({ medicalRecord }) {
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID');
    };

    const getJenisRawatLabel = (jenis) => {
        const labels = {
            'rawat_jalan': 'Rawat Jalan',
            'rawat_inap': 'Rawat Inap',
            'ugd': 'Unit Gawat Darurat'
        };
        return labels[jenis] || jenis;
    };

    const getStatusColor = (status) => {
        return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <Head title={`Medical Record - ${medicalRecord.no_rawat_medis}`} />
            
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.get('/medical-records')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Medical Record Details</h1>
                            <p className="text-gray-600">No. Rawat Medis: {medicalRecord.no_rawat_medis}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.get(`/medical-records/${medicalRecord.id}/edit`)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <FileText size={16} />
                            Edit Record
                        </button>
                        <button
                            onClick={() => router.get('/invoices/create', { medical_record_id: medicalRecord.id })}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Create Invoice
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Patient Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-semibold">Patient Information</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Patient Name</label>
                                    <p className="text-gray-900">{medicalRecord.patient?.nama_pasien}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">No. KPJ</label>
                                    <p className="text-gray-900">{medicalRecord.patient?.no_kpj}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">NIK</label>
                                    <p className="text-gray-900">{medicalRecord.patient?.nik}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Gender</label>
                                    <p className="text-gray-900">
                                        {medicalRecord.patient?.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-500">Address</label>
                                    <p className="text-gray-900">{medicalRecord.patient?.alamat || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Medical Record Details */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-green-600" />
                                <h2 className="text-lg font-semibold">Medical Record Details</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Jenis Rawat</label>
                                        <p className="text-gray-900">{getJenisRawatLabel(medicalRecord.jenis_rawat)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Status</label>
                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(medicalRecord.status)}`}>
                                            {medicalRecord.status === 'active' ? 'Active' : 'Completed'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Tanggal Kecelakaan</label>
                                        <p className="text-gray-900">{formatDate(medicalRecord.tgl_kecelakaan)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Tanggal Pengobatan</label>
                                        <p className="text-gray-900">{formatDate(medicalRecord.tgl_pengobatan)}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Tanggal Masuk</label>
                                        <p className="text-gray-900">{formatDate(medicalRecord.tgl_masuk)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Tanggal Keluar</label>
                                        <p className="text-gray-900">{formatDate(medicalRecord.tgl_keluar)}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Diagnosis</label>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{medicalRecord.diagnosis}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Keluhan</label>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{medicalRecord.keluhan}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Record Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="w-5 h-5 text-purple-600" />
                                <h2 className="text-lg font-semibold">Record Information</h2>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created By</label>
                                    <p className="text-gray-900">{medicalRecord.creator?.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created At</label>
                                    <p className="text-gray-900">{formatDate(medicalRecord.created_at)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                    <p className="text-gray-900">{formatDate(medicalRecord.updated_at)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Related Invoices */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Related Invoices</h2>
                                <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                                    {medicalRecord.invoices?.length || 0}
                                </span>
                            </div>
                            {medicalRecord.invoices?.length > 0 ? (
                                <div className="space-y-3">
                                    {medicalRecord.invoices.map((invoice) => (
                                        <div key={invoice.id} className="border rounded-lg p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-sm">{invoice.invoice_number}</p>
                                                    <p className="text-gray-500 text-xs">
                                                        Rp {Number(invoice.total_amount).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        invoice.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        invoice.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                                                        invoice.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {invoice.status}
                                                    </span>
                                                    <button
                                                        onClick={() => router.get(`/invoices/${invoice.id}`)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No invoices created yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = (page) => <Layout children={page} />;