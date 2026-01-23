import { createContext, useContext, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings.jsx';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const { settings } = useSettings();

    useEffect(() => {
        const root = document.documentElement;

        if (settings.theme === 'light') {
            root.classList.remove('dark');
            root.classList.add('light');
        } else if (settings.theme === 'dark') {
            root.classList.remove('light');
            root.classList.add('dark');
        } else {
            // Auto theme - detect system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.remove('light', 'dark');
            root.classList.add(prefersDark ? 'dark' : 'light');
        }

        // Also apply to body for full coverage
        document.body.className = settings.theme === 'light' ? 'light' :
            settings.theme === 'dark' ? 'dark' :
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }, [settings.theme]);

    const value = {
        theme: settings.theme,
        isDark: settings.theme === 'dark' || (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};