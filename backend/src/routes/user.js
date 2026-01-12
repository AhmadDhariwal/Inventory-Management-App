const userschema = require('../models/user');
const express = require('express');
const router = express.Router();
const {handleusersignup , handleuserlogin} = require('../controllers/userauth');
const { restrictto } = require('../middleware/auth.middleware');

router.post('/', handleusersignup);
router.post('/login', handleuserlogin);
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});


module.exports =router;