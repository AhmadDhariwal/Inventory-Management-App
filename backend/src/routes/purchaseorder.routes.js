const express = require("express");
const router = express.Router();
const purchaseordercontroller = require("../controllers/purchaseorder.controller");
const { verifytoken, restrictto } = require("../middleware/auth.middleware");

// Create purchase order - Both admin and user can create
router.post("/add", verifytoken, purchaseordercontroller.createpurchaseorder);

// View purchase orders - Both admin and user can view
router.get("/", verifytoken, purchaseordercontroller.getallpurchaseorders);
router.get("/:id", verifytoken, purchaseordercontroller.getpurchaseorderbyid);

// Approve/Receive purchase orders - Admin and Manager
router.patch("/:id/approve", verifytoken, restrictto(['admin', 'manager']), purchaseordercontroller.approvepurchaseorder);
router.patch("/:id/receive", verifytoken, restrictto(['admin', 'manager']), purchaseordercontroller.receivepurchaseorder);

// Delete purchase order - Admin and Manager
router.delete("/:id", verifytoken, restrictto(['admin', 'manager']), purchaseordercontroller.deletepurchaseorder);

module.exports = router;
