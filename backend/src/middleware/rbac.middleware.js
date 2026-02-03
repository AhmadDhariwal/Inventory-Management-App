// Role-based access control middleware

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role || 'user';
      
      if (allowedRoles.includes(userRole)) {
        next();
      } else {
        res.status(403).json({ 
          error: 'Access denied. Insufficient permissions.',
          requiredRole: allowedRoles,
          userRole: userRole
        });
      }
    } catch (error) {
      res.status(500).json({ error: 'Authorization error' });
    }
  };
};

const adminOnly = checkRole(['admin']);
const managerOnly = checkRole(['manager']);
const adminOrManager = checkRole(['admin', 'manager']);
const allRoles = checkRole(['admin', 'manager', 'user']);

module.exports = {
  checkRole,
  adminOnly,
  managerOnly,
  adminOrManager,
  allRoles
};
