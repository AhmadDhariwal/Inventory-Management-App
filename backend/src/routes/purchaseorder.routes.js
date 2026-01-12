const express = require("express");
const router = express.Router();
const purchaseordercontroller = require("../controllers/purchaseorder.controller");
const {verifytoken} = require("../middleware/auth.middleware");

router.post("/add", verifytoken , purchaseordercontroller.createpurchaseorder);

module.exports = router;
