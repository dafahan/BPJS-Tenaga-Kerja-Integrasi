import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Users, Download, Calendar, FileText, Activity, User, MapPin } from 'lucide-react';
import Layout from '@/js/Layouts/Layout';

export default function ReportsPatients({ patients, summary, filters }) {
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    const handleFilter = () => {
        router.get('/reports/patients', {
            date_from: dateFrom,
            date_to: dateTo
        }, {
            preserveState: true
        });
    };

    const exportData = () => {
        const csvHeaders = ['Patient Name', 'No. KPJ', 'NIK', 'Gender', 'Age', 'Address', 'Phone', 'Medical Records', 'Total Invoices', 'Registration Date'];
        const csvData = patients.map(patient => [
            patient.nama_pasien,
            patient.no_kpj,
            patient.nik,
            patient.jenis_kelamin === 'L' ? 'Male' : 'Female',
            patient.umur || '-',
            patient.alamat || '-',
            patient.telepon || '-',
            patient.medical_records_count || 0,
            patient.invoices_count || 0,
            new Date(patient.created_at).toLocaleDateString()
        ]);

        const csvContent = [csvHeaders, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `patient-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID');
    };

    return (
        <>
            <Head title="Patient Reports" />
            
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.get('/reports')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Patient Reports</h1>
                        <p className="text-gray-600">Comprehensive patient analytics and demographics</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.total_patients}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Medical Records</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.total_medical_records}</p>
                            </div>
                            <FileText className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.total_invoices}</p>
                            </div>
                            <Activity className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Patients</p>
                                <p className="text-2xl font-bold text-green-600">{summary.active_patients}</p>
                            </div>
                            <User className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Filters</h2>
                        <button
                            onClick={exportData}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleFilter}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                            >
                                Apply Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Patient Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold">Patient Details</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Info</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Demographics</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medical Activity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {patients.length > 0 ? (
                                    patients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {patient.nama_pasien}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {patient.jenis_kelamin === 'L' ? 'Male' : 'Female'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    <div className="font-medium">KPJ: {patient.no_kpj}</div>
                                                    <div className="text-gray-500">NIK: {patient.nik}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    <div>Age: {patient.umur || '-'} years</div>
                                                    <div className="text-gray-500">
                                                        Born: {formatDate(patient.tanggal_lahir)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                                        <span className="max-w-xs truncate">{patient.alamat || '-'}</span>
                                                    </div>
                                                    {patient.telepon && (
                                                        <div className="text-gray-500 mt-1">{patient.telepon}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {patient.medical_records_count || 0} Records
                                                        </span>
                                                    </div>
                                                    <div className="mt-1">
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                            {patient.invoices_count || 0} Invoices
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(patient.created_at)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Try adjusting your filter criteria.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

ReportsPatients.layout = (page) => <Layout children={page} />;