const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },

    
    courses: [
      {
        title: { type: String, required: true },
        theoryCompleted: { type: Boolean, default: false },
        tasksCompleted: { type: [String], default: [] }, // виконані задачі
        quizCompleted: { type: Boolean, default: false },
        quizScore: { type: Number, default: 0 },
        progress: { type: Number, default: 0 }, // відсоток виконання
        totalTasks: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

// hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ✅ JWT
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = mongoose.model("User", userSchema);
