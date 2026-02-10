const BusinessSettings = require('../models/businesssettings');

/**
 * Middleware to check for maintenance mode.
 * Blocks all non-admin requests if maintenanceMode is enabled in business settings.
 */
const checkMaintenanceMode = async (req, res, next) => {
    try {
        // We only check for protected routes that have organizationId
        // Public routes (like login) or routes for super-admins should be reachable

        // Get organizationId from req (set by previous middleware)
        const organizationId = req.organizationId || (req.user && req.user.organizationId);

        if (!organizationId) {
            return next();
        }

        const settings = await BusinessSettings.findOne({ organizationId });

        if (settings && settings.maintenanceMode) {
            // Allow admins to bypass maintenance mode
            if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
                return next();
            }

            return res.status(503).json({
                success: false,
                error: "System under maintenance",
                message: "The system is currently undergoing maintenance. Please try again later."
            });
        }

        next();
    } catch (error) {
        console.error('Maintenance middleware error:', error);
        next(); // Proceed if we can't check settings
    }
};

module.exports = { checkMaintenanceMode };
