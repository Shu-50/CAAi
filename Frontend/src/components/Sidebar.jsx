import { useState } from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'upload', label: 'Upload Bills', icon: '📄' },
        { id: 'bills', label: 'All Bills', icon: '📋' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
        { id: 'chatbot', label: 'CA Assistant', icon: '🤖' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-[#010409] border-r border-[#30363d] flex flex-col transition-all duration-300`}>
            {/* Header */}
            <div className="p-4 border-b border-[#30363d]">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">B</span>
                            </div>
                            <span className="text-white font-semibold text-lg">BillTracker</span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="text-[#8b949e] hover:text-[#f0f6fc] p-1 rounded-lg hover:bg-[#21262d]"
                    >
                        {isCollapsed ? '→' : '←'}
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${activeTab === item.id
                                    ? 'bg-[#1f6feb] text-[#f0f6fc]'
                                    : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]'
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {!isCollapsed && <span className="font-medium">{item.label}</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-[#30363d]">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">U</span>
                    </div>
                    {!isCollapsed && (
                        <div>
                            <p className="text-[#f0f6fc] font-medium text-sm">User</p>
                            <p className="text-[#8b949e] text-xs">Free Plan</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;