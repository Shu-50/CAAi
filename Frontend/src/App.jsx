import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ModernUpload from "./components/ModernUpload";
import ModernBillTable from "./components/ModernBillTable";
import Analytics from "./components/Analytics";
import Chatbot from "./components/Chatbot";
import Settings from "./components/Settings";
import DatabaseManager from "./components/DatabaseManager";
import BudgetManager from "./components/BudgetManager";
import Notifications from "./components/Notifications";
import Help from "./components/Help";
import { SettingsProvider } from "./hooks/useSettings.jsx";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts.jsx";
import { ThemeProvider } from "./components/ThemeProvider.jsx";
import ThemeTest from "./components/ThemeTest.jsx";

function App() {
  const [bills, setBills] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Enable keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts(setActiveTab);

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

    // Listen for navigation events from components
    const handleMessage = (event) => {
      if (event.data?.type === 'navigate') {
        setActiveTab(event.data.tab);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
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
      case 'database':
        return <DatabaseManager />;
      case 'budget':
        return <BudgetManager />;
      case 'notifications':
        return <Notifications />;
      case 'help':
        return <Help />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SettingsProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-theme-primary text-theme-primary flex">
          {/* Sidebar */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Bar */}
            <header className="bg-theme-secondary border-b border-theme-primary px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-theme-primary capitalize">
                    {activeTab === 'chatbot' ? 'CA Assistant' :
                      activeTab === 'database' ? 'Database Manager' :
                        activeTab === 'budget' ? 'Budget Manager' : activeTab}
                  </h2>
                  <div className="hidden md:flex items-center space-x-2 text-sm text-theme-secondary">
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
                    <span className="text-theme-secondary">All systems operational</span>
                  </div>

                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="p-2 text-theme-secondary hover:text-theme-primary transition-colors relative"
                  >
                    <span className="text-lg">🔔</span>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                      3
                    </div>
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

            {/* Theme Toggle for Testing */}
            <ThemeTest />
          </div>
        </div>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App;
