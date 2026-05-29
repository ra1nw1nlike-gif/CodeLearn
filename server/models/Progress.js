const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: String,
      required: true,
      default: "python-basics",
    },
    completedTasks: [
      {
        type: Number, // taskId
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", ProgressSchema);
