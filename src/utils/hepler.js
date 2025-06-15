// helpers/PermissionHelper.js
// A tiny utility you can import anywhere in the front-end

class Helper {
  /**
   * Safely pulls the permissions object from localStorage.
   * @returns {Object} e.g. { viewProjects: true, editClients: false, … }
   */
  static _getPermissions() {
    try {
      const userJson = JSON.parse(localStorage.getItem('user'));
      
      if (!userJson) return {};
      return userJson.permissions;
    } catch {
      // JSON parse failed or user object malformed
      return {};
    }
  }

  /**
   * Check whether the logged-in user has a given permission flag.
   * @param {string} permName  - the exact camelCase key, e.g. "viewProjects"
   * @returns {boolean}       - true if the flag is truthy (1 / true)
   */
  static checkPermission(permName) {
    const perms = Helper._getPermissions();
    return !!perms[permName];
  }
}

export default Helper;
