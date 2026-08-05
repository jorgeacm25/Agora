export abstract class Permissions {
  // Permisos específicos para usuarios
  static readonly USER_CREATE = 'user:create';
  static readonly USER_UPDATE_PASSWORD = 'user:update_password';
  static readonly USER_DELETE = 'user:delete';
  static readonly USER_VIEW = 'user:view';

  // Permisos por defecto para cualquier usuario nuevo
  static getDefaultUserPermissions(): string[] {
    return [
      this.USER_CREATE,
      this.USER_UPDATE_PASSWORD,
      this.USER_DELETE,
      this.USER_VIEW,
    ];
  }
}