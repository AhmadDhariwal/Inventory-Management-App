const express = require("express");
const router = express.Router();
const salesordercontroller = require("../controllers/salesorder.controller");
const {verifytoken} = require("../middleware/auth.middleware");

router.post("/add", verifytoken, salesordercontroller.createsalesorder);
router.get("/",salesordercontroller.getallsalesorders);
module.exports = router;
