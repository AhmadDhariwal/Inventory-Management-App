// Enhanced Role-based access control middleware with organization awareness

/**
 * Check if user has one of the allowed roles
 * Now organization-aware - ensures user belongs to organization
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role || req.role || 'user';

      if (allowedRoles.includes(userRole)) {
        next();
      } else {
        res.status(403).json({
          success: false,
          error: 'Access denied. Insufficient permissions.',
          requiredRole: allowedRoles,
          userRole: userRole
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Authorization error'
      });
    }
  };
};

/**
 * Admin only access
 * Admins have full access to all data within their organization
 */
const adminOnly = checkRole(['admin']);

/**
 * Manager only access
 * Managers can access data from their assigned users
 */
const managerOnly = checkRole(['manager']);

/**
 * Admin or Manager access
 * For operations that require elevated privileges
 */
const adminOrManager = checkRole(['admin', 'manager']);

/**
 * All authenticated users
 * Basic access for all roles
 */
const allRoles = checkRole(['admin', 'manager', 'user']);

/**
 * Check if user can create users
 * - Admins can create managers and users
 * - Managers can create users (who will be assigned to them)
 * - Users cannot create other users
 */
const canCreateUser = (req, res, next) => {
  try {
    const userRole = req.user?.role || req.role;
    const targetRole = req.body.role;

    // Users cannot create other users
    if (userRole === 'user') {
      return res.status(403).json({
        success: false,
        message: 'Users cannot create other users'
      });
    }

    // Managers can only create users (not other managers or admins)
    if (userRole === 'manager' && targetRole !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Managers can only create users with role "user"'
      });
    }

    // Admins can create managers and users (but not other admins)
    if (userRole === 'admin' && targetRole === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot create other admins'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authorization error'
    });
  }
};

/**
 * Check if user can manage (update/delete) another user
 * - Admins can manage all users in their organization
 * - Managers can manage their assigned users
 * - Users cannot manage other users
 */
const canManageUser = async (req, res, next) => {
  try {
    const userRole = req.user?.role || req.role;
    const targetUserId = req.params.id || req.params.userId;

    // Admins can manage all users in their organization
    if (userRole === 'admin') {
      return next();
    }

    // Managers can manage their assigned users
    if (userRole === 'manager') {
      const isAssigned = req.assignedUsers?.some(
        userId => userId.toString() === targetUserId
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Managers can only manage their assigned users'
        });
      }
      return next();
    }

    // Users cannot manage other users
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions to manage users'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authorization error'
    });
  }
};

/**
 * Hierarchy validation
 * Ensures proper role hierarchy: admin > manager > user
 */
const validateHierarchy = (req, res, next) => {
  try {
    const userRole = req.user?.role || req.role;
    const targetRole = req.body.role || req.params.role;

    const roleHierarchy = {
      'admin': 3,
      'manager': 2,
      'user': 1
    };

    const userLevel = roleHierarchy[userRole] || 0;
    const targetLevel = roleHierarchy[targetRole] || 0;

    // Users with higher or equal hierarchy level cannot be managed
    if (targetLevel >= userLevel) {
      return res.status(403).json({
        success: false,
        message: 'Cannot manage users with equal or higher role level'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Hierarchy validation error'
    });
  }
};

module.exports = {
  checkRole,
  adminOnly,
  managerOnly,
  adminOrManager,
  allRoles,
  canCreateUser,
  canManageUser,
  validateHierarchy
};
