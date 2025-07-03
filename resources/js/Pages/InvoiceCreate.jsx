import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Search } from 'lucide-react';
import Layout from '@/js/Layouts/Layout';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function InvoiceCreate({ medicalRecords, categories, services, medicines }) {
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [patientSearch, setPatientSearch] = useState('');
    const [medicalRecordOptions, setMedicalRecordOptions] = useState(medicalRecords || []);
    
    const [formData, setFormData] = useState({
        medical_record_id: '',
        invoice_number: '',
        notes: '',
        details: [],
        categories: []
    });

    // Generate invoice number
    useEffect(() => {
        const generateInvoiceNumber = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            return `INV-${year}${month}-${random}`;
        };
        
        setFormData(prev => ({
            ...prev,
            invoice_number: generateInvoiceNumber()
        }));
    }, []);

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
        
        // Auto-fill price when item is selected
        if (field === 'item_id' && value) {
            const itemType = newDetails[index].item_type;
            let price = 0;
            
            if (itemType === 'service') {
                const service = services.find(s => s.id == value);
                price = service?.tarif || 0;
            } else if (itemType === 'medicine') {
                const medicine = medicines.find(m => m.id == value);
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

    const addCategory = () => {
        setFormData({
            ...formData,
            categories: [...formData.categories, {
                category_id: '',
                total_amount: 0,
                description: ''
            }]
        });
    };

    const updateCategory = (index, field, value) => {
        const newCategories = [...formData.categories];
        newCategories[index][field] = value;
        setFormData({...formData, categories: newCategories});
    };

    const removeCategory = (index) => {
        const newCategories = formData.categories.filter((_, i) => i !== index);
        setFormData({...formData, categories: newCategories});
    };

    const getItemOptions = (itemType) => {
        switch(itemType) {
            case 'service': return services.filter(s => s.status);
            case 'medicine': return medicines.filter(m => m.status);
            default: return [];
        }
    };

    const calculateTotal = () => {
        const detailsTotal = formData.details.reduce((sum, detail) => {
            return sum + (detail.quantity * detail.unit_price);
        }, 0);
        
        const categoriesTotal = formData.categories.reduce((sum, category) => {
            return sum + Number(category.total_amount || 0);
        }, 0);
        
        return detailsTotal + categoriesTotal;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.medical_record_id) {
            Swal.fire('Error!', 'Please select a medical record', 'error');
            return;
        }
        
        if (formData.details.length === 0 && formData.categories.length === 0) {
            Swal.fire('Error!', 'Please add at least one item or category', 'error');
            return;
        }
        
        setLoading(true);
        
        try {
            await axios.post('/invoices', formData);
            Swal.fire('Success!', 'Invoice created successfully', 'success');
            router.get('/invoices');
        } catch (error) {
            Swal.fire('Error!', error.response?.data?.message || 'Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="Create Invoice" />
            
            <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.get('/invoices')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
                        <p className="text-gray-600">Create a new invoice for medical services</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Invoice Details</h2>
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
                            <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 p-4 border rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={detail.item_type}
                                        onChange={(e) => updateDetail(index, 'item_type', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    >
                                        <option value="service">Service</option>
                                        <option value="medicine">Medicine</option>
                                        <option value="action">Action</option>
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
                                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
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

                    {/* Category-based Billing */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Category Billing</h2>
                            <button
                                type="button"
                                onClick={addCategory}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add Category
                            </button>
                        </div>
                        
                        {formData.categories.map((category, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={category.category_id}
                                        onChange={(e) => updateCategory(index, 'category_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name} ({cat.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                                    <input
                                        type="number"
                                        value={category.total_amount}
                                        onChange={(e) => updateCategory(index, 'total_amount', Number(e.target.value))}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={category.description}
                                        onChange={(e) => updateCategory(index, 'description', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        placeholder="Optional description"
                                    />
                                </div>
                                
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={() => removeCategory(index)}
                                        className="text-red-600 hover:text-red-900 p-2"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center text-xl font-bold">
                            <span>Total Amount:</span>
                            <span>Rp {calculateTotal().toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => router.get('/invoices')}
                            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Invoice'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

InvoiceCreate.layout = (page) => <Layout children={page} />;