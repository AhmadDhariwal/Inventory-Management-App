const express = require("express");
const router = express.Router();
const reportcontroller = require("../controllers/report.controller");

router.get("/stock", reportcontroller.getstockreport);
router.get("/stockmovements", reportcontroller.getstockmovementreport);
router.get("/purchases", reportcontroller.getpurchasereport);


module.exports = router;
