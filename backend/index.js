const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const inventoryschema = require("./src/models/model");
const { connecttomongodb} = require('./connect');
const route = require("./src/routes/route");
const inventoryroute = require("./src/routes/inventory.routes")
const purchaseorderroutes = require("./src/routes/purchaseorder.routes");
const supplierroute = require("./src/routes/supplier.routes");
const salesorderroutes = require("./src/routes/salesorder.routes");
const reportroutes = require("./src/routes/report.routes");
const dashboardroutes = require("./src/routes/dashboard.routes");
const productroutes = require("./src/routes/product.routes");
const warehouseroutes = require("./src/routes/warehouse.routes");
const stockruleroutes = require("./src/routes/stockrule.routes");
const categoryroutes = require("./src/routes/category.routes");
const cors = require('cors');
const userroute = require('./src/routes/user');
const { verifytoken,restrictto } = require('./src/middleware/auth.middleware');
  



const app = express();
const port = 3000;

const allowedOrigins = ['http://localhost:4200',
  'http://localhost:61135'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

connecttomongodb('mongodb://localhost:27017/inventorymanagement')
.then(() =>   console.log('MongoDB connected'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

  app.use (express.json());
app.use(express.urlencoded({extended :false}));
app.use(cookieParser());


app.use('/items',verifytoken,restrictto(["admin","user"]), route);
app.use('/user',userroute);
app.use('/api/inventory',verifytoken ,inventoryroute);
app.use("/api/suppliers", supplierroute);
app.use("/api/purchaseorders", purchaseorderroutes);
app.use("/api/salesorders", salesorderroutes);
app.use("/api/reports", reportroutes);
app.use("/api/dashboard", dashboardroutes);
app.use("/api/products", productroutes);
app.use("/api/categories", categoryroutes);
app.use("/api/warehouses", warehouseroutes);
app.use("/api/stockrules", stockruleroutes);


// app.get('/', (req, res) => {
//   res.send('Hello World'); 
// });

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.listen(port, () => console.log(`Server Started at ${port}`));
