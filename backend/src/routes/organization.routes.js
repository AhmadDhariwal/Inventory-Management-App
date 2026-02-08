const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization.controller');
const { verifytoken } = require('../middleware/auth.middleware');
const { ensureOrganizationContext } = require('../middleware/organization.middleware');
const { adminOnly } = require('../middleware/rbac.middleware');

// Public route - create organization (for initial setup or self-registration)
router.post('/', organizationController.createOrganization);

// Protected routes - require authentication and organization context
router.use(verifytoken);
router.use(ensureOrganizationContext);

// Get current user's organization
router.get('/current', organizationController.getOrganization);

// Get organization by ID (admins only)
router.get('/:id', adminOnly, organizationController.getOrganization);

// Update organization (admins only)
router.put('/:id', adminOnly, organizationController.updateOrganization);

// Get organization statistics (admins only)
router.get('/current/stats', adminOnly, organizationController.getOrganizationStats);

// List all organizations (super admin only - would need additional role)
// router.get('/', superAdminOnly, organizationController.listOrganizations);

// Deactivate organization (super admin only)
// router.delete('/:id', superAdminOnly, organizationController.deactivateOrganization);

module.exports = router;
