// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Export commonly used endpoints
export const API_ENDPOINTS = {
  // Bills
  EXTRACT: `${API_URL}/extract`,
  BILLS: `${API_URL}/bills`,
  BILL_DELETE: (id) => `${API_URL}/bills/${id}`,
  BILL_UPDATE: (id) => `${API_URL}/bills/${id}`,
  
  // Items
  ITEM_DELETE: (id) => `${API_URL}/items/${id}`,
  
  // Analytics
  ANALYTICS: `${API_URL}/analytics`,
  ANALYTICS_BUDGET_COMPARISON: `${API_URL}/analytics/budget-comparison`,
  
  // Chat
  CHAT: `${API_URL}/chat`,
  
  // Budgets
  BUDGETS: `${API_URL}/budgets`,
  BUDGET_DELETE: (id) => `${API_URL}/budgets/${id}`,
  BUDGET_CHECK_ALERTS: `${API_URL}/budgets/check-alerts`,
  
  // Notifications
  NOTIFICATIONS: `${API_URL}/notifications`,
  NOTIFICATION_READ: (id) => `${API_URL}/notifications/${id}/read`,
  NOTIFICATION_UNREAD_COUNT: `${API_URL}/notifications/unread-count`,
  
  // Settings
  SETTINGS: `${API_URL}/settings`,
  
  // Dev endpoints
  DEV_RESET_SEQUENCES: `${API_URL}/dev/reset-sequences`,
  DEV_COMPACT_IDS: `${API_URL}/dev/compact-ids`,
  
  // Bulk operations
  BULK_DELETE: `${API_URL}/bills/bulk-delete`,
  BULK_UPDATE: `${API_URL}/bills/bulk-update`,
  
  // Export
  EXPORT_BILLS: `${API_URL}/export/bills`,
};
