const express = require("express");
const router = express.Router();

const suppliercontroller = require("../controllers/supplier.controller");
const { verifytoken } = require("../middleware/auth.middleware");


router.post("/", verifytoken, suppliercontroller.createsupplier);
router.get("/", verifytoken, suppliercontroller.getsuppliers);
router.get("/:id", verifytoken, suppliercontroller.getsupplierById);
router.put("/:id", verifytoken, suppliercontroller.updatesupplier);
router.delete("/:id", verifytoken, suppliercontroller.disablesupplier);

module.exports = router;
