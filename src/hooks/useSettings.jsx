import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
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
    const [loading, setLoading] = useState(true);

    // Currency symbols mapping
    const currencySymbols = {
        INR: '₹',
        USD: '$',
        EUR: '€',
        GBP: '£'
    };

    // Currency locales mapping
    const currencyLocales = {
        INR: 'en-IN',
        USD: 'en-US',
        EUR: 'de-DE',
        GBP: 'en-GB'
    };

    // Load settings from backend
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await axios.get('http://localhost:5000/settings');
                setSettings(response.data);
            } catch (error) {
                console.error('Failed to load settings:', error);
                // Try to load from localStorage as fallback
                const savedSettings = localStorage.getItem('billTrackerSettings');
                if (savedSettings) {
                    try {
                        setSettings(JSON.parse(savedSettings));
                    } catch (parseError) {
                        console.error('Failed to parse saved settings:', parseError);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    // Save settings to backend
    const updateSettings = async (newSettings) => {
        try {
            const response = await axios.put('http://localhost:5000/settings', newSettings);
            setSettings(response.data);
            // Also save to localStorage as backup
            localStorage.setItem('billTrackerSettings', JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            console.error('Failed to save settings to backend:', error);
            // Save to localStorage as fallback
            setSettings(newSettings);
            localStorage.setItem('billTrackerSettings', JSON.stringify(newSettings));
            return newSettings;
        }
    };

    // Format currency based on user settings
    const formatCurrency = (amount) => {
        const locale = currencyLocales[settings.currency] || 'en-US';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: settings.currency
        }).format(amount || 0);
    };

    // Format date based on user settings
    const formatDate = (date) => {
        if (!date) return 'No date';

        const dateObj = new Date(date);

        switch (settings.dateFormat) {
            case 'MM/DD/YYYY':
                return dateObj.toLocaleDateString('en-US');
            case 'YYYY-MM-DD':
                return dateObj.toISOString().split('T')[0];
            case 'DD/MM/YYYY':
            default:
                return dateObj.toLocaleDateString('en-GB');
        }
    };

    // Get currency symbol
    const getCurrencySymbol = () => {
        return currencySymbols[settings.currency] || '$';
    };

    const value = {
        settings,
        updateSettings,
        formatCurrency,
        formatDate,
        getCurrencySymbol,
        loading
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};