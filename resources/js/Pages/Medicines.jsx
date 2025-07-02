import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import Layout from '@/js/Layouts/Layout';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Index({ medicines }) {
    const [showModal, setShowModal] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        price: '',
        stock: '',
        unit: '',
        description: '',
        status: true
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if (editingMedicine) {
                await axios.put(`/medicines/${editingMedicine.id}`, formData);
                Swal.fire('Success!', 'Medicine updated successfully', 'success');
            } else {
                await axios.post('/medicines', formData);
                Swal.fire('Success!', 'Medicine created successfully', 'success');
            }
            
            setShowModal(false);
            setEditingMedicine(null);
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
            name: '',
            code: '',
            price: '',
            stock: '',
            unit: '',
            description: '',
            status: true
        });
    };

    const openAddModal = () => {
        resetForm();
        setEditingMedicine(null);
        setShowModal(true);
    };

    const openEditModal = (medicine) => {
        setEditingMedicine(medicine);
        setFormData({
            name: medicine.name,
            code: medicine.code,
            price: medicine.price,
            stock: medicine.stock,
            unit: medicine.unit,
            description: medicine.description || '',
            status: medicine.status
        });
        setShowModal(true);
    };

    const deleteMedicine = async (id, name) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete medicine "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/medicines/${id}`);
                Swal.fire('Deleted!', 'Medicine has been deleted.', 'success');
                router.reload();
            } catch (error) {
                Swal.fire('Error!', error.response?.data?.message || 'Something went wrong', 'error');
            }
        }
    };

    const getStockStatus = (stock) => {
        if (stock <= 0) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Out of Stock', icon: <AlertTriangle size={14} /> };
        if (stock <= 10) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Low Stock', icon: <AlertTriangle size={14} /> };
        return { color: 'text-green-600', bg: 'bg-green-100', label: 'In Stock', icon: <CheckCircle size={14} /> };
    };

    // Filter medicines based on search and status
    const filteredMedicines = medicines.filter(medicine => {
        const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            medicine.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && medicine.status) ||
                            (statusFilter === 'inactive' && !medicine.status) ||
                            (statusFilter === 'low_stock' && medicine.stock <= 10) ||
                            (statusFilter === 'out_of_stock' && medicine.stock <= 0);
        
        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <Head title="Medicines" />
            
            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Medicine Inventory</h1>
                        <p className="text-gray-600">Manage hospital medicine stock and pricing</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        Add Medicine
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search medicines by name or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="low_stock">Low Stock</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Medicines</p>
                                <p className="text-2xl font-bold text-gray-900">{medicines.length}</p>
                            </div>
                            <Package className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Medicines</p>
                                <p className="text-2xl font-bold text-green-600">{medicines.filter(m => m.status).length}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                                <p className="text-2xl font-bold text-yellow-600">{medicines.filter(m => m.stock <= 10 && m.stock > 0).length}</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                                <p className="text-2xl font-bold text-red-600">{medicines.filter(m => m.stock <= 0).length}</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Medicines Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredMedicines.length > 0 ? (
                                    filteredMedicines.map((medicine) => {
                                        const stockStatus = getStockStatus(medicine.stock);
                                        return (
                                            <tr key={medicine.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                                                        {medicine.description && (
                                                            <div className="text-sm text-gray-500 truncate max-w-xs">{medicine.description}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-mono text-gray-900">{medicine.code}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        Rp {Number(medicine.price).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                                                            {stockStatus.icon}
                                                            {medicine.stock}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900">{medicine.unit}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                        medicine.status 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {medicine.status ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => openEditModal(medicine)}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                                            title="Edit Medicine"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteMedicine(medicine.id, medicine.name)}
                                                            className="text-red-600 hover:text-red-900 transition-colors"
                                                            title="Delete Medicine"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No medicines found</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {searchTerm || statusFilter !== 'all' 
                                                    ? 'Try adjusting your search or filter criteria.'
                                                    : 'Get started by adding your first medicine.'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Medicine Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Medicine Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter medicine name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Medicine Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                        placeholder="MED001"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price (Rp) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Stock *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Unit *
                                    </label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select unit</option>
                                        <option value="tablet">Tablet</option>
                                        <option value="capsule">Capsule</option>
                                        <option value="ml">ML (Milliliter)</option>
                                        <option value="bottle">Bottle</option>
                                        <option value="box">Box</option>
                                        <option value="tube">Tube</option>
                                        <option value="sachet">Sachet</option>
                                        <option value="vial">Vial</option>
                                        <option value="strip">Strip</option>
                                    </select>
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
                                        placeholder="Medicine description, usage, or notes..."
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
                                        Active medicine
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingMedicine(null);
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
                                        {loading ? 'Saving...' : (editingMedicine ? 'Update Medicine' : 'Add Medicine')}
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