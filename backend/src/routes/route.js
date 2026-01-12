const express = require('express');
const inventoryschema = require("../models/model");
const {verifytoken} = require("../middleware/auth.middleware");
const {createitem,getitems,getbyid,getall,updatebyid,deletebyid,getallusers } = require('../controllers/itemsController');
const router = express.Router();

router.get('/allusers', getallusers);
router.post('/', createitem);
router.get('/',getitems);
router.get('/:id', getbyid);
router.get('/all', getall);
router.put('/:id',updatebyid);
router.delete('/:id', deletebyid);


module.exports = router;

