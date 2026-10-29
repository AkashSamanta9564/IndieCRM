const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: String,
    company: String,
    status: {
      type: String,
      default: "New Lead",
    },
    notes: String,
    tags: {
      type: [String],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", LeadSchema);