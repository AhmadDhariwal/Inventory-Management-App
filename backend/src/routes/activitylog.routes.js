const express = require("express");
const router = express.Router();
const controller = require("../controllers/activitylog.controller");

router.get("/", controller.getLogs);
router.post("/", controller.createLog);
router.get("/stats", controller.getLogStats);
router.delete("/:id", controller.deleteLog);

module.exports = router;
