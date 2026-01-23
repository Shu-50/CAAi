import { useEffect } from 'react';

export const useKeyboardShortcuts = (setActiveTab) => {
    useEffect(() => {
        const handleKeyPress = (event) => {
            // Only trigger if no input is focused
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
                return;
            }

            // Check for Ctrl/Cmd key combinations
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case '1':
                        event.preventDefault();
                        setActiveTab('dashboard');
                        break;
                    case '2':
                        event.preventDefault();
                        setActiveTab('upload');
                        break;
                    case '3':
                        event.preventDefault();
                        setActiveTab('bills');
                        break;
                    case '4':
                        event.preventDefault();
                        setActiveTab('budget');
                        break;
                    case '5':
                        event.preventDefault();
                        setActiveTab('analytics');
                        break;
                    case '6':
                        event.preventDefault();
                        setActiveTab('chatbot');
                        break;
                    case ',':
                        event.preventDefault();
                        setActiveTab('settings');
                        break;
                    case 'k':
                        event.preventDefault();
                        // Focus search if available
                        const searchInput = document.querySelector('input[placeholder*="Search"]');
                        if (searchInput) {
                            searchInput.focus();
                        }
                        break;
                    default:
                        break;
                }
            }

            // ESC key to close modals
            if (event.key === 'Escape') {
                const modals = document.querySelectorAll('[role="dialog"], .modal, .fixed.inset-0');
                modals.forEach(modal => {
                    if (modal.style.display !== 'none') {
                        modal.style.display = 'none';
                    }
                });
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [setActiveTab]);

    // Return keyboard shortcuts info for help display
    return {
        shortcuts: [
            { key: 'Ctrl+1', action: 'Go to Dashboard' },
            { key: 'Ctrl+2', action: 'Go to Upload Bills' },
            { key: 'Ctrl+3', action: 'Go to All Bills' },
            { key: 'Ctrl+4', action: 'Go to Budget Manager' },
            { key: 'Ctrl+5', action: 'Go to Analytics' },
            { key: 'Ctrl+6', action: 'Go to CA Assistant' },
            { key: 'Ctrl+,', action: 'Go to Settings' },
            { key: 'Ctrl+K', action: 'Focus Search' },
            { key: 'Esc', action: 'Close Modals' }
        ]
    };
};