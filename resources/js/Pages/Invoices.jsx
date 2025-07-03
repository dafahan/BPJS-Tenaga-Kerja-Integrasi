// Update Invoices.jsx - Remove category section from form
import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Eye, Edit, Trash2, FileText, Check, X, Plus, Search, ArrowLeft } from 'lucide-react';
import Layout from '@/js/Layouts/Layout';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Index({ invoices, filters, medicalRecords, services, medicines }) {
    const { auth } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [rejectionModal, setRejectionModal] = useState(false);
    const [rejectionNotes, setRejectionNotes] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [patientSearch, setPatientSearch] = useState('');
    const [medicalRecordOptions, setMedicalRecordOptions] = useState(medicalRecords || []);
    
    const [formData, setFormData] = useState({
        medical_record_id: '',
        invoice_number: '',
        tanggal_jkk: '',
        notes: '',
        details: []
    });

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

    const generateInvoiceNumber = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `INV-${year}${month}-${random}`;
    };

    const searchPatients = async (query) => {
        if (query.length > 2) {
            try {
                const response = await axios.get(`/api/patients/search?q=${query}`);
                setPatients(response.data);
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

    const resetForm = () => {
        setFormData({
            medical_record_id: '',
            invoice_number: generateInvoiceNumber(),
            tanggal_jkk: '',
            notes: '',
            details: []
        });
        setPatientSearch('');
        setPatients([]);
    };

    const openCreateModal = () => {
        resetForm();
        setEditingInvoice(null);
        setShowModal(true);
    };

    const openEditModal = (invoice) => {
            setEditingInvoice(invoice);
            setFormData({
                medical_record_id: invoice.medical_record_id,
                invoice_number: invoice.invoice_number,
                tanggal_jkk: invoice.tanggal_jkk || '',
                notes: invoice.notes || '',
                details: invoice.invoice_details?.map(detail => ({
                    item_type: detail.item_type,
                    item_id: detail.item_id,
                    quantity: detail.quantity,
                    unit_price: detail.unit_price
                })) || []
            });
            setPatientSearch(`${invoice.medical_record?.patient?.nama_pasien} - ${invoice.medical_record?.no_rawat_medis}`);
            setShowModal(true);
    };

    const selectMedicalRecord = (record) => {
        setFormData({...formData, medical_record_id: record.id});
        setPatientSearch(`${record.patient?.nama_pasien} - ${record.no_rawat_medis}`);
        setPatients([]);
    };

    const addDetail = () => {
        setFormData({
            ...formData,
            details: [...formData.details, {
                item_type: 'service',
                item_id: '',
                quantity: 1,
                unit_price: 0
            }]
        });
    };

    const updateDetail = (index, field, value) => {
        const newDetails = [...formData.details];
        newDetails[index][field] = value;
        
        if (field === 'item_id' && value) {
            const itemType = newDetails[index].item_type;
            let price = 0;
            
            if (itemType === 'service') {
                const service = services?.find(s => s.id == value);
                price = service?.tarif || 0;
            } else if (itemType === 'medicine') {
                const medicine = medicines?.find(m => m.id == value);
                price = medicine?.price || 0;
            }
            
            newDetails[index].unit_price = price;
        }
        
        setFormData({...formData, details: newDetails});
    };

    const removeDetail = (index) => {
        const newDetails = formData.details.filter((_, i) => i !== index);
        setFormData({...formData, details: newDetails});
    };

    const getItemOptions = (itemType) => {
        switch(itemType) {
            case 'service': return services?.filter(s => s.status) || [];
            case 'medicine': return medicines?.filter(m => m.status) || [];
            default: return [];
        }
    };

    const calculateTotal = () => {
        return formData.details.reduce((sum, detail) => {
            return sum + (detail.quantity * detail.unit_price);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.medical_record_id) {
            Swal.fire('Error!', 'Please select a medical record', 'error');
            return;
        }
        
        if (formData.details.length === 0) {
            Swal.fire('Error!', 'Please add at least one item', 'error');
            return;
        }
        
        setLoading(true);
        
        try {
            if (editingInvoice) {
                await axios.put(`/invoices/${editingInvoice.id}`, formData);
                Swal.fire('Success!', 'Invoice updated successfully', 'success');
            } else {
                await axios.post('/invoices', formData);
                Swal.fire('Success!', 'Invoice created successfully', 'success');
            }
            
            setShowModal(false);
            setEditingInvoice(null);
            resetForm();
            router.reload();
        } catch (error) {
            Swal.fire('Error!', error.response?.data?.message || 'Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (invoice) => {
        const result = await Swal.fire({
            title: 'Approve Invoice?',
            text: 'Are you sure you want to approve this invoice?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, approve it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.post(`/invoices/${invoice.id}/approve`);
                Swal.fire('Approved!', 'Invoice has been approved.', 'success');
                router.reload();
            } catch (error) {
                Swal.fire('Error!', error.response?.data?.message || 'Something went wrong', 'error');
            }
        }
    };

    const handleReject = (invoice) => {
        setSelectedInvoice(invoice);
        setRejectionModal(true);
    };

    const submitRejection = async () => {
        if (!rejectionNotes.trim()) {
            Swal.fire('Error!', 'Please provide rejection notes', 'error');
            return;
        }

        try {
            await axios.post(`/invoices/${selectedInvoice.id}/reject`, {
                notes: rejectionNotes
            });
            Swal.fire('Rejected!', 'Invoice has been rejected.', 'success');
            setRejectionModal(false);
            setRejectionNotes('');
            setSelectedInvoice(null);
            router.reload();
        } catch (error) {
            Swal.fire('Error!', error.response?.data?.message || 'Something went wrong', 'error');
        }
    };

    const handleSubmitInvoice = async (invoice) => {
        const result = await Swal.fire({
            title: 'Submit Invoice?',
            text: 'Are you sure you want to submit this invoice?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, submit it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.post(`/invoices/${invoice.id}/submit`);
                Swal.fire('Submitted!', 'Invoice has been submitted.', 'success');
                router.reload();
            } catch (error) {
                Swal.fire('Error!', error.response?.data?.message || 'Something went wrong', 'error');
            }
        }
    };

    const deleteInvoice = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Invoice?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/invoices/${id}`);
                Swal.fire('Deleted!', 'Invoice has been deleted.', 'success');
                router.reload();
            } catch (error) {
                Swal.fire('Error!', error.response?.data?.message || 'Something went wrong', 'error');
            }
        }
    };

    const filterByStatus = (status) => {
        router.get('/invoices', { ...filters, status }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    return (
        <>
            <Head title="Invoices" />
            
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Invoices</h1>
                    {auth.user.role === 'admin_rs' && (
                        <button
                            onClick={openCreateModal}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Create Invoice
                        </button>
                    )}
                </div>

                {/* Status Filter */}
                <div className="mb-6 flex space-x-2">
                    <button
                        onClick={() => filterByStatus('')}
                        className={`px-4 py-2 rounded ${!filters?.status ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => filterByStatus('draft')}
                        className={`px-4 py-2 rounded ${filters?.status === 'draft' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border'}`}
                    >
                        Draft
                    </button>
                    <button
                        onClick={() => filterByStatus('submitted')}
                        className={`px-4 py-2 rounded ${filters?.status === 'submitted' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border'}`}
                    >
                        Submitted
                    </button>
                    <button
                        onClick={() => filterByStatus('approved')}
                        className={`px-4 py-2 rounded ${filters?.status === 'approved' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border'}`}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => filterByStatus('rejected')}
                        className={`px-4 py-2 rounded ${filters?.status === 'rejected' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border'}`}
                    >
                        Rejected
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medical Record</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {invoices?.data?.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{invoice.invoice_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{invoice.medical_record?.patient?.nama_pasien}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{invoice.medical_record?.no_rawat_medis}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">Rp {Number(invoice.total_amount).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(invoice.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => router.get(`/invoices/${invoice.id}`)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            
                                            <button
                                                onClick={() => router.get(`/invoices/${invoice.id}/print`)}
                                                className="text-green-600 hover:text-green-900"
                                                title="Print Invoice"
                                            >
                                                <FileText size={16} />
                                            </button>

                                            {auth.user.role === 'admin_rs' && (
                                                <>
                                                    {invoice.status === 'draft' && (
                                                        <>
                                                            <button
                                                                onClick={() => openEditModal(invoice)}
                                                               className="text-yellow-600 hover:text-yellow-900"
                                                               title="Edit"
                                                           >
                                                               <Edit size={16} />
                                                           </button>
                                                           <button
                                                               onClick={() => handleSubmitInvoice(invoice)}
                                                               className="text-blue-600 hover:text-blue-900"
                                                               title="Submit"
                                                           >
                                                               <Check size={16} />
                                                           </button>
                                                           <button
                                                               onClick={() => deleteInvoice(invoice.id)}
                                                               className="text-red-600 hover:text-red-900"
                                                               title="Delete"
                                                           >
                                                               <Trash2 size={16} />
                                                           </button>
                                                       </>
                                                   )}
                                               </>
                                           )}

                                           {auth.user.role === 'admin_bpjs' && invoice.status === 'submitted' && (
                                               <>
                                                   <button
                                                       onClick={() => handleApprove(invoice)}
                                                       className="text-green-600 hover:text-green-900"
                                                       title="Approve"
                                                   >
                                                       <Check size={16} />
                                                   </button>
                                                   <button
                                                       onClick={() => handleReject(invoice)}
                                                       className="text-red-600 hover:text-red-900"
                                                       title="Reject"
                                                   >
                                                       <X size={16} />
                                                   </button>
                                               </>
                                           )}
                                       </div>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>

               {/* Pagination */}
               {invoices?.links && (
                   <div className="mt-4 flex justify-center">
                       <div className="flex space-x-1">
                           {invoices.links.map((link, index) => (
                               <button
                                   key={index}
                                   onClick={() => router.get(link.url)}
                                   disabled={!link.url}
                                   className={`px-3 py-2 text-sm ${
                                       link.active 
                                           ? 'bg-blue-500 text-white' 
                                           : link.url 
                                               ? 'bg-white text-gray-700 hover:bg-gray-50 border' 
                                               : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                   } rounded`}
                                   dangerouslySetInnerHTML={{ __html: link.label }}
                               />
                           ))}
                       </div>
                   </div>
               )}
           </div>

           {/* Create/Edit Invoice Modal */}
           {showModal && (
               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                   <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
                       <div className="p-6">
                           <div className="flex items-center gap-4 mb-6">
                               <button
                                   onClick={() => {
                                       setShowModal(false);
                                       setEditingInvoice(null);
                                       resetForm();
                                   }}
                                   className="p-2 hover:bg-gray-100 rounded-lg"
                               >
                                   <ArrowLeft size={20} />
                               </button>
                               <div>
                                   <h2 className="text-2xl font-bold text-gray-900">
                                       {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
                                   </h2>
                                   <p className="text-gray-600">
                                       {editingInvoice ? 'Edit existing invoice' : 'Create a new invoice for medical services'}
                                   </p>
                               </div>
                           </div>

                           <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Invoice Number *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.invoice_number}
                                            onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                            readOnly={editingInvoice}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tanggal JKK *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.tanggal_jkk}
                                            onChange={(e) => setFormData({...formData, tanggal_jkk: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Search Medical Record *
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={patientSearch}
                                                onChange={(e) => setPatientSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Search by patient name or medical record number..."
                                                required
                                            />
                                        </div>
                                        
                                        {patients.length > 0 && (
                                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                                {medicalRecordOptions.filter(record => 
                                                    patients.some(patient => patient.id === record.patient_id)
                                                ).map((record) => (
                                                    <div
                                                        key={record.id}
                                                        onClick={() => selectMedicalRecord(record)}
                                                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="font-medium text-gray-900">{record.patient?.nama_pasien}</div>
                                                        <div className="text-sm text-gray-500">
                                                            Medical Record: {record.no_rawat_medis} | KPJ: {record.patient?.no_kpj}
                                                        </div>
                                                        <div className="text-xs text-gray-400">{record.diagnosis}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows="3"
                                        placeholder="Additional notes for this invoice..."
                                    />
                                </div>
                                </div>

                               {/* Invoice Details */}
                               <div className="bg-gray-50 rounded-lg p-4">
                                   <div className="flex justify-between items-center mb-4">
                                       <h3 className="text-lg font-semibold">Invoice Details</h3>
                                       <button
                                           type="button"
                                           onClick={addDetail}
                                           className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                       >
                                           <Plus size={16} />
                                           Add Item
                                       </button>
                                   </div>
                                   
                                   {formData.details.map((detail, index) => (
                                       <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 p-4 border rounded-lg bg-white">
                                           <div>
                                               <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                               <select
                                                   value={detail.item_type}
                                                   onChange={(e) => updateDetail(index, 'item_type', e.target.value)}
                                                   className="w-full border border-gray-300 rounded px-3 py-2"
                                               >
                                                   <option value="service">Service</option>
                                                   <option value="medicine">Medicine</option>
                                               </select>
                                           </div>
                                           
                                           <div>
                                               <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                                               <select
                                                   value={detail.item_id}
                                                   onChange={(e) => updateDetail(index, 'item_id', e.target.value)}
                                                   className="w-full border border-gray-300 rounded px-3 py-2"
                                                   required
                                               >
                                                   <option value="">Select Item</option>
                                                   {getItemOptions(detail.item_type).map((item) => (
                                                       <option key={item.id} value={item.id}>
                                                           {item.name} ({item.code})
                                                       </option>
                                                   ))}
                                               </select>
                                           </div>
                                           
                                           <div>
                                               <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                               <input
                                                   type="number"
                                                   value={detail.quantity}
                                                   onChange={(e) => updateDetail(index, 'quantity', Number(e.target.value))}
                                                   className="w-full border border-gray-300 rounded px-3 py-2"
                                                   min="1"
                                                   required
                                               />
                                           </div>
                                           
                                           <div>
                                               <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                                               <input
                                                   type="number"
                                                   value={detail.unit_price}
                                                   onChange={(e) => updateDetail(index, 'unit_price', Number(e.target.value))}
                                                   className="w-full border border-gray-300 rounded px-3 py-2"
                                                   min="0"
                                                   step="0.01"
                                                   required
                                               />
                                           </div>
                                           
                                           <div>
                                               <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                                               <input
                                                   type="text"
                                                   value={`Rp ${(detail.quantity * detail.unit_price).toLocaleString()}`}
                                                   className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                                                   readOnly
                                               />
                                           </div>
                                           
                                           <div className="flex items-end">
                                               <button
                                                   type="button"
                                                   onClick={() => removeDetail(index)}
                                                   className="text-red-600 hover:text-red-900 p-2"
                                               >
                                                   <Trash2 size={16} />
                                               </button>
                                           </div>
                                       </div>
                                   ))}
                               </div>

                               {/* Total */}
                               <div className="bg-blue-50 rounded-lg p-4">
                                   <div className="flex justify-between items-center text-xl font-bold">
                                       <span>Total Amount:</span>
                                       <span>Rp {calculateTotal().toLocaleString()}</span>
                                   </div>
                               </div>

                               {/* Actions */}
                               <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                                   <button
                                       type="button"
                                       onClick={() => {
                                           setShowModal(false);
                                           setEditingInvoice(null);
                                           resetForm();
                                       }}
                                       className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                   >
                                       Cancel
                                   </button>
                                   <button
                                       type="submit"
                                       disabled={loading}
                                       className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                                   >
                                       {loading ? (editingInvoice ? 'Updating...' : 'Creating...') : (editingInvoice ? 'Update Invoice' : 'Create Invoice')}
                                   </button>
                               </div>
                           </form>
                       </div>
                   </div>
               </div>
           )}

           {/* Rejection Modal */}
           {rejectionModal && (
               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                   <div className="bg-white rounded-lg p-6 w-full max-w-md">
                       <h2 className="text-xl font-bold mb-4">Reject Invoice</h2>
                       <div className="mb-4">
                           <label className="block text-sm font-medium mb-2">Rejection Notes</label>
                           <textarea
                               value={rejectionNotes}
                               onChange={(e) => setRejectionNotes(e.target.value)}
                               className="w-full border rounded px-3 py-2"
                               rows="4"
                               placeholder="Please provide reason for rejection..."
                               required
                           />
                       </div>
                       <div className="flex justify-end space-x-2">
                           <button
                               onClick={() => {
                                   setRejectionModal(false);
                                   setRejectionNotes('');
                                   setSelectedInvoice(null);
                               }}
                               className="px-4 py-2 text-gray-600 border rounded"
                           >
                               Cancel
                           </button>
                           <button
                               onClick={submitRejection}
                               className="px-4 py-2 bg-red-500 text-white rounded"
                           >
                               Reject Invoice
                           </button>
                       </div>
                   </div>
               </div>
           )}
       </>
   );
}
Index.layout = (page) => <Layout children={page} />;