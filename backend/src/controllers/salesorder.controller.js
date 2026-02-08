const salesorderservice = require("../services/salesorder.service");

const createsalesorder = async (req, res) => {
  try {
    const salesorder = await salesorderservice.createsalesorder(
      req.body,
      req.user.userid,
      req.organizationId
    );

    res.status(201).json({
      message: "Sales Order created successfully",
      data: salesorder,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getallsalesorders = async (req, res) => {
  try {
    const salesorder = await salesorderservice.getallsalesorders(req.user, req.organizationId);
    res.status(200).json(salesorder);
  }
  catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { createsalesorder, getallsalesorders };
