import { Head } from '@inertiajs/react';
import { Users, FileText, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import Layout from '@/js/Layouts/Layout';

export default function Index({ stats, recentInvoices, monthlyRevenue, userRole }) {
    const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
                    <Icon size={24} />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );

    const formatCurrency = (amount) => {
        return `Rp ${Number(amount || 0).toLocaleString()}`;
    };

    return (
        <>
            <Head title="Dashboard" />
            
            <div className="p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Welcome back! Here's what's happening with your system.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Patients"
                        value={stats.total_patients}
                        icon={Users}
                        color="blue"
                    />
                    <StatCard
                        title="Total Invoices"
                        value={stats.total_invoices}
                        icon={FileText}
                        color="green"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats.total_revenue)}
                        icon={DollarSign}
                        color="purple"
                    />
                    <StatCard
                        title="Active Medical Records"
                        value={stats.active_medical_records}
                        icon={CheckCircle}
                        color="yellow"
                    />
                </div>

                {/* Invoice Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Pending Invoices"
                        value={stats.pending_invoices}
                        icon={Clock}
                        color="yellow"
                    />
                    <StatCard
                        title="Approved Invoices"
                        value={stats.approved_invoices}
                        icon={CheckCircle}
                        color="green"
                    />
                    <StatCard
                        title="Rejected Invoices"
                        value={stats.rejected_invoices}
                        icon={XCircle}
                        color="red"
                    />
                </div>

                {/* Recent Invoices */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {recentInvoices.map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            {invoice.invoice_number}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {invoice.medical_record?.patient?.nama_pasien}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {formatCurrency(invoice.total_amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                invoice.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                invoice.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                                                invoice.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {invoice.status === 'draft' && 'Draft'}
                                                {invoice.status === 'submitted' && 'Submitted'}
                                                {invoice.status === 'approved' && 'Approved'}
                                                {invoice.status === 'rejected' && 'Rejected'}
                                                {invoice.status === 'paid' && 'Paid'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(invoice.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

Index.layout = (page) => <Layout children={page} />;