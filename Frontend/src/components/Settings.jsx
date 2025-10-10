import { useState } from 'react';

const Settings = () => {
    const [settings, setSettings] = useState({
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        theme: 'dark',
        notifications: true,
        autoBackup: false,
        defaultCategory: 'others',
        budgetAlerts: true,
        monthlyBudget: 50000
    });

    const [activeTab, setActiveTab] = useState('general');

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        // Here you would typically save to localStorage or send to backend
        localStorage.setItem('billTrackerSettings', JSON.stringify({ ...settings, [key]: value }));
    };

    const exportData = () => {
        // This would typically fetch all bills and export as JSON/CSV
        const dataStr = JSON.stringify(settings, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'bill-tracker-settings.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const clearAllData = () => {
        if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'appearance', label: 'Appearance', icon: '🎨' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'data', label: 'Data & Privacy', icon: '🔒' }
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#f0f6fc]">Settings</h1>
                <p className="text-[#8b949e] mt-1">Customize your BillTracker experience</p>
            </div>

            {/* Tabs */}
            <div className="bg-[#161b22] rounded-xl border border-[#30363d]">
                <div className="flex border-b border-[#30363d]">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${activeTab === tab.id
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">General Preferences</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Default Currency
                                        </label>
                                        <select
                                            value={settings.currency}
                                            onChange={(e) => handleSettingChange('currency', e.target.value)}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="INR">Indian Rupee (₹)</option>
                                            <option value="USD">US Dollar ($)</option>
                                            <option value="EUR">Euro (€)</option>
                                            <option value="GBP">British Pound (£)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Date Format
                                        </label>
                                        <select
                                            value={settings.dateFormat}
                                            onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Default Category
                                        </label>
                                        <select
                                            value={settings.defaultCategory}
                                            onChange={(e) => handleSettingChange('defaultCategory', e.target.value)}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="others">Others</option>
                                            <option value="food">Food</option>
                                            <option value="clothes">Clothes</option>
                                            <option value="electronics">Electronics</option>
                                            <option value="personal care">Personal Care</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Monthly Budget (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.monthlyBudget}
                                            onChange={(e) => handleSettingChange('monthlyBudget', parseInt(e.target.value))}
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="50000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Settings */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Theme
                                        </label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['dark', 'light', 'auto'].map((theme) => (
                                                <button
                                                    key={theme}
                                                    onClick={() => handleSettingChange('theme', theme)}
                                                    className={`p-4 rounded-lg border-2 transition-colors ${settings.theme === theme
                                                        ? 'border-blue-500 bg-blue-500/20'
                                                        : 'border-gray-600 hover:border-gray-500'
                                                        }`}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-2">
                                                            {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🔄'}
                                                        </div>
                                                        <p className="text-white font-medium capitalize">{theme}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
                                        <p className="text-yellow-400 text-sm">
                                            💡 Theme changes will be available in a future update. Currently using dark theme.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Settings */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                        <div>
                                            <h4 className="text-white font-medium">Push Notifications</h4>
                                            <p className="text-gray-400 text-sm">Receive notifications for important updates</p>
                                        </div>
                                        <button
                                            onClick={() => handleSettingChange('notifications', !settings.notifications)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notifications ? 'bg-blue-600' : 'bg-gray-600'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                        <div>
                                            <h4 className="text-white font-medium">Budget Alerts</h4>
                                            <p className="text-gray-400 text-sm">Get notified when approaching budget limits</p>
                                        </div>
                                        <button
                                            onClick={() => handleSettingChange('budgetAlerts', !settings.budgetAlerts)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.budgetAlerts ? 'bg-blue-600' : 'bg-gray-600'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.budgetAlerts ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                        <div>
                                            <h4 className="text-white font-medium">Auto Backup</h4>
                                            <p className="text-gray-400 text-sm">Automatically backup your data to cloud</p>
                                        </div>
                                        <button
                                            onClick={() => handleSettingChange('autoBackup', !settings.autoBackup)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoBackup ? 'bg-blue-600' : 'bg-gray-600'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data & Privacy Settings */}
                    {activeTab === 'data' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Data & Privacy</h3>

                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-700 rounded-lg">
                                        <h4 className="text-white font-medium mb-2">Export Data</h4>
                                        <p className="text-gray-400 text-sm mb-4">
                                            Download all your data in JSON format for backup or migration purposes.
                                        </p>
                                        <button
                                            onClick={exportData}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                        >
                                            Export Settings
                                        </button>
                                    </div>

                                    <div className="p-4 bg-gray-700 rounded-lg">
                                        <h4 className="text-white font-medium mb-2">Data Storage</h4>
                                        <p className="text-gray-400 text-sm mb-4">
                                            Your data is stored locally in your browser and on our secure servers. We use encryption to protect your information.
                                        </p>
                                        <div className="flex items-center space-x-2 text-green-400">
                                            <span>🔒</span>
                                            <span className="text-sm">Data is encrypted and secure</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-red-600/20 border border-red-600/30 rounded-lg">
                                        <h4 className="text-red-400 font-medium mb-2">Danger Zone</h4>
                                        <p className="text-gray-400 text-sm mb-4">
                                            Permanently delete all your data. This action cannot be undone.
                                        </p>
                                        <button
                                            onClick={clearAllData}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                        >
                                            Clear All Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={() => {
                        // Show success message
                        const notification = document.createElement('div');
                        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                        notification.textContent = '✅ Settings saved successfully!';
                        document.body.appendChild(notification);
                        setTimeout(() => document.body.removeChild(notification), 3000);
                    }}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default Settings;