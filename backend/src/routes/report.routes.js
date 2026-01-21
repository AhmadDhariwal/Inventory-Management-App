const express = require("express");
const router = express.Router();
const reportcontroller = require("../controllers/report.controller");

router.get("/stock", reportcontroller.getstockreport);
router.get("/stockmovements", reportcontroller.getstockmovementreport);
router.get("/stockmovements/export/csv", reportcontroller.exportStockMovementsCSV);
router.get("/stockmovements/export/excel", reportcontroller.exportStockMovementsExcel);
router.get("/purchases", reportcontroller.getpurchasereport);
router.get("/purchases/export/csv", reportcontroller.exportPurchaseOrdersCSV);
router.get("/purchases/export/excel", reportcontroller.exportPurchaseOrdersExcel);
router.get("/stocklevels", reportcontroller.getstocklevelsreport);
router.get("/lowstock", reportcontroller.getlowstockreport);
router.get("/summary",reportcontroller.getstocksummary);
router.get("/summary/export/csv", reportcontroller.exportStockSummaryCSV);
router.get("/summary/export/excel", reportcontroller.exportStockSummaryExcel);

module.exports = router;
