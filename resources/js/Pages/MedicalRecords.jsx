import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, FileText, User, Calendar, Activity, Search, Filter, Eye } from 'lucide-react';
import Layout from '@/js/Layouts/Layout';

export default function Index({ medicalRecords }) {
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [patients, setPatients] = useState([]);
    const [patientSearch, setPatientSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [jenisRawatFilter, setJenisRawatFilter] = useState('all');
    const [formData, setFormData] = useState({
        patient_id: '',
        no_rawat_medis: '',
        tgl_kecelakaan: '',
        tgl_pengobatan: '',
        tgl_masuk: '',
        tgl_keluar: '',
        diagnosis: '',
        keluhan: '',
        jenis_rawat: '',
        status: 'active'
    });

    const searchPatients = async (query) => {
        if (query.length > 2) {
            try {
                const response = await fetch(`/api/patients/search?q=${query}`);
                const data = await response.json();
                setPatients(data);
            } catch (error) {
                console.error('Error searching patients:', error);
                setPatients([]);
            }
        } else {
            setPatients([]);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            searchPatients(patientSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [patientSearch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.patient_id) {
            alert('Please select a patient');
            return;
        }
        
        if (editingRecord) {
            router.put(`/medical-records/${editingRecord.id}`, formData, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingRecord(null);
                    resetForm();
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                }
            });
        } else {
            router.post('/medical-records', formData, {
                onSuccess: () => {
                    setShowModal(false);
                    resetForm();
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                }
            });
        }
    };

    const resetForm = () => {
        setFormData({
            patient_id: '',
            no_rawat_medis: '',
            tgl_kecelakaan: '',
            tgl_pengobatan: '',
            tgl_masuk: '',
            tgl_keluar: '',
            diagnosis: '',
            keluhan: '',
            jenis_rawat: '',
            status: 'active'
        });
        setPatientSearch('');
        setPatients([]);
    };

    const openAddModal = () => {
        resetForm();
        setEditingRecord(null);
        setShowModal(true);
    };

    const openEditModal = (record) => {
        setEditingRecord(record);
        setFormData({
            patient_id: record.patient_id,
            no_rawat_medis: record.no_rawat_medis,
            tgl_kecelakaan: record.tgl_kecelakaan,
            tgl_pengobatan: record.tgl_pengobatan,
            tgl_masuk: record.tgl_masuk,
            tgl_keluar: record.tgl_keluar || '',
            diagnosis: record.diagnosis,
            keluhan: record.keluhan,
            jenis_rawat: record.jenis_rawat,
            status: record.status
        });
        setPatientSearch(record.patient?.nama_pasien || '');
        setShowModal(true);
    };

    const deleteRecord = (id, no_rawat) => {
        if (confirm(`Are you sure you want to delete medical record "${no_rawat}"?`)) {
            router.delete(`/medical-records/${id}`, {
                onSuccess: () => {
                    // Success message will be handled by flash messages
                },
                onError: (error) => {
                    alert('Error deleting medical record. Please try again.');
                }
            });
        }
    };

    const selectPatient = (patient) => {
        setFormData({...formData, patient_id: patient.id});
        setPatientSearch(`${patient.nama_pasien} (${patient.no_kpj})`);
        setPatients([]);
    };

    const getJenisRawatLabel = (jenis) => {
        const labels = {
            'rawat_jalan': 'Rawat Jalan',
            'rawat_inap': 'Rawat Inap',
            'ugd': 'UGD'
        };
        return labels[jenis] || jenis;
    };

    const getJenisRawatColor = (jenis) => {
        const colors = {
            'rawat_jalan': 'bg-blue-100 text-blue-800',
            'rawat_inap': 'bg-purple-100 text-purple-800',
            'ugd': 'bg-red-100 text-red-800'
        };
        return colors[jenis] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID');
    };

    // Filter medical records
    const filteredRecords = medicalRecords.data.filter(record => {
        const matchesSearch = record.no_rawat_medis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            record.patient?.nama_pasien.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            record.patient?.no_kpj.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        const matchesJenisRawat = jenisRawatFilter === 'all' || record.jenis_rawat === jenisRawatFilter;
        
        return matchesSearch && matchesStatus && matchesJenisRawat;
    });

    // Statistics
    const stats = {
        total: medicalRecords.data.length,
        active: medicalRecords.data.filter(r => r.status === 'active').length,
        completed: medicalRecords.data.filter(r => r.status === 'completed').length,
        ugd: medicalRecords.data.filter(r => r.jenis_rawat === 'ugd').length,
        rawat_inap: medicalRecords.data.filter(r => r.jenis_rawat === 'rawat_inap').length,
        rawat_jalan: medicalRecords.data.filter(r => r.jenis_rawat === 'rawat_jalan').length
    };

    return (
        <>
            <Head title="Medical Records" />
            
            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
                        <p className="text-gray-600">Manage patient medical records and treatment history</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus size={20} />
                        New Medical Record
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Records</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <Activity className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-xl font-bold text-gray-600">{stats.completed}</p>
                            </div>
                            <Calendar className="w-6 h-6 text-gray-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">UGD</p>
                                <p className="text-xl font-bold text-red-600">{stats.ugd}</p>
                            </div>
                            <div className="w-6 h-6 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">!</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Rawat Inap</p>
                                <p className="text-xl font-bold text-purple-600">{stats.rawat_inap}</p>
                            </div>
                            <div className="w-6 h-6 bg-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">R</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Rawat Jalan</p>
                                <p className="text-xl font-bold text-blue-600">{stats.rawat_jalan}</p>
                            </div>
                            <div className="w-6 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">J</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search by record number, patient name, or diagnosis..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Type</label>
                            <select
                                value={jenisRawatFilter}
                                onChange={(e) => setJenisRawatFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Types</option>
                                <option value="rawat_jalan">Rawat Jalan</option>
                                <option value="rawat_inap">Rawat Inap</option>
                                <option value="ugd">UGD</option>
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
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Medical Records Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medical Record</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Treatment Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoices</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRecords.length > 0 ? (
                                    filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{record.no_rawat_medis}</div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">{record.diagnosis}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8">
                                                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                                                            <User className="h-4 w-4 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {record.patient?.nama_pasien}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            KPJ: {record.patient?.no_kpj}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getJenisRawatColor(record.jenis_rawat)}`}>
                                                    {getJenisRawatLabel(record.jenis_rawat)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>
                                                    <div className="font-medium">Masuk: {formatDate(record.tgl_masuk)}</div>
                                                    {record.tgl_keluar && (
                                                        <div>Keluar: {formatDate(record.tgl_keluar)}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    record.status === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    <Activity className="w-3 h-3 mr-1" />
                                                    {record.status === 'active' ? 'Active' : 'Completed'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-gray-900">{record.invoices_count || 0}</span>
                                                    {record.invoices_count > 0 && (
                                                        <button
                                                            onClick={() => router.get(`/invoices?medical_record_id=${record.id}`)}
                                                            className="ml-2 text-blue-600 hover:text-blue-900"
                                                            title="View Invoices"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => router.get(`/medical-records/${record.id}`)}
                                                        className="text-green-600 hover:text-green-900 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(record)}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                                        title="Edit Record"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteRecord(record.id, record.no_rawat_medis)}
                                                        className="text-red-600 hover:text-red-900 transition-colors"
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No medical records found</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {searchTerm || statusFilter !== 'all' || jenisRawatFilter !== 'all'
                                                    ? 'Try adjusting your search or filter criteria.'
                                                    : 'Get started by creating your first medical record.'}
                                            </p>
                                            {(!searchTerm && statusFilter === 'all' && jenisRawatFilter === 'all') && (
                                                <div className="mt-6">
                                                    <button
                                                        onClick={openAddModal}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                                                        New Medical Record
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

                {/* Pagination */}
                {medicalRecords.links && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex space-x-1">
                            {medicalRecords.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    className={`px-3 py-2 text-sm rounded-md ${
                                        link.active 
                                            ? 'bg-blue-500 text-white' 
                                            : link.url 
                                                ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300' 
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Medical Record Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                {editingRecord ? 'Edit Medical Record' : 'Create New Medical Record'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Patient Selection */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Search and Select Patient *
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={patientSearch}
                                                onChange={(e) => setPatientSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Search patient by name, KPJ, or NIK..."
                                                required
                                            />
                                        </div>
                                        {patients.length > 0 && (
                                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                                {patients.map((patient) => (
                                                    <div
                                                        key={patient.id}
                                                        onClick={() => selectPatient(patient)}
                                                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="font-medium text-gray-900">{patient.nama_pasien}</div>
                                                        <div className="text-sm text-gray-500">
                                                            KPJ: {patient.no_kpj} | NIK: {patient.nik}
                                                        </div>
                                                        {patient.alamat && (
                                                            <div className="text-xs text-gray-400 truncate">{patient.alamat}</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Medical Record Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            No. Rawat Medis *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.no_rawat_medis}
                                            onChange={(e) => setFormData({...formData, no_rawat_medis: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="RM-YYYY-XXXX"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Jenis Rawat *
                                        </label>
                                        <select
                                            value={formData.jenis_rawat}
                                            onChange={(e) => setFormData({...formData, jenis_rawat: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Treatment Type</option>
                                            <option value="rawat_jalan">Rawat Jalan</option>
                                            <option value="rawat_inap">Rawat Inap</option>
                                            <option value="ugd">Unit Gawat Darurat (UGD)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tanggal Kecelakaan *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.tgl_kecelakaan}
                                            onChange={(e) => setFormData({...formData, tgl_kecelakaan: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tanggal Pengobatan *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.tgl_pengobatan}
                                            onChange={(e) => setFormData({...formData, tgl_pengobatan: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tanggal Masuk *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.tgl_masuk}
                                            onChange={(e) => setFormData({...formData, tgl_masuk: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tanggal Keluar
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.tgl_keluar}
                                            onChange={(e) => setFormData({...formData, tgl_keluar: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Medical Information */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Diagnosis *
                                        </label>
                                        <textarea
                                            value={formData.diagnosis}
                                            onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            rows="3"
                                            placeholder="Enter patient diagnosis..."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Keluhan (Complaints) *
                                        </label>
                                        <textarea
                                            value={formData.keluhan}
                                            onChange={(e) => setFormData({...formData, keluhan: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            rows="3"
                                            placeholder="Enter patient complaints and symptoms..."
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingRecord(null);
                                            resetForm();
                                        }}
                                        className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                    >
                                        {editingRecord ? 'Update Medical Record' : 'Create Medical Record'}
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