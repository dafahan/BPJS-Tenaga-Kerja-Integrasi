import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import Layout from '@/js/Layouts/Layout';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function PatientsIndex() {
    const { patients } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        no_kpj: '',
        nama_pasien: '',
        nik: '',
        alamat: '',
        telepon: '',
        tanggal_lahir: '',
        jenis_kelamin: 'L'
    });

    const resetForm = () => {
        setFormData({
            no_kpj: '',
            nama_pasien: '',
            nik: '',
            alamat: '',
            telepon: '',
            tanggal_lahir: '',
            jenis_kelamin: 'L'
        });
        setEditingPatient(null);
    };

    const openModal = (patient = null) => {
        if (patient) {
            setFormData({
                no_kpj: patient.no_kpj,
                nama_pasien: patient.nama_pasien,
                nik: patient.nik,
                alamat: patient.alamat,
                telepon: patient.telepon || '',
                tanggal_lahir: patient.tanggal_lahir,
                jenis_kelamin: patient.jenis_kelamin
            });
            setEditingPatient(patient);
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingPatient) {
                await axios.put(`/patients/${editingPatient.id}`, formData);
                Swal.fire('Success!', 'Patient updated successfully', 'success');
            } else {
                await axios.post('/patients', formData);
                Swal.fire('Success!', 'Patient created successfully', 'success');
            }
            
            closeModal();
            router.reload();
        } catch (error) {
            Swal.fire('Error!', error.response?.data?.message || 'Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (patient) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Delete patient "${patient.nama_pasien}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/patients/${patient.id}`);
                Swal.fire('Deleted!', 'Patient has been deleted.', 'success');
                router.reload();
            } catch (error) {
                Swal.fire('Error!', error.response?.data?.message || 'Something went wrong', 'error');
            }
        }
    };

    const filteredPatients = patients.data?.filter(patient =>
        patient.nama_pasien.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.no_kpj.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.nik.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <FaPlus /> Add Patient
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, KPJ number, or NIK..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Patient Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                KPJ & NIK
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Medical Records
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPatients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {patient.nama_pasien}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {patient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} • {patient.umur} tahun
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Born: {new Date(patient.tanggal_lahir).toLocaleDateString('id-ID')}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        <div>KPJ: {patient.no_kpj}</div>
                                        <div>NIK: {patient.nik}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        <div className="max-w-xs truncate">{patient.alamat}</div>
                                        {patient.telepon && (
                                            <div className="text-gray-500">{patient.telepon}</div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {patient.medical_records_count} records
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => openModal(patient)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(patient)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* Pagination */}
                {patients.links && (
                    <div className="px-6 py-3 bg-gray-50 border-t">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {patients.from} to {patients.to} of {patients.total} results
                            </div>
                            <div className="flex gap-1">
                                {patients.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => router.get(link.url)}
                                        disabled={!link.url}
                                        className={`px-3 py-1 text-sm border rounded ${
                                            link.active
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 -top-12">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
                        <h2 className="text-lg font-bold mb-4">
                            {editingPatient ? 'Edit Patient' : 'Add Patient'}
                        </h2>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        KPJ Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.no_kpj}
                                        onChange={(e) => setFormData({...formData, no_kpj: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        NIK *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nik}
                                        onChange={(e) => setFormData({...formData, nik: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Patient Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nama_pasien}
                                        onChange={(e) => setFormData({...formData, nama_pasien: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Birth Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.tanggal_lahir}
                                        onChange={(e) => setFormData({...formData, tanggal_lahir: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Gender *
                                    </label>
                                    <select
                                        value={formData.jenis_kelamin}
                                        onChange={(e) => setFormData({...formData, jenis_kelamin: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    >
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.telepon}
                                        onChange={(e) => setFormData({...formData, telepon: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                    />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Address *
                                    </label>
                                    <textarea
                                        value={formData.alamat}
                                        onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        rows="3"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : (editingPatient ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

PatientsIndex.layout = (page) => <Layout children={page} />;