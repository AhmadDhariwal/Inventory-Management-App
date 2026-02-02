const express = require("express");
const router = express.Router();
const inventorycontroller = require("../controllers/inventory.controller");
const { verifytoken, restrictto } = require("../middleware/auth.middleware");

// Stock movements - Admin only
router.post("/add", verifytoken, restrictto(['admin']), inventorycontroller.addstock);
router.post("/remove", verifytoken, restrictto(['admin']), inventorycontroller.removestock);

// View stock - Both admin and user
router.get("/stock/:productId/:warehouseId", verifytoken, inventorycontroller.getstock);
router.get("/stocklevels", verifytoken, inventorycontroller.getstocklevels);
router.get("/summary", verifytoken, inventorycontroller.getstocksummary);

// Update stock levels - Admin only
router.put("/stocklevels/:id", verifytoken, restrictto(['admin']), inventorycontroller.updatestocklevel);

module.exports = router;
