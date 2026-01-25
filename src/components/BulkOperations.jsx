import { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const BulkOperations = ({ selectedBills, onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [operation, setOperation] = useState('');
    const [updateData, setUpdateData] = useState({
        vendor: '',
        category: ''
    });

    const categories = [
        'food', 'clothes', 'electronics', 'personal care',
        'utensils', 'tools', 'makeup', 'others'
    ];

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedBills.length} bills? This action cannot be undone.`)) {
            return;
        }

        try {
            setLoading(true);
            await axios.post(API_ENDPOINTS.BULK_DELETE, {
                billIds: selectedBills
            });

            showNotification(`${selectedBills.length} bills deleted successfully!`, 'success');
            onComplete();
        } catch (error) {
            console.error('Bulk delete error:', error);
            showNotification('Failed to delete bills', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkUpdate = async () => {
        const dataToUpdate = {};
        if (updateData.vendor) dataToUpdate.vendor = updateData.vendor;

        if (Object.keys(dataToUpdate).length === 0) {
            showNotification('Please provide data to update', 'error');
            return;
        }

        try {
            setLoading(true);
            await axios.put(API_ENDPOINTS.BULK_UPDATE, {
                billIds: selectedBills,
                updateData: dataToUpdate
            });

            showNotification(`${selectedBills.length} bills updated successfully!`, 'success');
            onComplete();
        } catch (error) {
            console.error('Bulk update error:', error);
            showNotification('Failed to update bills', 'error');
        } finally {
            setLoading(false);
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

    if (selectedBills.length === 0) {
        return (
            <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">📋</span>
                    </div>
                    <p className="text-[#8b949e] text-lg">No bills selected</p>
                    <p className="text-[#8b949e] text-sm mt-1">Select bills to perform bulk operations</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
            <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">
                Bulk Operations ({selectedBills.length} bills selected)
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[#8b949e] mb-2">Operation</label>
                    <select
                        value={operation}
                        onChange={(e) => setOperation(e.target.value)}
                        className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select operation</option>
                        <option value="update">Update Bills</option>
                        <option value="delete">Delete Bills</option>
                    </select>
                </div>

                {operation === 'update' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#8b949e] mb-2">
                                New Vendor (optional)
                            </label>
                            <input
                                type="text"
                                value={updateData.vendor}
                                onChange={(e) => setUpdateData({ ...updateData, vendor: e.target.value })}
                                className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter new vendor name"
                            />
                        </div>

                        <button
                            onClick={handleBulkUpdate}
                            disabled={loading}
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Updating...</span>
                                </div>
                            ) : (
                                `Update ${selectedBills.length} Bills`
                            )}
                        </button>
                    </div>
                )}

                {operation === 'delete' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-red-600/20 border border-red-600/30 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <span className="text-red-400 text-xl">⚠️</span>
                                <div>
                                    <h4 className="text-red-400 font-medium">Danger Zone</h4>
                                    <p className="text-red-300 text-sm">This will permanently delete {selectedBills.length} bills and all their items.</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleBulkDelete}
                            disabled={loading}
                            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Deleting...</span>
                                </div>
                            ) : (
                                `Delete ${selectedBills.length} Bills`
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkOperations;
