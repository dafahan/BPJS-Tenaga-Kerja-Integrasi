import { Head, router } from '@inertiajs/react';
import { ArrowLeft, FileText, User, Calendar, Package, Stethoscope, Pill, Activity } from 'lucide-react';
import Layout from '@/js/Layouts/Layout';

export default function Show({ invoice }) {
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
            <span className={`px-3 py-1 text-sm rounded-full ${config.class} font-medium`}>
                {config.text}
            </span>
        );
    };

    const getItemIcon = (itemType) => {
        switch(itemType) {
            case 'service': return <Stethoscope className="w-4 h-4 text-blue-600" />;
            case 'medicine': return <Pills className="w-4 h-4 text-green-600" />;
            case 'action': return <Activity className="w-4 h-4 text-purple-600" />;
            default: return <Package className="w-4 h-4 text-gray-600" />;
        }
    };

    const getItemTypeLabel = (itemType) => {
        const labels = {
            'service': 'Service',
            'medicine': 'Medicine', 
            'action': 'Action'
        };
        return labels[itemType] || itemType;
    };

    const calculateDetailsTotal = () => {
        return invoice.invoice_details?.reduce((sum, detail) => sum + Number(detail.subtotal), 0) || 0;
    };

    const calculateCategoriesTotal = () => {
        return invoice.invoice_categories?.reduce((sum, category) => sum + Number(category.total_amount), 0) || 0;
    };

    return (
        <>
            <Head title={`Invoice ${invoice.invoice_number}`} />
            
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.get('/invoices')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
                            <p className="text-gray-600">Invoice #{invoice.invoice_number}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {getStatusBadge(invoice.status)}
                        <button
                            onClick={() => window.open(`/invoices/${invoice.id}/print`, '_blank')}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <FileText size={16} />
                            Print Invoice
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Patient & Medical Record Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-semibold">Patient & Medical Record Information</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Patient Name</label>
                                        <p className="text-gray-900 font-medium">{invoice.medical_record?.patient?.nama_pasien}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">No. KPJ</label>
                                        <p className="text-gray-900">{invoice.medical_record?.patient?.no_kpj}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">NIK</label>
                                        <p className="text-gray-900">{invoice.medical_record?.patient?.nik}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Gender</label>
                                        <p className="text-gray-900">
                                            {invoice.medical_record?.patient?.jenis_kelamin === 'L' ? 'Male' : 'Female'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Medical Record No.</label>
                                        <p className="text-gray-900 font-medium">{invoice.medical_record?.no_rawat_medis}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Treatment Type</label>
                                        <p className="text-gray-900">{invoice.medical_record?.jenis_rawat_lengkap}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Diagnosis</label>
                                        <p className="text-gray-900 bg-gray-50 p-2 rounded">{invoice.medical_record?.diagnosis}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Admission Date</label>
                                        <p className="text-gray-900">{formatDate(invoice.medical_record?.tgl_masuk)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Details */}
                        {invoice.invoice_details?.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold mb-4">Invoice Details (Per Item)</h2>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {invoice.invoice_details.map((detail, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {getItemIcon(detail.item_type)}
                                                            <span className="text-sm font-medium">
                                                                {getItemTypeLabel(detail.item_type)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="text-sm font-medium text-gray-900">{detail.item_name}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-mono text-gray-600">{detail.item_code}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-sm text-gray-900">{detail.quantity}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-sm text-gray-900">
                                                            Rp {Number(detail.unit_price).toLocaleString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            Rp {Number(detail.subtotal).toLocaleString()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr>
                                                <td colSpan="5" className="px-4 py-3 text-right font-medium text-gray-900">
                                                    Subtotal (Items):
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                    Rp {calculateDetailsTotal().toLocaleString()}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Category Billing */}
                        {invoice.invoice_categories?.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold mb-4">Category Billing</h2>
                                
                                <div className="space-y-4">
                                    {invoice.invoice_categories.map((category, index) => (
                                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900">{category.category_name}</h3>
                                                    {category.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg font-bold text-gray-900">
                                                        Rp {Number(category.total_amount).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-900">Subtotal (Categories):</span>
                                            <span className="font-bold text-gray-900">
                                                Rp {calculateCategoriesTotal().toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold mb-4">Notes</h2>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-900">{invoice.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Invoice Summary */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-purple-600" />
                                <h2 className="text-lg font-semibold">Invoice Summary</h2>
                            </div>
                            

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Invoice Number:</span>
                                    <span className="text-sm font-medium">{invoice.invoice_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Tanggal JKK:</span>
                                    <span className="text-sm font-medium">{formatDate(invoice.tanggal_jkk)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Status:</span>
                                    {getStatusBadge(invoice.status)}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Created:</span>
                                    <span className="text-sm">{formatDate(invoice.created_at)}</span>
                                </div>
                                {invoice.submitted_at && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Submitted:</span>
                                        <span className="text-sm">{formatDate(invoice.submitted_at)}</span>
                                    </div>
                                )}
                                {invoice.approved_at && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Approved:</span>
                                        <span className="text-sm">{formatDate(invoice.approved_at)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Total Amount */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
                            <h2 className="text-lg font-semibold mb-2">Total Amount</h2>
                            <div className="space-y-2">
                                {invoice.invoice_details?.length > 0 && (
                                    <div className="flex justify-between text-sm opacity-90">
                                        <span>Items Total:</span>
                                        <span>Rp {calculateDetailsTotal().toLocaleString()}</span>
                                    </div>
                                )}
                                {invoice.invoice_categories?.length > 0 && (
                                    <div className="flex justify-between text-sm opacity-90">
                                        <span>Categories Total:</span>
                                        <span>Rp {calculateCategoriesTotal().toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="border-t border-blue-400 pt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold">Grand Total:</span>
                                        <span className="text-2xl font-bold">
                                            Rp {Number(invoice.total_amount).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Created By */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="w-5 h-5 text-orange-600" />
                                <h2 className="text-lg font-semibold">Invoice Information</h2>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created By</label>
                                    <p className="text-gray-900">{invoice.creator?.name}</p>
                                </div>
                                
                                {invoice.approver && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            {invoice.status === 'approved' ? 'Approved By' : 'Processed By'}
                                        </label>
                                        <p className="text-gray-900">{invoice.approver?.name}</p>
                                    </div>
                                )}
                                
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                    <p className="text-gray-900">{formatDate(invoice.updated_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = (page) => <Layout children={page} />;