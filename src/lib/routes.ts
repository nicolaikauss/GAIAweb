/**
 * Type-safe route constants for the application.
 * Use these constants instead of hardcoded strings to ensure consistency and catch typos at compile time.
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  AUTH: '/auth',
  
  // Protected routes
  DASHBOARD: '/dashboard',
  INVENTORY: '/inventory',
  INVENTORY_ADD: '/inventory/add',
  INVENTORY_DETAILS: (id: string) => `/inventory/${id}`,
  TRANSACTIONS: '/transactions',
  CONSIGNMENTS: '/consignments',
  REPORTS: '/reports',
  
  // Payment routes
  SUCCESS: '/success',
  CANCEL: '/cancel',
} as const;

/**
 * Helper to build dynamic routes
 */
export const buildRoute = {
  inventoryDetails: (id: string) => `/inventory/${id}`,
} as const;

/**
 * Route labels for navigation menus
 */
export const ROUTE_LABELS: Record<string, string> = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.INVENTORY]: 'Inventory',
  [ROUTES.TRANSACTIONS]: 'Transactions',
  [ROUTES.CONSIGNMENTS]: 'Consignments',
  [ROUTES.REPORTS]: 'Reports',
} as const;
