import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import axios from 'axios';
import { useSettings } from '../hooks/useSettings.jsx';

const Analytics = () => {
    const { formatCurrency, formatDate } = useSettings();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('all');

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const response = await axios.get(API_ENDPOINTS.BILLS);
            setBills(response.data);
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setLoading(false);
        }
    };



    const filterBillsByTimeRange = (bills) => {
        if (timeRange === 'all') return bills;

        const now = new Date();
        const startDate = new Date();

        switch (timeRange) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                return bills;
        }

        return bills.filter(bill => {
            if (!bill.date) return false;
            return new Date(bill.date) >= startDate;
        });
    };

    const filteredBills = filterBillsByTimeRange(bills);

    // Calculate analytics
    const totalSpent = filteredBills.reduce((sum, bill) => sum + (bill.total || 0), 0);
    const averageBillAmount = filteredBills.length > 0 ? totalSpent / filteredBills.length : 0;

    // Category breakdown
    const categoryData = {};
    filteredBills.forEach(bill => {
        bill.items?.forEach(item => {
            const category = item.category || 'others';
            categoryData[category] = (categoryData[category] || 0) + (item.price || 0);
        });
    });

    // Monthly spending trend
    const monthlyData = {};
    filteredBills.forEach(bill => {
        if (!bill.date) return;
        const monthKey = new Date(bill.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (bill.total || 0);
    });

    // Top vendors
    const vendorData = {};
    filteredBills.forEach(bill => {
        const vendor = bill.vendor || 'Unknown';
        vendorData[vendor] = (vendorData[vendor] || 0) + (bill.total || 0);
    });

    // Most expensive categories
    const sortedCategories = Object.entries(categoryData)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    // Top spending vendors
    const sortedVendors = Object.entries(vendorData)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    // Recent months spending
    const sortedMonths = Object.entries(monthlyData)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .slice(-6);

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
                    <h1 className="text-3xl font-bold text-theme-primary">Analytics</h1>
                    <p className="text-theme-secondary mt-1">Detailed insights into your spending patterns</p>
                </div>
                <div>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Time</option>
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="quarter">Last Quarter</option>
                        <option value="year">Last Year</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Total Spent</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(totalSpent)}</p>
                        </div>
                        <div className="text-3xl opacity-80">💰</div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Total Bills</p>
                            <p className="text-2xl font-bold mt-1">{filteredBills.length}</p>
                        </div>
                        <div className="text-3xl opacity-80">📄</div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Average Bill</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(averageBillAmount)}</p>
                        </div>
                        <div className="text-3xl opacity-80">📊</div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Categories</p>
                            <p className="text-2xl font-bold mt-1">{Object.keys(categoryData).length}</p>
                        </div>
                        <div className="text-3xl opacity-80">🏷️</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
                    <h3 className="text-xl font-semibold text-[#f0f6fc] mb-6">Spending by Category</h3>
                    <div className="space-y-4">
                        {sortedCategories.map(([category, amount]) => {
                            const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                            return (
                                <div key={category} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300 capitalize font-medium">{category}</span>
                                        <span className="text-white font-semibold">{formatCurrency(amount)}</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-gray-400 text-sm">{percentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Vendors */}
                <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
                    <h3 className="text-xl font-semibold text-[#f0f6fc] mb-6">Top Vendors</h3>
                    <div className="space-y-4">
                        {sortedVendors.map(([vendor, amount], index) => (
                            <div key={vendor} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <span className="text-gray-300 font-medium">{vendor}</span>
                                </div>
                                <span className="text-white font-semibold">{formatCurrency(amount)}</span>
                            </div>
                        ))}
                        {sortedVendors.length === 0 && (
                            <p className="text-gray-400 text-center py-8">No vendor data available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
                <h3 className="text-xl font-semibold text-[#f0f6fc] mb-6">Monthly Spending Trend</h3>
                {sortedMonths.length > 0 ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            {sortedMonths.map(([month, amount]) => {
                                const maxAmount = Math.max(...sortedMonths.map(([, amt]) => amt));
                                const height = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

                                return (
                                    <div key={month} className="text-center">
                                        <div className="h-32 flex items-end justify-center mb-2">
                                            <div
                                                className="w-12 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-500"
                                                style={{ height: `${height}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-gray-300 text-sm font-medium">{month}</p>
                                        <p className="text-white text-xs">{formatCurrency(amount)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-8">No monthly data available</p>
                )}
            </div>

            {/* Insights */}
            <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
                <h3 className="text-xl font-semibold text-[#f0f6fc] mb-6">💡 Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg">
                            <h4 className="text-blue-400 font-medium mb-2">Highest Spending Category</h4>
                            <p className="text-white">
                                {sortedCategories[0] ? (
                                    <>
                                        <span className="capitalize font-semibold">{sortedCategories[0][0]}</span> - {formatCurrency(sortedCategories[0][1])}
                                    </>
                                ) : (
                                    'No data available'
                                )}
                            </p>
                        </div>

                        <div className="p-4 bg-green-600/20 border border-green-600/30 rounded-lg">
                            <h4 className="text-green-400 font-medium mb-2">Most Frequent Vendor</h4>
                            <p className="text-white">
                                {sortedVendors[0] ? (
                                    <>
                                        <span className="font-semibold">{sortedVendors[0][0]}</span> - {formatCurrency(sortedVendors[0][1])}
                                    </>
                                ) : (
                                    'No data available'
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-purple-600/20 border border-purple-600/30 rounded-lg">
                            <h4 className="text-purple-400 font-medium mb-2">Average Monthly Spending</h4>
                            <p className="text-white font-semibold">
                                {sortedMonths.length > 0
                                    ? formatCurrency(sortedMonths.reduce((sum, [, amount]) => sum + amount, 0) / sortedMonths.length)
                                    : formatCurrency(0)
                                }
                            </p>
                        </div>

                        <div className="p-4 bg-orange-600/20 border border-orange-600/30 rounded-lg">
                            <h4 className="text-orange-400 font-medium mb-2">Total Items Purchased</h4>
                            <p className="text-white font-semibold">
                                {filteredBills.reduce((sum, bill) => sum + (bill.items?.length || 0), 0)} items
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
