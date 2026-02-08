const userService = require('../services/user.service');

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

// Signup
const handleusersignup = asyncHandler(async (req, res) => {
  await userService.handleusersignup(req, res);
});

// Login
const handleuserlogin = asyncHandler(async (req, res) => {
  await userService.handleuserlogin(req, res);
});

// Get all users (role-based filtering)
const allusers = asyncHandler(async (req, res) => {
  await userService.allusers(req, res);
});

// Get logged-in user profile
const getUserProfile = asyncHandler(async (req, res) => {
  await userService.getUserProfile(req, res);
});

// Update profile
const updateUserProfile = asyncHandler(async (req, res) => {
  await userService.updateUserProfile(req, res);
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req, res);
});

// Sessions
const getActiveSessions = asyncHandler(async (req, res) => {
  await userService.getActiveSessions(req, res);
});

const terminateSession = asyncHandler(async (req, res) => {
  await userService.terminateSession(req, res);
});

// Toggle user status
const toggleuserstatus = asyncHandler(async (req, res) => {
  await userService.toggleuserstatus(req, res);
});

// Assign user to manager (admin only)
const assignUserToManager = asyncHandler(async (req, res) => {
  await userService.assignUserToManager(req, res);
});

// Get users assigned to manager
const getManagerUsers = asyncHandler(async (req, res) => {
  await userService.getManagerUsers(req, res);
});

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
  getManagerUsers
};
