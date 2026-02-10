const BusinessSettings = require('../models/businesssettings');
const User = require('../models/user');

/**
 * Middleware to enforce organization-wide security settings
 */
const enforceSecurityPolicies = async (req, res, next) => {
    try {
        if (!req.organizationId) {
            return next();
        }

        // Fetch security settings for the organization
        const settings = await BusinessSettings.findOne({ organizationId: req.organizationId })
            .select('securitySettings')
            .lean();

        if (!settings || !settings.securitySettings) {
            return next();
        }

        const { twoFactorEnforced } = settings.securitySettings;

        // 1. Enforce 2FA if enabled globally
        if (twoFactorEnforced) {
            const user = await User.findById(req.userid).select('isTwoFactorEnabled').lean();

            // If 2FA is enforced but not enabled for this user, block them
            // BUT allow access to security-related routes so they can enable it
            const isSecurityRoute = req.originalUrl.includes('/api/settings/2fa') ||
                req.originalUrl.includes('/api/auth/logout') ||
                req.originalUrl.includes('/api/business-settings'); // Allow settings access to see enforcement

            if (user && !user.isTwoFactorEnabled && !isSecurityRoute) {
                return res.status(403).json({
                    success: false,
                    code: '2FA_REQUIRED',
                    message: 'Organization-wide secondary authentication is enforced. Please enable 2FA in your account settings.'
                });
            }
        }

        next();
    } catch (error) {
        console.error('Security enforcement error:', error);
        next(); // Fallback to allow request if check fails to avoid total lockout
    }
};

module.exports = { enforceSecurityPolicies };
