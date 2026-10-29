const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    lead: String,
    status: {
      type: String,
      default: "Todo",
    },
    dueDate: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);