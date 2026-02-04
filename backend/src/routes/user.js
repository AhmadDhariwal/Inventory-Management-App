const userschema = require('../models/user');
const express = require('express');
const router = express.Router();
const {handleusersignup , handleuserlogin, updateUserProfile, getUserProfile, changePassword, getActiveSessions, terminateSession,allusers} = require('../controllers/userauth');
const { restrictto, verifytoken } = require('../middleware/auth.middleware');
const { adminOnly,adminOrManager, managerOnly,allRoles } = require('../middleware/rbac.middleware');
const { toggleuserstatus } = require('../services/user.service');

router.post('/', handleusersignup);
router.get('/all',allusers);
router.post('/login', handleuserlogin);
router.get('/profile', verifytoken,allRoles, getUserProfile);
router.put('/profile', verifytoken,allRoles, updateUserProfile);
router.put('/change-password', verifytoken,allRoles , changePassword);
router.get('/sessions', verifytoken,adminOrManager , getActiveSessions);
router.delete('/sessions/:id', verifytoken,adminOnly , terminateSession);
router.delete('/sessions/all', verifytoken,adminOnly , terminateSession);
router.put('/:id/toggle-status',verifytoken,adminOnly,toggleuserstatus)
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

module.exports =router;