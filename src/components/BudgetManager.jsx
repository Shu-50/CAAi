import { useState, useEffect } from "react";
import { API_ENDPOINTS } from '../config/api';
import axios from "axios";
import { API_ENDPOINTS } from '../config/api';
import { useSettings } from "../hooks/useSettings.jsx";
import { API_ENDPOINTS } from '../config/api';

const BudgetManager = () => {
  const { formatCurrency, getCurrencySymbol } = useSettings();
  const [budgets, setBudgets] = useState([]);
  const [budgetComparison, setBudgetComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: "food",
    amount: 0,
    period: "monthly",
    startDate: new Date().toISOString().split("T")[0],
  });

  const categories = [
    "food",
    "clothes",
    "electronics",
    "personal care",
    "utensils",
    "tools",
    "makeup",
    "others",
  ];

  useEffect(() => {
    fetchBudgets();
    fetchBudgetComparison();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.BUDGETS);
      setBudgets(response.data);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  };

  const fetchBudgetComparison = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/analytics/budget-comparison",
      );
      setBudgetComparison(response.data);
    } catch (error) {
      console.error("Error fetching budget comparison:", error);
    } finally {
      setLoading(false);
    }
  };

  const createBudget = async () => {
    try {
      // Validate inputs
      if (!newBudget.category || !newBudget.amount || !newBudget.startDate) {
        showNotification(
          "Please fill in category, amount, and start date",
          "error",
        );
        return;
      }

      await axios.post(API_ENDPOINTS.BUDGETS, {
        ...newBudget,
        startDate: new Date(newBudget.startDate),
        endDate:
          newBudget.period === "monthly"
            ? new Date(
                new Date(newBudget.startDate).setMonth(
                  new Date(newBudget.startDate).getMonth() + 1,
                ),
              )
            : new Date(
                new Date(newBudget.startDate).setFullYear(
                  new Date(newBudget.startDate).getFullYear() + 1,
                ),
              ),
      });

      setShowCreateForm(false);
      setNewBudget({
        category: "food",
        amount: 0,
        period: "monthly",
        startDate: new Date().toISOString().split("T")[0],
      });

      fetchBudgets();
      fetchBudgetComparison();

      // Check for budget alerts immediately after creating
      try {
        await axios.post("http://localhost:5000/budgets/check-alerts");
      } catch (err) {
        console.log("Budget check skipped:", err.message);
      }

      showNotification("Budget created successfully!", "success");
    } catch (error) {
      console.error("Error creating budget:", error);
      showNotification("Failed to create budget", "error");
    }
  };

  const deleteBudget = async (budgetId) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;

    try {
      await axios.delete(API_ENDPOINTS.BUDGET_DELETE(budgetId));
      fetchBudgets();
      fetchBudgetComparison();
      showNotification("Budget deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting budget:", error);
      showNotification("Failed to delete budget", "error");
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    } text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "good":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "over":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "good":
        return "✅";
      case "warning":
        return "⚠️";
      case "over":
        return "🚨";
      default:
        return "📊";
    }
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
          <h1 className="text-3xl font-bold text-theme-primary">
            Budget Manager
          </h1>
          <p className="text-theme-secondary mt-1">
            Set budgets and track your spending against them
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          + Create Budget
        </button>
      </div>

      {/* Budget Overview */}
      {budgetComparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
            <h3 className="text-lg font-semibold text-[#f0f6fc] mb-2">
              Total Budget
            </h3>
            <p className="text-3xl font-bold text-blue-400">
              {formatCurrency(budgetComparison.totalBudget)}
            </p>
          </div>
          <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
            <h3 className="text-lg font-semibold text-[#f0f6fc] mb-2">
              Total Spent
            </h3>
            <p className="text-3xl font-bold text-green-400">
              {formatCurrency(budgetComparison.totalSpent)}
            </p>
          </div>
          <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
            <h3 className="text-lg font-semibold text-[#f0f6fc] mb-2">
              Remaining
            </h3>
            <p className="text-3xl font-bold text-purple-400">
              {formatCurrency(
                budgetComparison.totalBudget - budgetComparison.totalSpent,
              )}
            </p>
          </div>
        </div>
      )}

      {/* Budget Comparison */}
      {budgetComparison && budgetComparison.budgetComparison.length > 0 && (
        <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
          <h3 className="text-xl font-semibold text-[#f0f6fc] mb-6">
            Budget vs Actual
          </h3>
          <div className="space-y-4">
            {budgetComparison.budgetComparison.map((budget) => (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {getStatusIcon(budget.status)}
                    </span>
                    <span className="text-[#f0f6fc] font-medium capitalize">
                      {budget.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[#f0f6fc] font-medium">
                      {formatCurrency(budget.spent)} /{" "}
                      {formatCurrency(budget.amount)}
                    </p>
                    <p className={`text-sm ${getStatusColor(budget.status)}`}>
                      {budget.percentage.toFixed(1)}% used
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      budget.status === "over"
                        ? "bg-red-500"
                        : budget.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Budgets */}
      <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
        <h3 className="text-xl font-semibold text-[#f0f6fc] mb-6">
          Active Budgets
        </h3>
        {budgets.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-[#8b949e] text-lg">No budgets created yet</p>
            <p className="text-[#8b949e] text-sm mt-1">
              Create your first budget to start tracking spending
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#30363d]">
                  <th className="text-left p-3 text-[#8b949e] font-medium">
                    Category
                  </th>
                  <th className="text-right p-3 text-[#8b949e] font-medium">
                    Amount
                  </th>
                  <th className="text-center p-3 text-[#8b949e] font-medium">
                    Period
                  </th>
                  <th className="text-center p-3 text-[#8b949e] font-medium">
                    Start Date
                  </th>
                  <th className="text-center p-3 text-[#8b949e] font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((budget) => (
                  <tr key={budget.id} className="border-b border-[#30363d]">
                    <td className="p-3">
                      <span className="text-[#f0f6fc] font-medium capitalize">
                        {budget.category}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-[#f0f6fc] font-medium">
                        {formatCurrency(budget.amount)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm capitalize">
                        {budget.period}
                      </span>
                    </td>
                    <td className="p-3 text-center text-[#8b949e]">
                      {new Date(budget.startDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => deleteBudget(budget.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Budget Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d] w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#f0f6fc] mb-6">
              Create New Budget
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-2">
                  Category
                </label>
                <select
                  value={newBudget.category}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, category: e.target.value })
                  }
                  className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-2">
                  Amount ({getCurrencySymbol()})
                </label>
                <input
                  type="number"
                  value={newBudget.amount}
                  onChange={(e) =>
                    setNewBudget({
                      ...newBudget,
                      amount: parseFloat(e.target.value),
                    })
                  }
                  className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-2">
                  Period
                </label>
                <select
                  value={newBudget.period}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, period: e.target.value })
                  }
                  className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b949e] mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newBudget.startDate}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, startDate: e.target.value })
                  }
                  className="w-full p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#f0f6fc] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createBudget}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create Budget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManager;

