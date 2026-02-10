const ActivityLog = require("../models/activitylog");
const User = require("../models/user");

exports.getLogs = async (req, res) => {
  try {
    const { userid, role, organizationId } = req;
    const {
      page = 1,
      limit = 10,
      search = "",
      action = "",
      module = "",
      startDate = "",
      endDate = "",
      targetUserId = ""
    } = req.query;

    const query = { organizationId };

    let associatedUserIds = [userid];
    if (role === 'admin') {
      const createdUsers = await User.find({ createdBy: userid }).select('_id');
      associatedUserIds = [...associatedUserIds, ...createdUsers.map(u => u._id)];
    }

    if (targetUserId) {
      if (associatedUserIds.map(id => id.toString()).includes(targetUserId)) {
        query.user = targetUserId;
      } else {
        return res.status(403).json({ success: false, message: 'Unauthorized to view logs for this user' });
      }
    } else {
      query.user = { $in: associatedUserIds };
    }

    if (action && action.trim() !== '') {
      query.action = action.trim();
    }

    if (module && module.trim() !== '') {
      query.module = module.trim();
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search && search.trim() !== '') {
      const matchingUsers = await User.find({
        organizationId,
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      }).select('_id');

      query.$or = [
        { entityName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { user: { $in: matchingUsers.map(u => u._id) } }
      ];
    }

    const logs = await ActivityLog.find(query)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(query);
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
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { userid, role } = req;

    const log = await ActivityLog.findById(id);

    if (!log) {
      return res.status(404).json({ success: false, message: 'Activity log not found' });
    }

    if (role !== 'admin' && log.user.toString() !== userid) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this log' });
    }

    await ActivityLog.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Activity log deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createLog = async (req, res) => {
  try {
    const { action, module, entityId, entityName, description } = req.body;
    const userId = req.userid;
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
      ipAddress,
      organizationId: req.organizationId
    });

    await log.save();
    await log.populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: log,
      message: 'Activity logged successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLogStats = async (req, res) => {
  try {
    const { userid, role, organizationId } = req;

    const statsQuery = { organizationId };

    if (role !== 'admin') {
      statsQuery.user = userid;
    } else {
      const createdUsers = await User.find({ createdBy: userid }).select('_id');
      const associatedUserIds = [userid, ...createdUsers.map(u => u._id)];
      statsQuery.user = { $in: associatedUserIds };
    }

    const stats = await ActivityLog.aggregate([
      { $match: statsQuery },
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 }
        }
      }
    ]);

    const moduleStats = await ActivityLog.aggregate([
      { $match: statsQuery },
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
    res.status(500).json({ success: false, message: err.message });
  }
};
