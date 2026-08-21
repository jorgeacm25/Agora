export const Permissions = {
  USER_CREATE: 'user:create',
  USER_UPDATE_PASSWORD: 'user:update_password',
  USER_DELETE: 'user:delete',
  USER_VIEW: 'user:view',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',
  PRODUCT_VIEW: 'product:view',
  SERVICE_CREATE: 'service:create',
  SERVICE_UPDATE: 'service:update',
  SERVICE_DELETE: 'service:delete',
  SERVICE_VIEW: 'service:view',
  RATING_CREATE: 'rating:create',
  RATING_VIEW: 'rating:view',
  RATING_UPDATE: 'rating:update',
  RATING_DELETE: 'rating:delete',
} as const;

export function hasPermission(permissions: string[] | undefined, permission: string): boolean {
  return Boolean(permissions?.includes(permission));
}

export function isSeller(permissions: string[] | undefined): boolean {
  return hasPermission(permissions, Permissions.PRODUCT_CREATE) || hasPermission(permissions, Permissions.SERVICE_CREATE);
}
