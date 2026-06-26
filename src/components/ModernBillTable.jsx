import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import axios from 'axios';
import { useSettings } from '../hooks/useSettings.jsx';
import BulkOperations from './BulkOperations';

const ModernBillTable = ({ bills, setBills }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterCategory, setFilterCategory] = useState('all');
    const [expandedBill, setExpandedBill] = useState(null);
    const [editingBill, setEditingBill] = useState(null);
    const [editData, setEditData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedBills, setSelectedBills] = useState([]);
    const [showBulkOps, setShowBulkOps] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [amountRange, setAmountRange] = useState({ min: '', max: '' });

    const { formatCurrency, formatDate } = useSettings();
    const categories = ['all', 'clothes', 'utensils', 'tools', 'electronics', 'makeup', 'food', 'personal care', 'others'];

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_ENDPOINTS.BILLS);
            setBills(response.data);
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAndSortedBills = bills
        .filter(bill => {
            const matchesSearch = bill.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bill.items?.some(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory = filterCategory === 'all' ||
                bill.items?.some(item => item.category === filterCategory);

            const matchesDateRange = (!dateRange.start || new Date(bill.date) >= new Date(dateRange.start)) &&
                (!dateRange.end || new Date(bill.date) <= new Date(dateRange.end));

            const matchesAmountRange = (!amountRange.min || bill.total >= parseFloat(amountRange.min)) &&
                (!amountRange.max || bill.total <= parseFloat(amountRange.max));

            return matchesSearch && matchesCategory && matchesDateRange && matchesAmountRange;
        })
        .sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'vendor':
                    aValue = a.vendor || '';
                    bValue = b.vendor || '';
                    break;
                case 'total':
                    aValue = a.total || 0;
                    bValue = b.total || 0;
                    break;
                case 'date':
                default:
                    aValue = new Date(a.date || 0);
                    bValue = new Date(b.date || 0);
                    break;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const handleEdit = (bill) => {
        setEditingBill(bill.id);
        setEditData({ ...bill });
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(API_ENDPOINTS.BILL_UPDATE(editData.id), editData);
            setBills(bills.map(b => b.id === editData.id ? response.data : b));
            setEditingBill(null);
            setEditData(null);

            // Show success message
            showNotification('Bill updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating bill:', error);
            showNotification('Failed to update bill', 'error');
        }
    };

    const handleDelete = async (billId) => {
        if (!window.confirm('Are you sure you want to delete this bill?')) return;

        try {
            await axios.delete(API_ENDPOINTS.BILL_UPDATE(billId));
            setBills(bills.filter(b => b.id !== billId));
            showNotification('Bill deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting bill:', error);
            showNotification('Failed to delete bill', 'error');
        }
    };

    const showNotification = (message, type) => {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 3000);
    };

    const updateBillField = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const updateItemField = (itemId, field, value) => {
        setEditData(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === itemId ? { ...item, [field]: value } : item
            )
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-theme-primary">All Bills</h1>
                    <p className="text-theme-secondary mt-1 text-sm">Manage and view all your saved bills</p>
                </div>
                <div className="text-right">
                    <p className="text-xl md:text-2xl font-bold text-white">{bills.length}</p>
                    <p className="text-gray-400 text-xs md:text-sm">Total Bills</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">Search</label>
                        <input
                            type="text"
                            placeholder="Search bills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">Category</label>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="date">Date</option>
                            <option value="vendor">Vendor</option>
                            <option value="total">Amount</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">Order</label>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                {filteredAndSortedBills.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">📄</span>
                        </div>
                        <p className="text-gray-400 text-lg">No bills found</p>
                        <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="text-left p-4 text-gray-300 font-medium">Vendor</th>
                                    <th className="text-left p-4 text-gray-300 font-medium">Date</th>
                                    <th className="text-right p-4 text-gray-300 font-medium">Amount</th>
                                    <th className="text-center p-4 text-gray-300 font-medium">Items</th>
                                    <th className="text-center p-4 text-gray-300 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedBills.map((bill) => (
                                    <tr key={bill.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                                        <td className="p-4">
                                            {editingBill === bill.id ? (
                                                <input
                                                    type="text"
                                                    value={editData.vendor || ''}
                                                    onChange={(e) => updateBillField('vendor', e.target.value)}
                                                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-1 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <div>
                                                    <p className="text-white font-medium">{bill.vendor || 'Unknown Vendor'}</p>
                                                    <p className="text-gray-400 text-sm">ID: {bill.id}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {editingBill === bill.id ? (
                                                <input
                                                    type="date"
                                                    value={editData.date?.split('T')[0] || ''}
                                                    onChange={(e) => updateBillField('date', e.target.value)}
                                                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-1 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <p className="text-gray-300">{formatDate(bill.date)}</p>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {editingBill === bill.id ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editData.total || 0}
                                                    onChange={(e) => updateBillField('total', parseFloat(e.target.value))}
                                                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm text-right focus:ring-1 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <p className="text-white font-medium">{formatCurrency(bill.total)}</p>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <span className="text-gray-300">{bill.items?.length || 0}</span>
                                                <button
                                                    onClick={() => setExpandedBill(expandedBill === bill.id ? null : bill.id)}
                                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    {expandedBill === bill.id ? '▼' : '▶'}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                {editingBill === bill.id ? (
                                                    <>
                                                        <button
                                                            onClick={handleSave}
                                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingBill(null);
                                                                setEditData(null);
                                                            }}
                                                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(bill)}
                                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(bill.id)}
                                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                                                        >
                                                            Delete
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
                )}
            </div>

            {/* Desktop Expanded Items View */}
            {expandedBill && (
                <div className="hidden md:block bg-gray-900 p-6 rounded-xl border border-gray-700">
                    <h4 className="text-white font-medium mb-4">Items Details for Bill: {expandedBill}</h4>
                    {bills.find(b => b.id === expandedBill)?.items?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-600">
                                        <th className="text-left p-2 text-gray-400">Item</th>
                                        <th className="text-center p-2 text-gray-400">Qty</th>
                                        <th className="text-right p-2 text-gray-400">Price</th>
                                        <th className="text-center p-2 text-gray-400">GST</th>
                                        <th className="text-center p-2 text-gray-400">CGST</th>
                                        <th className="text-center p-2 text-gray-400">SGST</th>
                                        <th className="text-left p-2 text-gray-400">Category</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(editingBill === expandedBill ? editData.items : bills.find(b => b.id === expandedBill).items).map((item) => (
                                        <tr key={item.id} className="border-b border-gray-700">
                                            <td className="p-2">
                                                {editingBill === expandedBill ? (
                                                    <input
                                                        type="text"
                                                        value={item.name || ''}
                                                        onChange={(e) => updateItemField(item.id, 'name', e.target.value)}
                                                        className="w-full p-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:ring-1 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <span className="text-gray-300">{item.name || 'Unnamed Item'}</span>
                                                )}
                                            </td>
                                            <td className="p-2 text-center">
                                                {editingBill === expandedBill ? (
                                                    <input
                                                        type="number"
                                                        value={item.qty || 0}
                                                        onChange={(e) => updateItemField(item.id, 'qty', parseInt(e.target.value))}
                                                        className="w-16 p-1 bg-gray-700 border border-gray-600 rounded text-white text-xs text-center focus:ring-1 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <span className="text-gray-300">{item.qty || 0}</span>
                                                )}
                                            </td>
                                            <td className="p-2 text-right">
                                                {editingBill === expandedBill ? (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.price || 0}
                                                        onChange={(e) => updateItemField(item.id, 'price', parseFloat(e.target.value))}
                                                        className="w-20 p-1 bg-gray-700 border border-gray-600 rounded text-white text-xs text-right focus:ring-1 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <span className="text-gray-300">{formatCurrency(item.price)}</span>
                                                )}
                                            </td>
                                            <td className="p-2 text-center">
                                                <span className="text-gray-300">{item.gst || 0}%</span>
                                            </td>
                                            <td className="p-2 text-center">
                                                <span className="text-gray-300">{item.cgst || 0}%</span>
                                            </td>
                                            <td className="p-2 text-center">
                                                <span className="text-gray-300">{item.sgst || 0}%</span>
                                            </td>
                                            <td className="p-2">
                                                {editingBill === expandedBill ? (
                                                    <select
                                                        value={item.category || 'others'}
                                                        onChange={(e) => updateItemField(item.id, 'category', e.target.value)}
                                                        className="w-full p-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:ring-1 focus:ring-blue-500"
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
                                                ) : (
                                                    <span className="inline-block px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs capitalize">
                                                        {item.category || 'others'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-4">No items found</p>
                    )}
                </div>
            )}

            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-4">
                {filteredAndSortedBills.length === 0 ? (
                    <div className="bg-gray-800 p-8 text-center rounded-xl border border-gray-700">
                        <div className="w-12 h-12 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-3 animate-pulse">
                            <span className="text-xl">📄</span>
                        </div>
                        <p className="text-gray-400 text-base">No bills found</p>
                        <p className="text-gray-500 text-xs mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    filteredAndSortedBills.map((bill) => (
                        <div key={bill.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-4">
                            {editingBill === bill.id ? (
                                // Mobile Edit Mode
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Vendor</label>
                                        <input
                                            type="text"
                                            value={editData.vendor || ''}
                                            onChange={(e) => updateBillField('vendor', e.target.value)}
                                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
                                            <input
                                                type="date"
                                                value={editData.date?.split('T')[0] || ''}
                                                onChange={(e) => updateBillField('date', e.target.value)}
                                                className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Amount</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editData.total || 0}
                                                onChange={(e) => updateBillField('total', parseFloat(e.target.value))}
                                                className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded text-white text-sm text-right font-medium text-green-400"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 pt-2">
                                        <button
                                            onClick={handleSave}
                                            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingBill(null);
                                                setEditData(null);
                                            }}
                                            className="flex-1 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-semibold transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Mobile Read Mode
                                <>
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0 flex-1 pr-2">
                                            <h3 className="text-white font-semibold text-base truncate">{bill.vendor || 'Unknown Vendor'}</h3>
                                            <p className="text-gray-400 text-xs mt-0.5">{formatDate(bill.date)}</p>
                                            <p className="text-gray-500 text-[10px]">ID: {bill.id}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-green-400 font-bold text-base">{formatCurrency(bill.total)}</p>
                                            <span className="inline-block bg-gray-700 text-gray-300 text-[10px] px-2 py-0.5 rounded-full mt-1">
                                                {bill.items?.length || 0} item{bill.items?.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                                        <button
                                            onClick={() => setExpandedBill(expandedBill === bill.id ? null : bill.id)}
                                            className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center space-x-1 py-1"
                                        >
                                            <span>{expandedBill === bill.id ? 'Hide Details' : 'Show Details'}</span>
                                            <span>{expandedBill === bill.id ? '▲' : '▼'}</span>
                                        </button>
                                        
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(bill)}
                                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bill.id)}
                                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Mobile Expanded Items */}
                            {expandedBill === bill.id && (
                                <div className="mt-3 p-3 bg-gray-900 rounded-lg border border-gray-700 space-y-3">
                                    <h4 className="text-white font-medium text-xs border-b border-gray-700 pb-1.5">Items Details</h4>
                                    {bill.items?.length > 0 ? (
                                        <div className="space-y-3">
                                            {(editingBill === bill.id ? editData.items : bill.items).map((item, index) => (
                                                <div key={item.id || index} className="text-xs space-y-2 pb-2.5 border-b border-gray-800 last:border-b-0 last:pb-0">
                                                    {editingBill === bill.id ? (
                                                        <div className="space-y-2">
                                                            <div>
                                                                <label className="text-[10px] text-gray-400 font-medium">Item Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={item.name || ''}
                                                                    onChange={(e) => updateItemField(item.id, 'name', e.target.value)}
                                                                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className="text-[10px] text-gray-400 font-medium">Qty</label>
                                                                    <input
                                                                        type="number"
                                                                        value={item.qty || 0}
                                                                        onChange={(e) => updateItemField(item.id, 'qty', parseInt(e.target.value))}
                                                                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-xs text-center"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] text-gray-400 font-medium">Price</label>
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={item.price || 0}
                                                                        onChange={(e) => updateItemField(item.id, 'price', parseFloat(e.target.value))}
                                                                        className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-xs text-right"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-400 font-medium">Category</label>
                                                                <select
                                                                    value={item.category || 'others'}
                                                                    onChange={(e) => updateItemField(item.id, 'category', e.target.value)}
                                                                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-xs"
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
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex justify-between font-medium">
                                                                <span className="text-gray-200">{item.name || 'Unnamed Item'}</span>
                                                                <span className="text-white">{formatCurrency(item.price)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-gray-400 text-[10px] mt-0.5">
                                                                <span>Qty: {item.qty || 0} | Category: <span className="capitalize">{item.category || 'others'}</span></span>
                                                                <span>GST: {item.gst || 0}%</span>
                                                            </div>
                                                            <div className="text-gray-500 text-[9px] mt-0.5 text-right">
                                                                CGST: {item.cgst || 0}% | SGST: {item.sgst || 0}%
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-2">No items found</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ModernBillTable;
