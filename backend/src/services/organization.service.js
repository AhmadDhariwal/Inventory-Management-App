const Organization = require('../models/organization');
const User = require('../models/user');

/**
 * Create a new organization
 * This would typically be restricted to super admin or self-registration
 */
async function createOrganization(req, res) {
    try {
        const { name, email, phone, address, settings } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Organization name and email are required'
            });
        }

        // Check if organization with email already exists
        const existingOrg = await Organization.findOne({ email: email.toLowerCase() });
        if (existingOrg) {
            return res.status(400).json({
                success: false,
                message: 'Organization with this email already exists'
            });
        }

        const organization = await Organization.create({
            name,
            email: email.toLowerCase(),
            phone,
            address,
            settings: settings || {},
            createdBy: req.user?.userid
        });

        res.status(201).json({
            success: true,
            message: 'Organization created successfully',
            data: organization
        });
    } catch (error) {
        console.error('Create organization error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating organization',
            error: error.message
        });
    }
}

/**
 * Get organization details
 */
async function getOrganization(req, res) {
    try {
        const organizationId = req.params.id || req.organizationId;

        const organization = await Organization.findById(organizationId);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Users can only view their own organization
        if (req.organizationId && organization._id.toString() !== req.organizationId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.status(200).json({
            success: true,
            data: organization
        });
    } catch (error) {
        console.error('Get organization error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching organization',
            error: error.message
        });
    }
}

/**
 * Update organization settings
 * Only admins can update their organization
 */
async function updateOrganization(req, res) {
    try {
        const organizationId = req.params.id;
        const updates = req.body;

        // Ensure user is updating their own organization
        if (req.organizationId && organizationId !== req.organizationId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Can only update your own organization'
            });
        }

        // Prevent updating certain fields
        delete updates.createdBy;
        delete updates._id;

        const organization = await Organization.findByIdAndUpdate(
            organizationId,
            updates,
            { new: true, runValidators: true }
        );

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Organization updated successfully',
            data: organization
        });
    } catch (error) {
        console.error('Update organization error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating organization',
            error: error.message
        });
    }
}

/**
 * List all organizations (super admin only)
 */
async function listOrganizations(req, res) {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const organizations = await Organization.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Organization.countDocuments(query);

        res.status(200).json({
            success: true,
            data: organizations,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error('List organizations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching organizations',
            error: error.message
        });
    }
}

/**
 * Deactivate organization
 */
async function deactivateOrganization(req, res) {
    try {
        const organizationId = req.params.id;

        const organization = await Organization.findByIdAndUpdate(
            organizationId,
            { isActive: false },
            { new: true }
        );

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Also deactivate all users in the organization
        await User.updateMany(
            { organizationId },
            { isactive: false }
        );

        res.status(200).json({
            success: true,
            message: 'Organization deactivated successfully',
            data: organization
        });
    } catch (error) {
        console.error('Deactivate organization error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deactivating organization',
            error: error.message
        });
    }
}

/**
 * Get organization statistics
 */
async function getOrganizationStats(req, res) {
    try {
        const organizationId = req.organizationId;

        const stats = await User.aggregate([
            { $match: { organizationId: organizationId } },
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalUsers = await User.countDocuments({ organizationId });
        const activeUsers = await User.countDocuments({ organizationId, isactive: true });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                roleDistribution: stats
            }
        });
    } catch (error) {
        console.error('Get organization stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching organization statistics',
            error: error.message
        });
    }
}

module.exports = {
    createOrganization,
    getOrganization,
    updateOrganization,
    listOrganizations,
    deactivateOrganization,
    getOrganizationStats
};
