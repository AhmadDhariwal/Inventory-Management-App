const salesorderservice = require("../services/salesorder.service");

const createsalesorder = async (req, res) => {
  try {
    const salesorder = await salesorderservice.createsalesorder(
      req.body,
      req.user.id
    );

    res.status(201).json({
      message: "Sales Order created successfully",
      data: salesorder,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createsalesorder };
