const express = require("express");
const router = express.Router();
const purchaseordercontroller = require("../controllers/purchaseorder.controller");
const {verifytoken, restrictto} = require("../middleware/auth.middleware");

// Create purchase order - Both admin and user can create
router.post("/add", verifytoken, purchaseordercontroller.createpurchaseorder);

// View purchase orders - Both admin and user can view
router.get("/", verifytoken, purchaseordercontroller.getallpurchaseorders);
router.get("/:id", verifytoken, purchaseordercontroller.getpurchaseorderbyid);

// Approve/Receive purchase orders - Admin only
router.patch("/:id/approve", verifytoken, restrictto(['admin']), purchaseordercontroller.approvepurchaseorder);
router.patch("/:id/receive", verifytoken, restrictto(['admin']), purchaseordercontroller.receivepurchaseorder);

// Delete purchase order - Admin only
router.delete("/:id", verifytoken, restrictto(['admin']), purchaseordercontroller.deletepurchaseorder);

module.exports = router;
