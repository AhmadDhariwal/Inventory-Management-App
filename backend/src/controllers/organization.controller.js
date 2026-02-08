const organizationService = require('../services/organization.service');

// Helper wrapper to handle async errors
const asyncHandler = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            console.error('Controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Something went wrong',
                error: error.message
            });
        }
    };
};

// Create organization
const createOrganization = asyncHandler(async (req, res) => {
    await organizationService.createOrganization(req, res);
});

// Get organization details
const getOrganization = asyncHandler(async (req, res) => {
    await organizationService.getOrganization(req, res);
});

// Update organization
const updateOrganization = asyncHandler(async (req, res) => {
    await organizationService.updateOrganization(req, res);
});

// List all organizations (super admin only)
const listOrganizations = asyncHandler(async (req, res) => {
    await organizationService.listOrganizations(req, res);
});

// Deactivate organization
const deactivateOrganization = asyncHandler(async (req, res) => {
    await organizationService.deactivateOrganization(req, res);
});

// Get organization statistics
const getOrganizationStats = asyncHandler(async (req, res) => {
    await organizationService.getOrganizationStats(req, res);
});

module.exports = {
    createOrganization,
    getOrganization,
    updateOrganization,
    listOrganizations,
    deactivateOrganization,
    getOrganizationStats
};
