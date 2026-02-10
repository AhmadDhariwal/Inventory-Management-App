const ActivityLog = require("../models/activitylog");

exports.logActivity = async ({
  userId,
  action,
  module,
  entityId,
  entityName,
  description,
  ip,
  organizationId
}) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      module,
      entityId,
      entityName,
      description,
      ipAddress: ip,
      organizationId
    });
  } catch (err) {
    console.error("Activity Log Error:", err.message);
  }
};
