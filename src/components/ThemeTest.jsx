import { useSettings } from '../hooks/useSettings.jsx';
import { API_ENDPOINTS } from '../config/api';

const ThemeTest = () => {
    const { settings, updateSettings } = useSettings();

    const toggleTheme = () => {
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        updateSettings({ ...settings, theme: newTheme });
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={toggleTheme}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors"
            >
                {settings.theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
        </div>
    );
};

export default ThemeTest;
