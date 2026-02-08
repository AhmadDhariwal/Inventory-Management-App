const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "APPROVE", "REJECT", "RECEIVE", "DISPATCH"],
      required: true
    },
    module: {
      type: String,
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    entityName: {
      type: String
    },
    description: {
      type: String
    },
    ipAddress: {
      type: String
    },
    // Multi-tenant field
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: false, // Changed to false to prevent validation errors
      index: true
    }
  },
  { timestamps: true }
);

activityLogSchema.index({ organizationId: 1, createdAt: -1 });
activityLogSchema.index({ organizationId: 1, user: 1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
