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

// Predefined role checks
const adminOnly = checkRole(['admin']);
const adminOrUser = checkRole(['admin', 'user']);

module.exports = {
  checkRole,
  adminOnly,
  adminOrUser
};