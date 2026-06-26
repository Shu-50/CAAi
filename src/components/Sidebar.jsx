import { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

const Sidebar = ({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'upload', label: 'Upload Bills', icon: '📄' },
        { id: 'bills', label: 'All Bills', icon: '📋' },
        { id: 'budget', label: 'Budget Manager', icon: '💰' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
        { id: 'chatbot', label: 'CA Assistant', icon: '🤖' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
        { id: 'help', label: 'Help', icon: '❓' },
        { id: 'database', label: 'Database', icon: '🗄️' }, // Development tool
    ];

    return (
        <>
            {/* Backdrop for mobile */}
            {mobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setMobileOpen(false)}
                />
            )}
            
            <div className={`
                ${isCollapsed ? 'w-16' : 'w-64'} 
                bg-theme-primary border-r border-theme-primary flex flex-col transition-all duration-300
                fixed inset-y-0 left-0 z-50 md:static
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Header */}
                <div className="p-4 border-b border-theme-primary">
                    <div className="flex items-center justify-between">
                        {!isCollapsed && (
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">B</span>
                                </div>
                                <span className="text-theme-primary font-semibold text-lg">BillTracker</span>
                            </div>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="text-theme-secondary hover:text-theme-primary p-1 rounded-lg hover:bg-theme-hover hidden md:block"
                        >
                            {isCollapsed ? '→' : '←'}
                        </button>
                        {/* Close button for mobile */}
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="text-theme-secondary hover:text-theme-primary p-1 rounded-lg hover:bg-theme-hover md:hidden"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        if (setMobileOpen) setMobileOpen(false);
                                    }}
                                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${activeTab === item.id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-hover'
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {(!isCollapsed || mobileOpen) && <span className="font-medium">{item.label}</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-theme-primary">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">U</span>
                        </div>
                        {(!isCollapsed || mobileOpen) && (
                            <div>
                                <p className="text-theme-primary font-medium text-sm">User</p>
                                <p className="text-theme-secondary text-xs">Free Plan</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
