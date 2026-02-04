const ActivityLog = require("../models/activitylog");

exports.getLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      action = "", 
      module = "",
      startDate = "",
      endDate = ""
    } = req.query;

    // Build search query
    const searchQuery = {};
    
    if (search) {
      searchQuery.$or = [
        { entityName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    if (action) {
      searchQuery.action = action;
    }
    
    if (module) {
      searchQuery.module = { $regex: module, $options: "i" };
    }
    
    if (startDate || endDate) {
      searchQuery.createdAt = {};
      if (startDate) searchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) searchQuery.createdAt.$lte = new Date(endDate);
    }

    const logs = await ActivityLog.find(searchQuery)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Activity logs error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createLog = async (req, res) => {
  try {
    const { action, module, entityId, entityName, description } = req.body;
    const userId = req.userid; // Using userid from auth middleware
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!action || !module) {
      return res.status(400).json({ 
        success: false, 
        message: 'Action and module are required' 
      });
    }

    const log = new ActivityLog({
      user: userId,
      action,
      module,
      entityId,
      entityName,
      description,
      ipAddress
    });

    await log.save();
    await log.populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: log,
      message: 'Activity logged successfully'
    });
  } catch (err) {
    console.error('Create activity log error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLogStats = async (req, res) => {
  try {
    const stats = await ActivityLog.aggregate([
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const moduleStats = await ActivityLog.aggregate([
      {
        $group: {
          _id: "$module",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        actionStats: stats,
        moduleStats
      }
    });
  } catch (err) {
    console.error('Activity stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
