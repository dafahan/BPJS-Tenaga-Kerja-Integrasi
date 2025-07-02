import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, FileText, Download, Calendar, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import Layout from '@/js/Layouts/Layout';

export default function ReportsInvoices({ invoices, summary, filters }) {
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');
    const [status, setStatus] = useState(filters?.status || '');

    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { class: 'bg-gray-100 text-gray-800', text: 'Draft' },
            submitted: { class: 'bg-yellow-100 text-yellow-800', text: 'Submitted' },
            approved: { class: 'bg-green-100 text-green-800', text: 'Approved' },
            rejected: { class: 'bg-red-100 text-red-800', text: 'Rejected' },
            paid: { class: 'bg-blue-100 text-blue-800', text: 'Paid' }
        };
        
        const config = statusConfig[status] || statusConfig.draft;
        return (
            <span className={`px-2 py-1 text-xs rounded-full ${config.class}`}>
                {config.text}
            </span>
        );
    };

    const handleFilter = () => {
        router.get('/reports/invoices', {
            date_from: dateFrom,
            date_to: dateTo,
            status: status
        }, {
            preserveState: true
        });
    };

    const exportData = () => {
        // Create CSV data
        const csvHeaders = ['Invoice Number', 'Patient Name', 'Medical Record', 'Amount', 'Status', 'Date', 'Created By'];
        const csvData = invoices.map(invoice => [
            invoice.invoice_number,
            invoice.medical_record?.patient?.nama_pasien || '-',
            invoice.medical_record?.no_rawat_medis || '-',
            `Rp ${Number(invoice.total_amount).toLocaleString()}`,
            invoice.status,
            new Date(invoice.created_at).toLocaleDateString(),
            invoice.creator?.name || '-'
        ]);

        const csvContent = [csvHeaders, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <>
            <Head title="Invoice Reports" />
            
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
                        <h1 className="text-2xl font-bold text-gray-900">Invoice Reports</h1>
                        <p className="text-gray-600">Comprehensive invoice analytics and summaries</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.total_invoices}</p>
                            </div>
                            <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-900">Rp {Number(summary.total_amount).toLocaleString()}</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approved Amount</p>
                                <p className="text-2xl font-bold text-gray-900">Rp {Number(summary.approved_amount).toLocaleString()}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{summary.pending_count}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-green-600">{summary.approved_count}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold text-red-600">{summary.rejected_count}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-600" />
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="submitted">Submitted</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="paid">Paid</option>
                            </select>
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

                {/* Invoice Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold">Invoice Details</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medical Record</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {invoices.length > 0 ? (
                                    invoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-medium text-blue-600">
                                                    {invoice.invoice_number}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {invoice.medical_record?.patient?.nama_pasien || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {invoice.medical_record?.no_rawat_medis || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-medium">
                                                    Rp {Number(invoice.total_amount).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(invoice.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(invoice.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {invoice.creator?.name || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
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

ReportsInvoices.layout = (page) => <Layout children={page} />;