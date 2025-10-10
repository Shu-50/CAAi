import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ModernUpload from "./components/ModernUpload";
import ModernBillTable from "./components/ModernBillTable";
import Analytics from "./components/Analytics";
import Chatbot from "./components/Chatbot";
import Settings from "./components/Settings";

function App() {
  const [bills, setBills] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // fetch existing bills from backend
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await fetch("http://localhost:5000/bills");
        if (!res.ok) throw new Error("Failed to fetch bills");
        const data = await res.json();
        setBills(data);
      } catch (err) {
        console.error("Error fetching bills:", err);
      }
    };
    fetchBills();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'upload':
        return <ModernUpload setBills={setBills} />;
      case 'bills':
        return <ModernBillTable bills={bills} setBills={setBills} />;
      case 'analytics':
        return <Analytics />;
      case 'chatbot':
        return <Chatbot />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] flex">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-[#161b22] border-b border-[#30363d] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-white capitalize">
                {activeTab === 'chatbot' ? 'CA Assistant' : activeTab}
              </h2>
              <div className="hidden md:flex items-center space-x-2 text-sm text-[#8b949e]">
                <span>•</span>
                <span>{new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-[#8b949e]">All systems operational</span>
              </div>

              <button className="p-2 text-[#8b949e] hover:text-[#f0f6fc] transition-colors">
                <span className="text-lg">🔔</span>
              </button>

              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
