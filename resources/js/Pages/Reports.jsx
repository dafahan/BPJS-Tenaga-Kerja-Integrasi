import { Head, router } from '@inertiajs/react';
import { FileText, Users, DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';
import Layout from '@/js/Layouts/Layout';

export default function Index() {
    const reportItems = [
        {
            title: 'Invoice Reports',
            description: 'Comprehensive invoice analytics and summaries',
            icon: <FileText className="w-8 h-8 text-blue-600" />,
            path: '/reports/invoices',
            bgColor: 'bg-blue-50',
            features: ['Invoice status tracking', 'Revenue analysis', 'Date range filtering', 'Export capabilities']
        },
        {
            title: 'Patient Reports',
            description: 'Patient demographics and medical history reports',
            icon: <Users className="w-8 h-8 text-green-600" />,
            path: '/reports/patients',
            bgColor: 'bg-green-50',
            features: ['Patient demographics', 'Treatment history', 'Medical records', 'Statistical analysis']
        },
        {
            title: 'Financial Summary',
            description: 'Revenue and financial performance overview',
            icon: <DollarSign className="w-8 h-8 text-purple-600" />,
            path: '/reports/financial',
            bgColor: 'bg-purple-50',
            features: ['Revenue tracking', 'Payment status', 'Monthly trends', 'Category breakdown']
        },
        {
            title: 'Analytics Dashboard',
            description: 'Visual charts and performance metrics',
            icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
            path: '/reports/analytics',
            bgColor: 'bg-orange-50',
            features: ['Interactive charts', 'KPI metrics', 'Trend analysis', 'Performance indicators']
        }
    ];

    const quickActions = [
        {
            title: 'Monthly Invoice Report',
            description: 'Generate current month invoice summary',
            action: () => generateReport('monthly-invoices'),
            icon: <Calendar className="w-6 h-6 text-blue-600" />
        },
        {
            title: 'Export All Patients',
            description: 'Download complete patient database',
            action: () => generateReport('all-patients'),
            icon: <Download className="w-6 h-6 text-green-600" />
        },
        {
            title: 'Revenue Summary',
            description: 'Generate quarterly revenue report',
            action: () => generateReport('revenue-summary'),
            icon: <DollarSign className="w-6 h-6 text-purple-600" />
        }
    ];

    const generateReport = (type) => {
        // This would typically make an API call to generate and download the report
        console.log(`Generating ${type} report...`);
        alert(`Generating ${type} report... This feature will be implemented with the backend.`);
    };

    return (
        <>
            <Head title="Reports" />
            
            <div className="p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-gray-600 mt-2">Generate comprehensive reports and analyze your healthcare data</p>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quickActions.map((action, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={action.action}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        {action.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                                        <p className="text-sm text-gray-500">{action.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Report Categories */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Report Categories</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {reportItems.map((item, index) => (
                            <div key={index} className={`${item.bgColor} rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer`} onClick={() => router.get(item.path)}>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                        {item.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-gray-600 mb-4">{item.description}</p>
                                        <ul className="space-y-1">
                                            {item.features.map((feature, idx) => (
                                                <li key={idx} className="text-sm text-gray-600 flex items-center">
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-4">
                                            <span className="text-blue-600 font-medium text-sm hover:text-blue-700">
                                                View Reports →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Report Activity</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Monthly invoice report generated</span>
                            </div>
                            <span className="text-xs text-gray-500">2 hours ago</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Patient demographics report exported</span>
                            </div>
                            <span className="text-xs text-gray-500">1 day ago</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Revenue analysis completed</span>
                            </div>
                            <span className="text-xs text-gray-500">3 days ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
Index.layout = (page) => <Layout children={page} />;