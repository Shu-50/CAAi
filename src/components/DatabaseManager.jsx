import { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import axios from 'axios';

const DatabaseManager = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const resetSequences = async () => {
        if (!window.confirm('Reset ID sequences? This will make the next bill start from the highest current ID + 1.')) {
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(API_ENDPOINTS.DEV_reset-sequences');
            setResult({
                type: 'success',
                message: response.data.message,
                details: `Next Bill ID: ${response.data.nextBillId}, Next Item ID: ${response.data.nextItemId}`
            });
        } catch (error) {
            setResult({
                type: 'error',
                message: 'Failed to reset sequences',
                details: error.response?.data?.error || error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const compactIds = async () => {
        if (!window.confirm('⚠️ DANGER: This will renumber ALL bills with consecutive IDs (1,2,3...). This cannot be undone. Continue?')) {
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(API_ENDPOINTS.DEV_compact-ids');
            setResult({
                type: 'success',
                message: response.data.message,
                details: `Processed ${response.data.billsProcessed} bills`
            });

            // Refresh the page to show updated data
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            setResult({
                type: 'error',
                message: 'Failed to compact IDs',
                details: error.response?.data?.error || error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-theme-primary">Database Manager</h1>
                <p className="text-theme-secondary mt-1">Development tools for managing database IDs and sequences</p>
            </div>

            {/* Warning */}
            <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                    <span className="text-yellow-400 text-xl">⚠️</span>
                    <div>
                        <h3 className="text-yellow-400 font-medium">Development Only</h3>
                        <p className="text-yellow-300 text-sm">These tools are for development/testing only and are disabled in production.</p>
                    </div>
                </div>
            </div>

            {/* Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reset Sequences */}
                <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
                    <h3 className="text-xl font-semibold text-[#f0f6fc] mb-4">Reset ID Sequences</h3>
                    <p className="text-[#8b949e] text-sm mb-4">
                        Reset the auto-increment sequences to continue from the highest existing ID.
                        This won't change existing IDs but will make new records use consecutive numbers.
                    </p>
                    <div className="space-y-3">
                        <div className="text-sm text-[#8b949e]">
                            <p>• Safe operation - doesn't modify existing data</p>
                            <p>• Fixes sequence after manual deletions</p>
                            <p>• Next bill will use highest ID + 1</p>
                        </div>
                        <button
                            onClick={resetSequences}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                        >
                            {loading ? 'Resetting...' : 'Reset Sequences'}
                        </button>
                    </div>
                </div>

                {/* Compact IDs */}
                <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
                    <h3 className="text-xl font-semibold text-[#f0f6fc] mb-4">Compact IDs</h3>
                    <p className="text-[#8b949e] text-sm mb-4">
                        Renumber all bills with consecutive IDs (1, 2, 3, 4...).
                        This will delete and recreate all records with new IDs.
                    </p>
                    <div className="space-y-3">
                        <div className="text-sm text-red-400">
                            <p>⚠️ DESTRUCTIVE: Changes all existing IDs</p>
                            <p>⚠️ Cannot be undone</p>
                            <p>⚠️ Use only for testing/development</p>
                        </div>
                        <button
                            onClick={compactIds}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                        >
                            {loading ? 'Compacting...' : 'Compact All IDs'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Result */}
            {result && (
                <div className={`p-4 rounded-lg border ${result.type === 'success'
                    ? 'bg-green-600/20 border-green-600/30'
                    : 'bg-red-600/20 border-red-600/30'
                    }`}>
                    <div className="flex items-start space-x-2">
                        <span className={`text-xl ${result.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {result.type === 'success' ? '✅' : '❌'}
                        </span>
                        <div>
                            <h4 className={`font-medium ${result.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {result.message}
                            </h4>
                            <p className={`text-sm mt-1 ${result.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                                {result.details}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Information */}
            <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
                <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">About Database IDs</h3>
                <div className="space-y-3 text-sm text-[#8b949e]">
                    <p>
                        <strong className="text-[#f0f6fc]">Why do IDs skip numbers?</strong><br />
                        When you delete a record (like bill ID 3), PostgreSQL doesn't reuse that ID number.
                        This is normal behavior to prevent data conflicts and maintain referential integrity.
                    </p>
                    <p>
                        <strong className="text-[#f0f6fc]">Is this a problem?</strong><br />
                        No, this is expected behavior in production databases. Skipped IDs are completely normal
                        and don't affect functionality.
                    </p>
                    <p>
                        <strong className="text-[#f0f6fc]">When to use these tools?</strong><br />
                        Only use these tools during development/testing if you want consecutive IDs for
                        demonstration purposes. Never use in production with real data.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DatabaseManager;
