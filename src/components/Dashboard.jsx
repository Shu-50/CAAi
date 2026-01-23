import { useState, useEffect } from "react";
import axios from "axios";
import { useSettings } from "../hooks/useSettings.jsx";

const QuickActionButton = ({ icon, title, description, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 p-4 bg-${color}-600 hover:bg-${color}-700 rounded-lg text-white transition-colors`}
  >
    <span className="text-2xl">{icon}</span>
    <div className="text-left">
      <p className="font-medium">{title}</p>
      <p className="text-sm opacity-90">{description}</p>
    </div>
  </button>
);

const Dashboard = () => {
  const { formatCurrency, formatDate } = useSettings();
  const [stats, setStats] = useState({
    totalBills: 0,
    totalAmount: 0,
    thisMonth: 0,
    categories: {},
  });
  const [recentBills, setRecentBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Listen for navigation events from quick actions
  useEffect(() => {
    const handleNavigate = (event) => {
      // This will be handled by the parent App component
      window.parent?.postMessage({ type: "navigate", tab: event.detail }, "*");
    };

    window.addEventListener("navigate", handleNavigate);
    return () => window.removeEventListener("navigate", handleNavigate);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/bills");
      const bills = response.data;

      // Calculate stats
      const totalBills = bills.length;
      const totalAmount = bills.reduce(
        (sum, bill) => sum + (bill.total || 0),
        0,
      );

      // This month's spending
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonth = bills
        .filter((bill) => {
          if (!bill.date) return false;
          const billDate = new Date(bill.date);
          return (
            billDate.getMonth() === currentMonth &&
            billDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, bill) => sum + (bill.total || 0), 0);

      // Category breakdown
      const categories = {};
      bills.forEach((bill) => {
        bill.items?.forEach((item) => {
          const category = item.category || "others";
          categories[category] =
            (categories[category] || 0) + (item.price || 0);
        });
      });

      setStats({ totalBills, totalAmount, thisMonth, categories });
      setRecentBills(bills.slice(-5).reverse());

      // Check for budget alerts
      try {
        await axios.post("http://localhost:5000/budgets/check-alerts");
      } catch (err) {
        console.log("Budget check skipped:", err.message);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = "blue" }) => (
    <div
      className={`bg-gradient-to-r from-${color}-500 to-${color}-600 p-6 rounded-xl text-white animate-fadeIn`}
    >
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
          <h1 className="text-3xl font-bold text-theme-primary">Dashboard</h1>
          <p className="text-theme-secondary mt-1">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-theme-secondary">Last updated</p>
          <p className="text-theme-primary font-medium">
            {new Date().toLocaleDateString()}
          </p>
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
        <div className="bg-theme-secondary p-6 rounded-xl border border-theme-primary">
          <h3 className="text-xl font-semibold text-theme-primary mb-4">
            Category Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.categories)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([category, amount]) => {
                const percentage = (amount / stats.totalAmount) * 100;
                return (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-300 capitalize">
                        {category}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[#f0f6fc] font-medium">
                        {formatCurrency(amount)}
                      </p>
                      <p className="text-[#8b949e] text-sm">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recent Bills */}
        <div className="bg-theme-secondary p-6 rounded-xl border border-theme-primary">
          <h3 className="text-xl font-semibold text-theme-primary mb-4">
            Recent Bills
          </h3>
          <div className="space-y-3">
            {recentBills.length > 0 ? (
              recentBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">
                      {bill.vendor || "Unknown Vendor"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {bill.date
                        ? new Date(bill.date).toLocaleDateString()
                        : "No date"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {formatCurrency(bill.total)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {bill.items?.length || 0} items
                    </p>
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
      <div className="bg-theme-secondary p-6 rounded-xl border border-theme-primary">
        <h3 className="text-xl font-semibold text-theme-primary mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionButton
            icon="📄"
            title="Upload New Bill"
            description="Scan and extract data"
            color="blue"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("navigate", { detail: "upload" }),
              )
            }
          />
          <QuickActionButton
            icon="📊"
            title="View Analytics"
            description="Detailed insights"
            color="green"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("navigate", { detail: "analytics" }),
              )
            }
          />
          <QuickActionButton
            icon="🤖"
            title="Ask CA Assistant"
            description="Get financial advice"
            color="purple"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("navigate", { detail: "chatbot" }),
              )
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
