const mongoose = require('mongoose');

const userschema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        require: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'manager', 'admin'],
        required: true,
    },
    phone: {
        type: String,
        default: ''
    },
    department: {
        type: String,
        default: ''
    },
    // Multi-tenant fields
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    // Manager hierarchy - only for users with role 'user'
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    // For managers - array of users assigned to them
    assignedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    // Track who created this user
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    }

}, { timestamps: true });

// Compound indexes for efficient organization-scoped queries
userschema.index({ organizationId: 1, role: 1 });
userschema.index({ organizationId: 1, email: 1 });
userschema.index({ managerId: 1 });

// Validation: users should have managerId, managers and admins should not
userschema.pre('save', async function () {
    if (this.role === 'user' && this.managerId === undefined) {
        // Allow null managerId for users (can be assigned later)
    } else if ((this.role === 'manager' || this.role === 'admin') && this.managerId) {
        this.managerId = null; // Clear managerId for managers and admins
    }
});

const User = mongoose.model('user', userschema);

module.exports = User;