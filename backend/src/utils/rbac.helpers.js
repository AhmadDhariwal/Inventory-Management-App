/**
 * RBAC Helper Functions
 * Utility functions for role-based access control and organization filtering
 */

/**
 * Check if user can access a specific resource
 * @param {Object} user - Current user object with role and organizationId
 * @param {Object} resource - Resource object with organizationId and owner/user field
 * @param {String} ownerField - Field name that contains the owner user ID (default: 'user')
 * @param {Array} assignedUsers - Array of user IDs assigned to manager (if applicable)
 * @returns {Boolean} - True if user can access the resource
 */
const canAccessResource = (user, resource, ownerField = 'user', assignedUsers = []) => {
    // Check organization match first
    if (resource.organizationId.toString() !== user.organizationId.toString()) {
        return false;
    }

    // Admins have full access within their organization
    if (user.role === 'admin') {
        return true;
    }

    const resourceOwnerId = resource[ownerField]?.toString();

    // Managers can access resources from assigned users
    if (user.role === 'manager') {
        const isAssigned = assignedUsers.some(
            userId => userId.toString() === resourceOwnerId
        );
        return isAssigned || resourceOwnerId === user.userid.toString();
    }

    // Users can only access their own resources
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
        return null; // Null indicates all users in organization
    }

    if (user.role === 'manager') {
        // Manager can access their assigned users + themselves
        return [...assignedUsers.map(id => id.toString()), user.userid.toString()];
    }

    // Users can only access their own data
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

    // Admins see all data in their organization
    if (user.role === 'admin') {
        return filter;
    }

    // Managers see data from assigned users
    if (user.role === 'manager') {
        filter[userField] = {
            $in: [...assignedUsers, user.userid]
        };
        return filter;
    }

    // Users see only their own data
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
    // Admins can manage all users in their organization
    if (currentUser.role === 'admin') {
        return true;
    }

    // Managers can manage their assigned users
    if (currentUser.role === 'manager') {
        return assignedUsers.some(id => id.toString() === targetUserId.toString());
    }

    // Users cannot manage other users
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

    // Users cannot create other users
    if (currentUserRole === 'user') {
        return {
            valid: false,
            message: 'Users cannot create other users'
        };
    }

    // Managers can only create users
    if (currentUserRole === 'manager' && targetRole !== 'user') {
        return {
            valid: false,
            message: 'Managers can only create users with role "user"'
        };
    }

    // Admins cannot create other admins
    if (currentUserRole === 'admin' && targetRole === 'admin') {
        return {
            valid: false,
            message: 'Admins cannot create other admins'
        };
    }

    // Cannot assign role equal or higher than own role
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

    // Add user filtering for non-admins
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
    canAccessResource,
    getAccessibleUserIds,
    isManagerOf,
    getOrganizationFilter,
    canManageUser,
    validateRoleAssignment,
    getOrganizationPipeline
};
