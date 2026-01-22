const express = require("express");
const router = express.Router();
const inventorycontroller = require("../controllers/inventory.controller");
const { verifytoken } = require("../middleware/auth.middleware");

router.post("/add", verifytoken, inventorycontroller.addstock);
router.post("/remove", verifytoken, inventorycontroller.removestock);
router.get(
  "/stock/:productId/:warehouseId",
  verifytoken,
  inventorycontroller.getstock
);
router.get("/stocklevels", verifytoken, inventorycontroller.getstocklevels);
router.get("/summary", verifytoken, inventorycontroller.getstocksummary);

module.exports = router;
