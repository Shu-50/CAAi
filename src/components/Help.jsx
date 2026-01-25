import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts.jsx';
import { API_ENDPOINTS } from '../config/api';

const Help = () => {
    const { shortcuts } = useKeyboardShortcuts(() => { });

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-theme-primary">Help & Support</h1>
                <p className="text-theme-secondary mt-1">Get help with using BillTracker</p>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
                <h3 className="text-xl font-semibold text-[#f0f6fc] mb-6">⌨️ Keyboard Shortcuts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shortcuts.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#0d1117] rounded-lg">
                            <span className="text-[#8b949e]">{shortcut.action}</span>
                            <kbd className="px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-[#f0f6fc] text-sm font-mono">
                                {shortcut.key}
                            </kbd>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Start Guide */}
            <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
                <h3 className="text-xl font-semibold text-[#f0f6fc] mb-6">🚀 Quick Start Guide</h3>
                <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                        <div>
                            <h4 className="text-[#f0f6fc] font-medium">Upload Your First Bill</h4>
                            <p className="text-[#8b949e] text-sm">Go to Upload Bills and drag & drop a receipt image. Our AI will extract all the data automatically.</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                        <div>
                            <h4 className="text-[#f0f6fc] font-medium">Set Up Your Budget</h4>
                            <p className="text-[#8b949e] text-sm">Create budgets for different categories in Budget Manager to track your spending limits.</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                        <div>
                            <h4 className="text-[#f0f6fc] font-medium">Analyze Your Spending</h4>
                            <p className="text-[#8b949e] text-sm">Use Analytics to see spending patterns and get insights into your financial habits.</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                        <div>
                            <h4 className="text-[#f0f6fc] font-medium">Get Financial Advice</h4>
                            <p className="text-[#8b949e] text-sm">Chat with our CA Assistant for personalized financial advice and spending recommendations.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Overview */}
            <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
                <h3 className="text-xl font-semibold text-[#f0f6fc] mb-6">✨ Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-[#0d1117] rounded-lg">
                        <div className="text-2xl mb-2">🤖</div>
                        <h4 className="text-[#f0f6fc] font-medium mb-1">AI Bill Extraction</h4>
                        <p className="text-[#8b949e] text-sm">Automatically extract data from receipt images using advanced AI.</p>
                    </div>

                    <div className="p-4 bg-[#0d1117] rounded-lg">
                        <div className="text-2xl mb-2">💰</div>
                        <h4 className="text-[#f0f6fc] font-medium mb-1">Budget Tracking</h4>
                        <p className="text-[#8b949e] text-sm">Set budgets and track spending with visual progress indicators.</p>
                    </div>

                    <div className="p-4 bg-[#0d1117] rounded-lg">
                        <div className="text-2xl mb-2">📊</div>
                        <h4 className="text-[#f0f6fc] font-medium mb-1">Analytics</h4>
                        <p className="text-[#8b949e] text-sm">Detailed insights into spending patterns and trends.</p>
                    </div>

                    <div className="p-4 bg-[#0d1117] rounded-lg">
                        <div className="text-2xl mb-2">💬</div>
                        <h4 className="text-[#f0f6fc] font-medium mb-1">CA Assistant</h4>
                        <p className="text-[#8b949e] text-sm">AI-powered financial advisor for personalized advice.</p>
                    </div>

                    <div className="p-4 bg-[#0d1117] rounded-lg">
                        <div className="text-2xl mb-2">📤</div>
                        <h4 className="text-[#f0f6fc] font-medium mb-1">Data Export</h4>
                        <p className="text-[#8b949e] text-sm">Export your data in JSON or CSV format for backup.</p>
                    </div>

                    <div className="p-4 bg-[#0d1117] rounded-lg">
                        <div className="text-2xl mb-2">🔄</div>
                        <h4 className="text-[#f0f6fc] font-medium mb-1">Bulk Operations</h4>
                        <p className="text-[#8b949e] text-sm">Manage multiple bills at once with bulk operations.</p>
                    </div>
                </div>
            </div>

            {/* Support */}
            <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
                <h3 className="text-xl font-semibold text-[#f0f6fc] mb-6">🆘 Need More Help?</h3>
                <div className="space-y-4">
                    <p className="text-[#8b949e]">
                        If you need additional support or have questions about BillTracker, here are some resources:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-[#0d1117] rounded-lg">
                            <h4 className="text-[#f0f6fc] font-medium mb-2">📚 Documentation</h4>
                            <p className="text-[#8b949e] text-sm">Check out our comprehensive documentation for detailed guides.</p>
                        </div>

                        <div className="p-4 bg-[#0d1117] rounded-lg">
                            <h4 className="text-[#f0f6fc] font-medium mb-2">💬 Community</h4>
                            <p className="text-[#8b949e] text-sm">Join our community forum to get help from other users.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Help;
