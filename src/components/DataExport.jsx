import { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const DataExport = () => {
    const [loading, setLoading] = useState(false);
    const [exportOptions, setExportOptions] = useState({
        format: 'json',
        startDate: '',
        endDate: '',
        includeItems: true
    });

    const exportData = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            if (exportOptions.format) params.append('format', exportOptions.format);
            if (exportOptions.startDate) params.append('startDate', exportOptions.startDate);
            if (exportOptions.endDate) params.append('endDate', exportOptions.endDate);

            const response = await axios.get(`http://localhost:5000/export/bills?${params}`, {
                responseType: exportOptions.format === 'csv' ? 'blob' : 'json'
            });

            if (exportOptions.format === 'csv') {
                // Handle CSV download
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `bills-export-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                // Handle JSON download
                const dataStr = JSON.stringify(response.data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `bills-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }

            showNotification('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            showNotification('Failed to export data', 'error');
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

    return (
        <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
            <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Export Data</h3>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#8b949e] mb-2">Format</label>
                        <select
                            value={exportOptions.format}
                            onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value })}
                            className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="json">JSON</option>
                            <option value="csv">CSV</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#8b949e] mb-2">Date Range</label>
                        <div className="flex space-x-2">
                            <input
                                type="date"
                                value={exportOptions.startDate}
                                onChange={(e) => setExportOptions({ ...exportOptions, startDate: e.target.value })}
                                className="flex-1 p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Start Date"
                            />
                            <input
                                type="date"
                                value={exportOptions.endDate}
                                onChange={(e) => setExportOptions({ ...exportOptions, endDate: e.target.value })}
                                className="flex-1 p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="End Date"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={exportData}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                    {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Exporting...</span>
                        </div>
                    ) : (
                        `Export as ${exportOptions.format.toUpperCase()}`
                    )}
                </button>
            </div>
        </div>
    );
};

export default DataExport;
