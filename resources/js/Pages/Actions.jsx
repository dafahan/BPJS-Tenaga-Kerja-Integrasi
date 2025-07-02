import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Trash2, Edit, Plus } from 'lucide-react';
import Layout from '@/js/Layouts/Layout';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Index({ actions, categories }) {
    const [showModal, setShowModal] = useState(false);
    const [editingAction, setEditingAction] = useState(null);
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
            if (editingAction) {
                await axios.put(`/actions/${editingAction.id}`, formData);
                Swal.fire('Success!', 'Action updated successfully', 'success');
            } else {
                await axios.post('/actions', formData);
                Swal.fire('Success!', 'Action created successfully', 'success');
            }
            
            setShowModal(false);
            setEditingAction(null);
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

    const openEditModal = (action) => {
        setEditingAction(action);
        setFormData({
            category_id: action.category_id,
            name: action.name,
            code: action.code,
            tarif: action.tarif,
            description: action.description || '',
            status: action.status
        });
        setShowModal(true);
    };

    const deleteAction = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/actions/${id}`);
                Swal.fire('Deleted!', 'Action has been deleted.', 'success');
                router.reload();
            } catch (error) {
                Swal.fire('Error!', error.response?.data?.message || 'Something went wrong', 'error');
            }
        }
    };

    return (
        <>
            <Head title="Actions" />
            
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Actions</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Action
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarif</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {actions.map((action) => (
                                <tr key={action.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{action.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{action.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{action.category?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">Rp {Number(action.tarif).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            action.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {action.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openEditModal(action)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteAction(action.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingAction ? 'Edit Action' : 'Add Action'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                                    className="w-full border rounded px-3 py-2"
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
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Tarif</label>
                                <input
                                    type="number"
                                    value={formData.tarif}
                                    onChange={(e) => setFormData({...formData, tarif: e.target.value})}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.checked})}
                                        className="mr-2"
                                    />
                                    Active
                                </label>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingAction(null);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 text-gray-600 border rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
Index.layout = (page) => <Layout children={page} />;