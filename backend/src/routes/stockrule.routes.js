const express = require("express");
const router = express.Router();
const stockrulecontroller = require("../controllers/stockrule.controller");
const { verifytoken } = require("../middleware/auth.middleware");

router.post("/", verifytoken, stockrulecontroller.createstockrule);
router.get("/", verifytoken, stockrulecontroller.getstockrules);
router.get("/:id", verifytoken, stockrulecontroller.getstockruleById);
router.put("/:id", verifytoken, stockrulecontroller.updatestockrule);
router.delete("/:id", verifytoken, stockrulecontroller.deletestockrule);

module.exports = router;