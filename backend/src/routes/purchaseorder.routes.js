const express = require("express");
const router = express.Router();
const purchaseordercontroller = require("../controllers/purchaseorder.controller");
const {verifytoken} = require("../middleware/auth.middleware");

router.post("/add", verifytoken , purchaseordercontroller.createpurchaseorder);
router.get("/",purchaseordercontroller.getallpurchaseorders);
router.get("/:id", purchaseordercontroller.getpurchaseorderbyid);
router.patch("/:id/approve", verifytoken, purchaseordercontroller.approvepurchaseorder);
router.patch("/:id/receive", verifytoken, purchaseordercontroller.receivepurchaseorder);
router.delete("/:id", verifytoken, purchaseordercontroller.deletepurchaseorder);

module.exports = router;
