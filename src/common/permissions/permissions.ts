export abstract class Permissions {
  // Permisos específicos para usuarios
  static readonly USER_CREATE = 'user:create';
  static readonly USER_UPDATE_PASSWORD = 'user:update_password';
  static readonly USER_DELETE = 'user:delete';
  static readonly USER_VIEW = 'user:view';

  static readonly PRODUCT_CREATE = 'product:create';
  static readonly PRODUCT_UPDATE = 'product:update';
  static readonly PRODUCT_DELETE = 'product:delete';
  static readonly PRODUCT_VIEW = 'product:view';

  // Permisos para servicios
  static readonly SERVICE_CREATE = 'service:create';
  static readonly SERVICE_UPDATE = 'service:update';
  static readonly SERVICE_DELETE = 'service:delete';
  static readonly SERVICE_VIEW = 'service:view';

  static readonly RATING_CREATE = 'rating:create';
  static readonly RATING_VIEW = 'rating:view';
  static readonly RATING_UPDATE = 'rating:update';
  static readonly RATING_DELETE = 'rating:delete';
  // Permisos por defecto para cualquier usuario nuevo
  static getDefaultUserPermissions(): string[] {
    return [
      this.USER_CREATE,
      this.USER_UPDATE_PASSWORD,
      this.USER_DELETE,
      this.USER_VIEW,
      this.PRODUCT_VIEW,
      this.SERVICE_VIEW,
    ];
  }
}