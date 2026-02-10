const express = require('express');
const router = express.Router();
const {
    handleusersignup,
    handleuserlogin,
    updateUserProfile,
    getUserProfile,
    changePassword,
    getActiveSessions,
    terminateSession,
    allusers,
    toggleuserstatus,
    assignUserToManager,
    getManagerUsers,
    toggleTwoFactor
} = require('../controllers/userauth');
const { restrictto, verifytoken } = require('../middleware/auth.middleware');
const { adminOnly, adminOrManager, managerOnly, allRoles, canCreateUser } = require('../middleware/rbac.middleware');
const { ensureOrganizationContext } = require('../middleware/organization.middleware');

// Public routes
router.post('/', handleusersignup); // Initial signup
router.post('/login', handleuserlogin);

// Protected routes - require authentication and organization context
router.use(verifytoken);
router.use(ensureOrganizationContext);

// User management
router.get('/all', adminOrManager, allusers); // Admins see all, managers see assigned users
router.post('/create', canCreateUser, handleusersignup); // Create new user with role validation

// Manager-user assignment (admin only)
router.post('/assign-manager', adminOnly, assignUserToManager);
router.get('/manager-users', adminOrManager, getManagerUsers);
router.get('/manager-users/:managerId', adminOnly, getManagerUsers);

// Profile management
router.get('/profile', allRoles, getUserProfile);
router.put('/profile', allRoles, updateUserProfile);
router.put('/change-password', allRoles, changePassword);
router.put('/toggle-2fa', allRoles, toggleTwoFactor);

// User status management (admin only)
router.put('/:id/toggle-status', adminOnly, toggleuserstatus);

// Session management
router.get('/sessions', adminOrManager, getActiveSessions);
router.delete('/sessions/:id', adminOnly, terminateSession);
router.delete('/sessions/all', adminOnly, terminateSession);

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;