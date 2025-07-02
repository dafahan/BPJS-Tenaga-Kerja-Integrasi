import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, Stethoscope, Filter, CheckCircle, XCircle } from 'lucide-react';
import Layout from '@/js/Layouts/Layout';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Index({ services, categories }) {
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        category_id: '',
        name: '',
        code: '',
        tarif: '',
        description: '',
        status: true
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if (editingService) {
                await axios.put(`/services/${editingService.id}`, formData);
                Swal.fire('Success!', 'Service updated successfully', 'success');
            } else {
                await axios.post('/services', formData);
                Swal.fire('Success!', 'Service created successfully', 'success');
            }
            
            setShowModal(false);
            setEditingService(null);
            resetForm();
            router.reload();
        } catch (error) {
            Swal.fire('Error!', error.response?.data?.message || 'Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            category_id: '',
            name: '',
            code: '',
            tarif: '',
            description: '',
            status: true
        });
    };

    const openAddModal = () => {
        resetForm();
        setEditingService(null);
        setShowModal(true);
    };

    const openEditModal = (service) => {
        setEditingService(service);
        setFormData({
            category_id: service.category_id,
            name: service.name,
            code: service.code,
            tarif: service.tarif,
            description: service.description || '',
            status: service.status
        });
        setShowModal(true);
    };

    const deleteService = async (id, name) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete service "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/services/${id}`);
                Swal.fire('Deleted!', 'Service has been deleted.', 'success');
                router.reload();
            } catch (error) {
                Swal.fire('Error!', error.response?.data?.message || 'Something went wrong', 'error');
            }
        }
    };

    // Filter services based on search, category, and status
    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            service.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            service.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || service.category_id.toString() === categoryFilter;
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && service.status) ||
                            (statusFilter === 'inactive' && !service.status);
        
        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <>
            <Head title="Services" />
            
            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Healthcare Services</h1>
                        <p className="text-gray-600">Manage hospital services and their pricing</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        Add Service
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Services</p>
                                <p className="text-2xl font-bold text-gray-900">{services.length}</p>
                            </div>
                            <Stethoscope className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Services</p>
                                <p className="text-2xl font-bold text-green-600">{services.filter(s => s.status).length}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Categories</p>
                                <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
                            </div>
                            <Filter className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg. Tarif</p>
                                <p className="text-lg font-bold text-orange-600">
                                    Rp {services.length > 0 ? 
                                        Math.round(services.reduce((sum, s) => sum + Number(s.tarif), 0) / services.length).toLocaleString() 
                                        : '0'}
                                </p>
                            </div>
                            <div className="text-orange-600">₹</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Services</label>
                            <input
                                type="text"
                                placeholder="Search by name, code, or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Services Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarif</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredServices.length > 0 ? (
                                    filteredServices.map((service) => (
                                        <tr key={service.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{service.name}</div>
                                                    {service.description && (
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">{service.description}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-mono text-gray-900">{service.code}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {service.category?.name || 'No Category'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900">
                                                    Rp {Number(service.tarif).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    service.status 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {service.status ? (
                                                        <>
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                            Inactive
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => openEditModal(service)}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                                        title="Edit Service"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteService(service.id, service.name)}
                                                        className="text-red-600 hover:text-red-900 transition-colors"
                                                        title="Delete Service"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                                                    ? 'Try adjusting your search or filter criteria.'
                                                    : 'Get started by adding your first service.'}
                                            </p>
                                            {(!searchTerm && categoryFilter === 'all' && statusFilter === 'all') && (
                                                <div className="mt-6">
                                                    <button
                                                        onClick={openAddModal}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                                                        Add Service
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Service Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                {editingService ? 'Edit Service' : 'Add New Service'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Service Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter service name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Service Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                        placeholder="SRV001"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tarif (Rp) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.tarif}
                                        onChange={(e) => setFormData({...formData, tarif: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows="3"
                                        placeholder="Service description or additional notes..."
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="status"
                                        checked={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.checked})}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="status" className="ml-2 block text-sm text-gray-700">
                                        Active service
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingService(null);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : (editingService ? 'Update Service' : 'Add Service')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
Index.layout = (page) => <Layout children={page} />;