const express = require("express");
const router = express.Router();
const purchaseordercontroller = require("../controllers/purchaseorder.controller");
const {verifytoken} = require("../middleware/auth.middleware");

router.post("/add", verifytoken , purchaseordercontroller.createpurchaseorder);
router.get("/",purchaseordercontroller.getallpurchaseorders);
router.get("/:id", purchaseordercontroller.getpurchaseorderbyid);

module.exports = router;
