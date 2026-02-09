const Warehouse = require('../models/warehouse');

const getWarehouses = async (req, res) => {
    try {
        const query = { isActive: true };
        if (req.organizationId) {
            query.organizationId = req.organizationId;
        }

        const warehouses = await Warehouse.find(query).sort({ name: 1 });
        res.status(200).json(warehouses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createWarehouse = async (req, res) => {
    try {
        const warehouseData = req.body;

        if (req.organizationId) {
            warehouseData.organizationId = req.organizationId;
        }

        if (req.userid) {
            warehouseData.createdBy = req.userid;
        }

        const warehouse = new Warehouse(warehouseData);
        await warehouse.save();
        res.status(201).json(warehouse);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!warehouse) {
            return res.status(404).json({ error: 'Warehouse not found' });
        }
        res.status(200).json(warehouse);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            { isActive: false },
            { new: true }
        );
        if (!warehouse) {
            return res.status(404).json({ error: 'Warehouse not found' });
        }
        res.status(200).json({ message: 'Warehouse deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse
};
