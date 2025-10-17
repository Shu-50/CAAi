import { useState, useRef } from 'react';
import axios from 'axios';

const ModernUpload = ({ setBills }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bill, setBill] = useState(null);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            setLoading(true);
            setError(null);
            setBill(null);

            const res = await axios.post('http://localhost:5000/extract', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setBill(res.data.extractedData);
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to extract data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await axios.post('http://localhost:5000/bills', bill);
            setBills((prev) => [...prev, res.data]);
            setBill(null);
            setFile(null);
            setError(null);

            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            successDiv.textContent = '✅ Bill saved successfully!';
            document.body.appendChild(successDiv);
            setTimeout(() => document.body.removeChild(successDiv), 3000);
        } catch (err) {
            console.error('Save error:', err);
            setError('Failed to save bill to database.');
        }
    };

    const updateBillField = (field, value) => {
        setBill({ ...bill, [field]: value });
    };

    const updateItemField = (index, field, value) => {
        const updatedItems = [...bill.items];
        updatedItems[index][field] = value;
        setBill({ ...bill, items: updatedItems });
    };

    const removeItem = (index) => {
        const updatedItems = bill.items.filter((_, i) => i !== index);
        setBill({ ...bill, items: updatedItems });
    };

    const addNewItem = () => {
        const newItem = {
            name: '',
            qty: 1,
            price: 0,
            gst: 0,
            cgst: 0,
            sgst: 0,
            category: 'others'
        };
        setBill({ ...bill, items: [...bill.items, newItem] });
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-theme-primary">Upload Bills</h1>
                <p className="text-theme-secondary mt-1">Upload your receipts and let AI extract the data automatically.</p>
            </div>

            {/* Upload Area */}
            <div className="bg-theme-secondary p-6 rounded-xl border border-theme-primary">
                <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {file ? (
                        <div className="space-y-4">
                            <div className="w-16 h-16 mx-auto bg-green-600 rounded-full flex items-center justify-center">
                                <span className="text-2xl">✓</span>
                            </div>
                            <div>
                                <p className="text-theme-primary font-medium">{file.name}</p>
                                <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                >
                                    Change File
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                                >
                                    {loading ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        'Extract Data'
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📄</span>
                            </div>
                            <div>
                                <p className="text-theme-primary font-medium">Drop your bill here</p>
                                <p className="text-gray-400 text-sm">or click to browse files</p>
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Choose File
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-600/20 border border-red-600 rounded-lg">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}
            </div>

            {/* Extracted Data Preview */}
            {bill && (
                <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d] animate-fadeIn">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-theme-primary">Review & Edit</h2>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setBill(null)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                                Save Bill
                            </button>
                        </div>
                    </div>

                    {/* Bill Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Vendor</label>
                            <input
                                type="text"
                                value={bill.vendor || ''}
                                onChange={(e) => updateBillField('vendor', e.target.value)}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter vendor name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Date</label>
                            <input
                                type="date"
                                value={(() => {
                                    if (!bill.date) return '';
                                    let date = bill.date;
                                    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
                                        const [day, month, year] = date.split('/');
                                        date = `${year}-${month}-${day}`;
                                    }
                                    const isoDate = new Date(date);
                                    if (isNaN(isoDate)) return '';
                                    return isoDate.toISOString().split('T')[0];
                                })()}
                                onChange={(e) => updateBillField('date', e.target.value)}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">Total Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                value={bill.total || ''}
                                onChange={(e) => updateBillField('total', parseFloat(e.target.value))}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-theme-primary">Items</h3>
                            <button
                                onClick={addNewItem}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                            >
                                + Add Item
                            </button>
                        </div>

                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-600">
                                    <th className="text-left p-3 text-gray-300 font-medium">Item Name</th>
                                    <th className="text-center p-3 text-gray-300 font-medium">Qty</th>
                                    <th className="text-right p-3 text-gray-300 font-medium">Price</th>
                                    <th className="text-center p-3 text-gray-300 font-medium">GST%</th>
                                    <th className="text-center p-3 text-gray-300 font-medium">CGST%</th>
                                    <th className="text-center p-3 text-gray-300 font-medium">SGST%</th>
                                    <th className="text-left p-3 text-gray-300 font-medium">Category</th>
                                    <th className="text-center p-3 text-gray-300 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bill.items?.map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-700">
                                        <td className="p-3">
                                            <input
                                                type="text"
                                                value={item.name || ''}
                                                onChange={(e) => updateItemField(idx, 'name', e.target.value)}
                                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-1 focus:ring-blue-500"
                                                placeholder="Item name"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                value={item.qty || ''}
                                                onChange={(e) => updateItemField(idx, 'qty', parseInt(e.target.value))}
                                                className="w-16 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm text-center focus:ring-1 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.price || ''}
                                                onChange={(e) => updateItemField(idx, 'price', parseFloat(e.target.value))}
                                                className="w-20 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm text-right focus:ring-1 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.gst || ''}
                                                onChange={(e) => updateItemField(idx, 'gst', parseFloat(e.target.value))}
                                                className="w-16 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm text-center focus:ring-1 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.cgst || ''}
                                                onChange={(e) => updateItemField(idx, 'cgst', parseFloat(e.target.value))}
                                                className="w-16 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm text-center focus:ring-1 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.sgst || ''}
                                                onChange={(e) => updateItemField(idx, 'sgst', parseFloat(e.target.value))}
                                                className="w-16 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm text-center focus:ring-1 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <select
                                                value={item.category || 'others'}
                                                onChange={(e) => updateItemField(idx, 'category', e.target.value)}
                                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="clothes">Clothes</option>
                                                <option value="utensils">Utensils</option>
                                                <option value="tools">Tools</option>
                                                <option value="electronics">Electronics</option>
                                                <option value="makeup">Makeup</option>
                                                <option value="food">Food</option>
                                                <option value="personal care">Personal Care</option>
                                                <option value="others">Others</option>
                                            </select>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => removeItem(idx)}
                                                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModernUpload;