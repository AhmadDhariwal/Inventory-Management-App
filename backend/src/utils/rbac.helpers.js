/**
 * RBAC Helper Functions
 * Utility functions for role-based access control and organization filtering
 */

const User = require('../models/user');

/**
 * Build role-based filter for queries
 * @param {String} role - User role (admin, manager, user)
 * @param {String} userId - Current user ID
 * @param {String} organizationId - Organization ID
 * @param {Array} assignedUsers - Array of assigned user IDs (for managers)
 * @param {String} ownerField - Field name for ownership (default: 'createdBy')
 * @returns {Object} - MongoDB query filter
 */
const buildRoleBasedFilter = (role, userId, organizationId, assignedUsers = [], ownerField = 'createdBy') => {
    const filter = { organizationId };

    if (role === 'admin') {
        return filter;
    }

    if (role === 'manager') {
        filter[ownerField] = { $in: [userId, ...assignedUsers] };
        return filter;
    }

    filter[ownerField] = userId;
    return filter;
};

/**
 * Build role-based aggregation pipeline match stage
 * @param {String} role - User role
 * @param {String} userId - Current user ID
 * @param {String} organizationId - Organization ID
 * @param {Array} assignedUsers - Array of assigned user IDs
 * @param {String} ownerField - Field name for ownership
 * @returns {Array} - Array of $match stages
 */
const buildRoleBasedPipeline = (role, userId, organizationId, assignedUsers = [], ownerField = 'createdBy') => {
    const pipeline = [{ $match: { organizationId } }];

    if (role === 'manager') {
        pipeline.push({ $match: { [ownerField]: { $in: [userId, ...assignedUsers] } } });
    } else if (role === 'user') {
        pipeline.push({ $match: { [ownerField]: userId } });
    }

    return pipeline;
};

/**
 * Get assigned users for a manager
 * @param {String} userId - Manager user ID
 * @returns {Promise<Array>} - Array of assigned user IDs
 */
const getAssignedUsers = async (userId) => {
    const user = await User.findById(userId).select('assignedUsers');
    return user?.assignedUsers || [];
};

/**
 * Check if user can access a specific resource
 * @param {Object} user - Current user object with role and organizationId
 * @param {Object} resource - Resource object with organizationId and owner/user field
 * @param {String} ownerField - Field name that contains the owner user ID (default: 'user')
 * @param {Array} assignedUsers - Array of user IDs assigned to manager (if applicable)
 * @returns {Boolean} - True if user can access the resource
 */
const canAccessResource = (user, resource, ownerField = 'user', assignedUsers = []) => {
    if (resource.organizationId.toString() !== user.organizationId.toString()) {
        return false;
    }

    if (user.role === 'admin') {
        return true;
    }

    const resourceOwnerId = resource[ownerField]?.toString();

    if (user.role === 'manager') {
        const isAssigned = assignedUsers.some(
            userId => userId.toString() === resourceOwnerId
        );
        return isAssigned || resourceOwnerId === user.userid.toString();
    }

    return resourceOwnerId === user.userid.toString();
};

/**
 * Get array of user IDs that current user can access data for
 * @param {Object} user - Current user object with role and userid
 * @param {Array} assignedUsers - Array of user IDs assigned to manager (if applicable)
 * @returns {Array|null} - Array of user IDs or null (null means all users in organization for admins)
 */
const getAccessibleUserIds = (user, assignedUsers = []) => {
    if (user.role === 'admin') {
        return null;
    }

    if (user.role === 'manager') {
        return [...assignedUsers.map(id => id.toString()), user.userid.toString()];
    }

    return [user.userid.toString()];
};

/**
 * Check if user is a manager of a specific user
 * @param {String} managerId - Manager's user ID
 * @param {String} userId - User's ID to check
 * @param {Array} assignedUsers - Array of user IDs assigned to manager
 * @returns {Boolean} - True if managerId manages userId
 */
const isManagerOf = (managerId, userId, assignedUsers = []) => {
    return assignedUsers.some(id => id.toString() === userId.toString());
};

/**
 * Build organization-scoped query filter
 * Adds organizationId and user-based filtering based on role
 * @param {Object} user - Current user object
 * @param {Array} assignedUsers - Array of user IDs assigned to manager
 * @param {String} userField - Field name for user filtering (default: 'user')
 * @returns {Object} - MongoDB query filter object
 */
const getOrganizationFilter = (user, assignedUsers = [], userField = 'user') => {
    const filter = {
        organizationId: user.organizationId
    };

    if (user.role === 'admin') {
        return filter;
    }

    if (user.role === 'manager') {
        filter[userField] = {
            $in: [...assignedUsers, user.userid]
        };
        return filter;
    }

    filter[userField] = user.userid;
    return filter;
};

/**
 * Check if user can perform action on target user
 * @param {Object} currentUser - Current user performing action
 * @param {String} targetUserId - Target user ID
 * @param {Array} assignedUsers - Array of user IDs assigned to manager
 * @returns {Boolean} - True if action is allowed
 */
const canManageUser = (currentUser, targetUserId, assignedUsers = []) => {
    if (currentUser.role === 'admin') {
        return true;
    }

    if (currentUser.role === 'manager') {
        return assignedUsers.some(id => id.toString() === targetUserId.toString());
    }

    return false;
};

/**
 * Validate role hierarchy for user creation/modification
 * @param {String} currentUserRole - Role of user performing action
 * @param {String} targetRole - Role being assigned
 * @returns {Object} - { valid: Boolean, message: String }
 */
const validateRoleAssignment = (currentUserRole, targetRole) => {
    const roleHierarchy = {
        'admin': 3,
        'manager': 2,
        'user': 1
    };

    const currentLevel = roleHierarchy[currentUserRole] || 0;
    const targetLevel = roleHierarchy[targetRole] || 0;

    if (currentUserRole === 'user') {
        return {
            valid: false,
            message: 'Users cannot create other users'
        };
    }

    if (currentUserRole === 'manager' && targetRole !== 'user') {
        return {
            valid: false,
            message: 'Managers can only create users with role "user"'
        };
    }

    if (currentUserRole === 'admin' && targetRole === 'admin') {
        return {
            valid: false,
            message: 'Admins cannot create other admins'
        };
    }

    if (targetLevel >= currentLevel) {
        return {
            valid: false,
            message: 'Cannot assign role equal to or higher than your own'
        };
    }

    return {
        valid: true,
        message: 'Role assignment valid'
    };
};

/**
 * Build aggregation pipeline for organization-scoped queries
 * @param {Object} user - Current user object
 * @param {Array} assignedUsers - Array of user IDs assigned to manager
 * @param {String} userField - Field name for user filtering
 * @returns {Array} - MongoDB aggregation pipeline stages
 */
const getOrganizationPipeline = (user, assignedUsers = [], userField = 'user') => {
    const pipeline = [
        {
            $match: {
                organizationId: user.organizationId
            }
        }
    ];

    if (user.role === 'manager') {
        pipeline.push({
            $match: {
                [userField]: {
                    $in: [...assignedUsers, user.userid]
                }
            }
        });
    } else if (user.role === 'user') {
        pipeline.push({
            $match: {
                [userField]: user.userid
            }
        });
    }

    return pipeline;
};

module.exports = {
    buildRoleBasedFilter,
    buildRoleBasedPipeline,
    getAssignedUsers,
    canAccessResource,
    getAccessibleUserIds,
    isManagerOf,
    getOrganizationFilter,
    canManageUser,
    validateRoleAssignment,
    getOrganizationPipeline
};
