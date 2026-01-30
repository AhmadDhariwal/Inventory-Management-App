// const express = require("express");
// const router = express.Router();
// const dashboardcontroller = require("../controllers/dashboard.controller");

// router.get("/", dashboardcontroller.getdashboardstats);


// module.exports = router;
const express=require("express");
const router = express.Router();
const controller = require('../controllers/dashboard.controller');

router.get('/', controller.getdashboardstats);

module.exports = router;
