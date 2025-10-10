import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalBills: 0,
        totalAmount: 0,
        thisMonth: 0,
        categories: {}
    });
    const [recentBills, setRecentBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/bills');
            const bills = response.data;

            // Calculate stats
            const totalBills = bills.length;
            const totalAmount = bills.reduce((sum, bill) => sum + (bill.total || 0), 0);

            // This month's spending
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const thisMonth = bills
                .filter(bill => {
                    if (!bill.date) return false;
                    const billDate = new Date(bill.date);
                    return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
                })
                .reduce((sum, bill) => sum + (bill.total || 0), 0);

            // Category breakdown
            const categories = {};
            bills.forEach(bill => {
                bill.items?.forEach(item => {
                    const category = item.category || 'others';
                    categories[category] = (categories[category] || 0) + (item.price || 0);
                });
            });

            setStats({ totalBills, totalAmount, thisMonth, categories });
            setRecentBills(bills.slice(-5).reverse());
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const StatCard = ({ title, value, icon, color = 'blue' }) => (
        <div className={`bg-gradient-to-r from-${color}-500 to-${color}-600 p-6 rounded-xl text-white animate-fadeIn`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm opacity-90">{title}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
                <div className="text-3xl opacity-80">{icon}</div>
            </div>
        </div>
    );

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
                    <h1 className="text-3xl font-bold text-[#f0f6fc]">Dashboard</h1>
                    <p className="text-[#8b949e] mt-1">Welcome back! Here's your financial overview.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-[#8b949e]">Last updated</p>
                    <p className="text-[#f0f6fc] font-medium">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Bills"
                    value={stats.totalBills}
                    icon="📄"
                    color="blue"
                />
                <StatCard
                    title="Total Spent"
                    value={formatCurrency(stats.totalAmount)}
                    icon="💰"
                    color="green"
                />
                <StatCard
                    title="This Month"
                    value={formatCurrency(stats.thisMonth)}
                    icon="📅"
                    color="purple"
                />
                <StatCard
                    title="Categories"
                    value={Object.keys(stats.categories).length}
                    icon="🏷️"
                    color="orange"
                />
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
                    <h3 className="text-xl font-semibold text-[#f0f6fc] mb-4">Category Breakdown</h3>
                    <div className="space-y-3">
                        {Object.entries(stats.categories)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 6)
                            .map(([category, amount]) => {
                                const percentage = (amount / stats.totalAmount) * 100;
                                return (
                                    <div key={category} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span className="text-gray-300 capitalize">{category}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[#f0f6fc] font-medium">{formatCurrency(amount)}</p>
                                            <p className="text-[#8b949e] text-sm">{percentage.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Recent Bills */}
                <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
                    <h3 className="text-xl font-semibold text-[#f0f6fc] mb-4">Recent Bills</h3>
                    <div className="space-y-3">
                        {recentBills.length > 0 ? (
                            recentBills.map((bill) => (
                                <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                    <div>
                                        <p className="text-white font-medium">{bill.vendor || 'Unknown Vendor'}</p>
                                        <p className="text-gray-400 text-sm">
                                            {bill.date ? new Date(bill.date).toLocaleDateString() : 'No date'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-medium">{formatCurrency(bill.total)}</p>
                                        <p className="text-gray-400 text-sm">{bill.items?.length || 0} items</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-center py-8">No bills found</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
                <h3 className="text-xl font-semibold text-[#f0f6fc] mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center space-x-3 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors">
                        <span className="text-2xl">📄</span>
                        <div className="text-left">
                            <p className="font-medium">Upload New Bill</p>
                            <p className="text-sm opacity-90">Scan and extract data</p>
                        </div>
                    </button>
                    <button className="flex items-center space-x-3 p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors">
                        <span className="text-2xl">📊</span>
                        <div className="text-left">
                            <p className="font-medium">View Analytics</p>
                            <p className="text-sm opacity-90">Detailed insights</p>
                        </div>
                    </button>
                    <button className="flex items-center space-x-3 p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors">
                        <span className="text-2xl">🤖</span>
                        <div className="text-left">
                            <p className="font-medium">Ask CA Assistant</p>
                            <p className="text-sm opacity-90">Get financial advice</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;