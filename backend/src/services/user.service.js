const User = require('../models/user');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { validateRoleAssignment } = require('../utils/rbac.helpers');
const { generateSecret, generateSync, generateURI, verifySync } = require('otplib');

/**
 * User signup with organization context
 * Admins can create managers and users
 * Managers can create users (assigned to them automatically)
 */
async function handleusersignup(req, res) {
  try {
    const body = req.body;

    if (!body.name || !body.email || !body.username || !body.password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, username, and password are required"
      });
    }

    let organizationId = req.organizationId || body.organizationId;

    // Auto-create organization if organizationName is provided and no organizationId
    if (!organizationId && body.organizationName) {
      const Organization = require('../models/organization');

      // Create new organization
      const newOrganization = await Organization.create({
        name: body.organizationName,
        email: body.email,
        phone: body.phone || '',
        address: {
          country: 'US' // Default country
        },
        settings: {
          currency: 'USD',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY'
        },
        subscription: {
          plan: 'free',
          status: 'active',
          startDate: new Date()
        }
      });

      organizationId = newOrganization._id;

      // First user of organization becomes admin
      body.role = 'admin';
    }

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: "Organization ID or organization name is required"
      });
    }

    // Validate role assignment if user is authenticated
    if (req.user && req.userRole) {
      const validation = validateRoleAssignment(req.userRole, body.role || 'user');
      if (!validation.valid) {
        return res.status(403).json({
          success: false,
          error: validation.message
        });
      }
    }

    const hashedpassword = await bcrypt.hash(body.password, 8);

    const userData = {
      name: body.name,
      email: body.email,
      username: body.username,
      password: hashedpassword,
      phone: body.phone,
      department: body.department,
      role: body.role || 'user',
      organizationId: organizationId,
      createdBy: req.user?.userid || null
    };

    // If created by a manager, assign the user to that manager
    if (req.userRole === 'manager' && userData.role === 'user') {
      userData.managerId = req.user.userid;
    }

    const createduser = await User.create(userData);

    // If manager created a user, add to manager's assignedUsers
    if (req.userRole === 'manager' && userData.role === 'user') {
      await User.findByIdAndUpdate(
        req.user.userid,
        { $addToSet: { assignedUsers: createduser._id } }
      );
    }

    // Generate token with organization context
    const token = jwt.sign(
      {
        userid: createduser._id,
        role: createduser.role,
        organizationId: createduser.organizationId
      },
      "Hello",
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token: token,
      role: createduser.role,
      data: {
        _id: createduser._id,
        name: createduser.name,
        email: createduser.email,
        username: createduser.username,
        role: createduser.role,
        organizationId: createduser.organizationId,
        department: createduser.department
      }
    });
  } catch (err) {
    console.error("Create user error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Username or email already exists"
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

/**
 * Get all users with organization and role-based filtering
 * Admins see all users in their organization
 * Managers see only assigned users
 * Users see only themselves
 */
async function allusers(req, res) {
  try {
    let query = { organizationId: req.organizationId };

    // Role-based filtering
    if (req.userRole === 'admin') {
      // Admins see everyone in their organization
      query = { organizationId: req.organizationId };
    } else if (req.userRole === 'manager') {
      // Managers see their assigned users + themselves
      const assignedUserIds = (req.assignedUsers || []).map(id => id.toString());
      query = {
        organizationId: req.organizationId,
        $or: [
          { _id: { $in: assignedUserIds } },
          { _id: req.user.userid }
        ]
      };
    } else if (req.userRole === 'user') {
      // Users see only themselves
      query = {
        _id: req.user.userid,
        organizationId: req.organizationId
      };
    }

    const users = await User.find(query)
      .select('-password')
      .populate('managerId', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
      count: users.length
    });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

const ActivityLog = require('../models/activitylog');
const activityLogService = require('./activitylog.service');

/**
 * User login with organization context
 */
async function handleuserlogin(req, res) {
  try {
    const body = req.body;

    if (!body.username || !body.password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required"
      });
    }

    const logineduser = await User.findOne({ username: body.username });

    if (!logineduser) {
      return res.status(401).json({
        success: false,
        error: "Invalid username or password"
      });
    }

    // Check active status
    if (!logineduser.isActive) {
      return res.status(403).json({
        success: false,
        error: `Account ${body.username} is not active`
      });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(body.password, logineduser.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid username or password"
      });
    }

    // Update last login timestamp
    logineduser.lastLogin = new Date();
    await logineduser.save();

    // Log login activity
    await activityLogService.logActivity({
      userId: logineduser._id,
      action: 'LOGIN',
      module: 'AUTH',
      description: `User ${logineduser.username} logged in`,
      ip: req.ip || req.connection.remoteAddress,
      organizationId: logineduser.organizationId
    });

    // Generate token with organization context
    const tokenPayload = {
      userid: logineduser._id,
      role: logineduser.role,
      organizationId: logineduser.organizationId
    };

    // Check if 2FA is enabled
    if (logineduser.twoFactorEnabled) {
      // For development/troubleshooting: log the current code to console
      const debugCode = generateSync({ secret: logineduser.twoFactorSecret });
      console.log(`\n[2FA DEBUG] Current OTP for user ${logineduser.username}: ${debugCode}\n`);

      return res.status(200).json({
        success: true,
        requires2FA: true,
        userId: logineduser._id,
        message: "Two-factor authentication required. (Debug: check server console for code)"
      });
    }

    const token = jwt.sign(tokenPayload, "Hello", { expiresIn: '24h' });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      role: logineduser.role,
      data: {
        _id: logineduser._id,
        name: logineduser.name,
        email: logineduser.email,
        username: logineduser.username,
        role: logineduser.role,
        organizationId: logineduser.organizationId,
        department: logineduser.department
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

/**
 * Verify 2FA OTP and return token
 */
async function verify2FA(req, res) {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({
        success: false,
        error: "User ID and code are required"
      });
    }

    const user = await User.findById(userId);
    // Allow verification if enabled OR if in setup phase (secret exists but not enabled yet)
    if (!user || (!user.twoFactorEnabled && !user.twoFactorSecret)) {
      return res.status(401).json({
        success: false,
        error: "2FA not configured for this user"
      });
    }

    // Use an epochTolerance of 2 (allows +/- 60 seconds) to handle time drift
    const isValid = verifySync({
      token: code,
      secret: user.twoFactorSecret,
      epochTolerance: 2
    });

    if (!isValid) {
      console.log(`[2FA DEBUG] Verification failed for ${user.username}. Provided: ${code}`);
      return res.status(401).json({
        success: false,
        error: "Invalid 2FA code. Please ensure your device's time is synchronized."
      });
    }

    // If this was a setup verification, fully enable it now
    let activationMessage = "";
    if (!user.twoFactorEnabled) {
      user.twoFactorEnabled = true;
      activationMessage = " 2FA has been fully enabled.";
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Log login activity
    await activityLogService.logActivity({
      userId: user._id,
      action: 'LOGIN',
      module: 'AUTH',
      description: `User ${user.username} logged in (2FA)`,
      ip: req.ip || req.connection.remoteAddress,
      organizationId: user.organizationId
    });

    // Generate token
    const token = jwt.sign(
      {
        userid: user._id,
        role: user.role,
        organizationId: user.organizationId
      },
      "Hello",
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: "2FA verification successful",
      token: token,
      role: user.role,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        organizationId: user.organizationId,
        department: user.department
      }
    });
  } catch (err) {
    console.error("2FA verify error:", err);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

/**
 * Assign user to manager
 * Only admins can assign users to managers
 */
async function assignUserToManager(req, res) {
  try {
    const { userId, managerId } = req.body;

    if (!userId || !managerId) {
      return res.status(400).json({
        success: false,
        error: "User ID and Manager ID are required"
      });
    }

    // Verify both users exist and belong to same organization
    const user = await User.findById(userId);
    const manager = await User.findById(managerId);

    if (!user || !manager) {
      return res.status(404).json({
        success: false,
        error: "User or Manager not found"
      });
    }

    if (user.organizationId.toString() !== req.organizationId.toString() ||
      manager.organizationId.toString() !== req.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        error: "Users must belong to your organization"
      });
    }

    if (manager.role !== 'manager') {
      return res.status(400).json({
        success: false,
        error: "Assigned user must have manager role"
      });
    }

    if (user.role !== 'user') {
      return res.status(400).json({
        success: false,
        error: "Only users with role 'user' can be assigned to managers"
      });
    }

    // Remove from previous manager if exists
    if (user.managerId) {
      await User.findByIdAndUpdate(
        user.managerId,
        { $pull: { assignedUsers: userId } }
      );
    }

    // Assign to new manager
    user.managerId = managerId;
    await user.save();

    // Add to manager's assignedUsers
    await User.findByIdAndUpdate(
      managerId,
      { $addToSet: { assignedUsers: userId } }
    );

    res.status(200).json({
      success: true,
      message: "User assigned to manager successfully",
      data: user
    });
  } catch (error) {
    console.error("Assign user to manager error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

/**
 * Get users assigned to a manager
 */
async function getManagerUsers(req, res) {
  try {
    const managerId = req.params.managerId || req.user.userid;

    const users = await User.find({
      managerId: managerId,
      organizationId: req.organizationId
    }).select('-password');

    res.status(200).json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error("Get manager users error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

async function updateUserProfile(req, res) {
  try {
    const userId = req.user.userid;
    const { name, phone, department } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone, department },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

async function getUserProfile(req, res) {
  try {
    const userId = req.user.userid;
    const user = await User.findById(userId)
      .select('-password')
      .populate('organizationId', 'name email')
      .populate('managerId', 'name email');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

async function changePassword(req, res) {
  try {
    const userId = req.user.userid;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect"
      });
    }

    user.password = await bcrypt.hash(newPassword, 8);
    user.passwordLastChanged = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

async function toggleTwoFactor(req, res) {
  try {
    const userId = req.user.userid;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (user.twoFactorEnabled) {
      user.twoFactorEnabled = false;
      user.twoFactorSecret = null;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Two-factor authentication disabled successfully",
        data: { twoFactorEnabled: false }
      });
    }

    // If not enabled, start setup by generating secret but DON'T enable yet
    const secret = generateSecret();
    user.twoFactorSecret = secret;
    // We store it, but don't set twoFactorEnabled: true until they confirm
    await user.save();

    const otpauthUrl = generateURI({
      label: user.email,
      issuer: 'InventoryApp',
      secret: secret
    });

    res.status(200).json({
      success: true,
      message: "2FA setup initiated. Please verify code to enable.",
      data: {
        twoFactorEnabled: false,
        isSetup: true,
        secret: secret,
        otpauthUrl: otpauthUrl
      }
    });
  } catch (err) {
    console.error("Toggle 2FA error:", err);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

async function getActiveSessions(req, res) {
  try {
    const sessions = [{
      id: '1',
      device: req.headers['user-agent'] || 'Unknown Browser',
      location: 'Local Session',
      lastActive: new Date(),
      current: true
    }];

    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (err) {
    console.error("Get sessions error:", err);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

async function terminateSession(req, res) {
  try {
    res.status(200).json({
      success: true,
      message: "Session terminated successfully"
    });
  } catch (err) {
    console.error("Terminate session error:", err);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}

async function toggleuserstatus(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify user belongs to same organization
    if (user.organizationId.toString() !== req.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
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
  toggleTwoFactor, verify2FA
};
