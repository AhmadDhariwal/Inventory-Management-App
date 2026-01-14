const express = require("express");
const router = express.Router();
const dashboardcontroller = require("../controllers/dashboard.controller");

router.get("/", dashboardcontroller.getdashboardstats);


module.exports = router;