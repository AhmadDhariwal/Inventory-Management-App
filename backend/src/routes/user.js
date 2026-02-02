const userschema = require('../models/user');
const express = require('express');
const router = express.Router();
const {handleusersignup , handleuserlogin, updateUserProfile, getUserProfile, changePassword, getActiveSessions, terminateSession} = require('../controllers/userauth');
const { restrictto, verifytoken } = require('../middleware/auth.middleware');

router.post('/', handleusersignup);
router.post('/login', handleuserlogin);
router.get('/profile', verifytoken, getUserProfile);
router.put('/profile', verifytoken, updateUserProfile);
router.put('/change-password', verifytoken, changePassword);
router.get('/sessions', verifytoken, getActiveSessions);
router.delete('/sessions/:id', verifytoken, terminateSession);
router.delete('/sessions/all', verifytoken, terminateSession);
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

module.exports =router;