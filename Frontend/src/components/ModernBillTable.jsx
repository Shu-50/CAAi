import { useState, useEffect } from 'react';
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
            const response = await axios.get('http://localhost:5000/bills');
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
            const response = await axios.put(`http://localhost:5000/bills/${editData.id}`, editData);
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
            await axios.delete(`http://localhost:5000/bills/${billId}`);
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
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-theme-primary">All Bills</h1>
                    <p className="text-theme-secondary mt-1">Manage and view all your saved bills</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-white">{bills.length}</p>
                    <p className="text-gray-400 text-sm">Total Bills</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                        <input
                            type="text"
                            placeholder="Search bills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="date">Date</option>
                            <option value="vendor">Vendor</option>
                            <option value="total">Amount</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bills Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
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
                                    <>
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

                                        {/* Expanded Items */}
                                        {expandedBill === bill.id && (
                                            <tr>
                                                <td colSpan={5} className="p-0">
                                                    <div className="bg-gray-900 p-6 border-t border-gray-600">
                                                        <h4 className="text-white font-medium mb-4">Items Details</h4>
                                                        {bill.items?.length > 0 ? (
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
                                                                        {(editingBill === bill.id ? editData.items : bill.items).map((item) => (
                                                                            <tr key={item.id} className="border-b border-gray-700">
                                                                                <td className="p-2">
                                                                                    {editingBill === bill.id ? (
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
                                                                                    {editingBill === bill.id ? (
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
                                                                                    {editingBill === bill.id ? (
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
                                                                                    {editingBill === bill.id ? (
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
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModernBillTable;