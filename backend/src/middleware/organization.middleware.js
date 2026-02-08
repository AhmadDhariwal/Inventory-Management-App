const User = require('../models/user');

/**
 * Middleware to ensure organization context exists in request
 * Should be applied after authentication middleware
 */
const ensureOrganizationContext = async (req, res, next) => {
    try {
        if (!req.user || !req.user.userid) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Fetch user with organization details
        const user = await User.findById(req.user.userid)
            .select('organizationId role managerId assignedUsers')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.organizationId) {
            return res.status(403).json({
                success: false,
                message: 'User not associated with any organization'
            });
        }

        // Attach organization context to request
        req.organizationId = user.organizationId;
        req.userRole = user.role;
        req.managerId = user.managerId;
        req.assignedUsers = user.assignedUsers || [];

        next();
    } catch (error) {
        console.error('Organization context error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating organization context'
        });
    }
};

/**
 * Middleware to validate that a resource belongs to user's organization
 * Use this when accessing resources by ID
 */
const validateOrganizationAccess = (Model) => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params.id;

            if (!resourceId) {
                return next(); // No ID to validate, continue
            }

            const resource = await Model.findById(resourceId).select('organizationId').lean();

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }

            // Check if resource belongs to user's organization
            if (resource.organizationId.toString() !== req.organizationId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Resource belongs to different organization'
                });
            }

            next();
        } catch (error) {
            console.error('Organization access validation error:', error);
            res.status(500).json({
                success: false,
                message: 'Error validating resource access'
            });
        }
    };
};

/**
 * Middleware to validate manager can access user's data
 * Managers can only access data from their assigned users
 */
const validateManagerAccess = async (req, res, next) => {
    try {
        // Admins have full access
        if (req.userRole === 'admin') {
            return next();
        }

        // Managers can only access their assigned users' data
        if (req.userRole === 'manager') {
            const targetUserId = req.params.userId || req.body.userId || req.query.userId;

            if (targetUserId) {
                // Check if target user is assigned to this manager
                const isAssigned = req.assignedUsers.some(
                    userId => userId.toString() === targetUserId.toString()
                );

                if (!isAssigned && targetUserId !== req.user.userid) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied. User not assigned to this manager'
                    });
                }
            }
        }

        next();
    } catch (error) {
        console.error('Manager access validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating manager access'
        });
    }
};

/**
 * Middleware to validate resource ownership
 * Users can only access their own resources
 */
const validateOwnership = (Model, ownerField = 'user') => {
    return async (req, res, next) => {
        try {
            // Admins have full access
            if (req.userRole === 'admin') {
                return next();
            }

            const resourceId = req.params.id;

            if (!resourceId) {
                return next(); // No ID to validate, continue
            }

            const resource = await Model.findById(resourceId)
                .select(`${ownerField} organizationId`)
                .lean();

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }

            // First check organization
            if (resource.organizationId.toString() !== req.organizationId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Resource belongs to different organization'
                });
            }

            // For managers, check if resource owner is assigned to them
            if (req.userRole === 'manager') {
                const resourceOwnerId = resource[ownerField].toString();
                const isAssigned = req.assignedUsers.some(
                    userId => userId.toString() === resourceOwnerId
                );

                if (!isAssigned && resourceOwnerId !== req.user.userid) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied. Resource not owned by assigned user'
                    });
                }
            }

            // For users, check if they own the resource
            if (req.userRole === 'user') {
                const resourceOwnerId = resource[ownerField].toString();

                if (resourceOwnerId !== req.user.userid) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied. You can only access your own resources'
                    });
                }
            }

            next();
        } catch (error) {
            console.error('Ownership validation error:', error);
            res.status(500).json({
                success: false,
                message: 'Error validating resource ownership'
            });
        }
    };
};

/**
 * Get accessible user IDs based on role
 * Returns array of user IDs that the current user can access data for
 */
const getAccessibleUserIds = (req) => {
    if (req.userRole === 'admin') {
        return null; // Null means all users in organization
    }

    if (req.userRole === 'manager') {
        // Manager can access their assigned users + themselves
        return [...req.assignedUsers, req.user.userid];
    }

    // Users can only access their own data
    return [req.user.userid];
};

module.exports = {
    ensureOrganizationContext,
    validateOrganizationAccess,
    validateManagerAccess,
    validateOwnership,
    getAccessibleUserIds
};
