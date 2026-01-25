// Find and replace script for updating API URLs
// Run this manually or use your IDE's find-replace feature

/\*
FIND: 'http://localhost:5000
REPLACE WITH: import { API_ENDPOINTS } from '../config/api';

Then replace specific endpoints:

- 'http://localhost:5000/bills' → API_ENDPOINTS.BILLS
- 'http://localhost:5000/chat' → API_ENDPOINTS.CHAT
- 'http://localhost:5000/settings' → API_ENDPOINTS.SETTINGS
- 'http://localhost:5000/notifications/unread-count' → API_ENDPOINTS.NOTIFICATION_UNREAD_COUNT
- etc.
  \*/

// Quick reference for all endpoints:
export const ENDPOINT_MAPPING = {
'/extract': 'API_ENDPOINTS.EXTRACT',
'/bills': 'API_ENDPOINTS.BILLS',
'/bills/${id}': 'API_ENDPOINTS.BILL_UPDATE(id) or API_ENDPOINTS.BILL_DELETE(id)',
  '/items/${id}': 'API_ENDPOINTS.ITEM_DELETE(id)',
'/analytics': 'API_ENDPOINTS.ANALYTICS',
'/analytics/budget-comparison': 'API_ENDPOINTS.ANALYTICS_BUDGET_COMPARISON',
'/chat': 'API_ENDPOINTS.CHAT',
'/budgets': 'API_ENDPOINTS.BUDGETS',
'/budgets/${id}': 'API_ENDPOINTS.BUDGET_DELETE(id)',
  '/budgets/check-alerts': 'API_ENDPOINTS.BUDGET_CHECK_ALERTS',
  '/notifications': 'API_ENDPOINTS.NOTIFICATIONS',
  '/notifications/${id}/read': 'API_ENDPOINTS.NOTIFICATION_READ(id)',
'/notifications/unread-count': 'API_ENDPOINTS.NOTIFICATION_UNREAD_COUNT',
'/settings': 'API_ENDPOINTS.SETTINGS',
'/dev/reset-sequences': 'API_ENDPOINTS.DEV_RESET_SEQUENCES',
'/dev/compact-ids': 'API_ENDPOINTS.DEV_COMPACT_IDS',
'/bills/bulk-delete': 'API_ENDPOINTS.BULK_DELETE',
'/bills/bulk-update': 'API_ENDPOINTS.BULK_UPDATE',
'/export/bills': 'API_ENDPOINTS.EXPORT_BILLS'
};
