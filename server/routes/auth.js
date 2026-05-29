// server/routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/authMiddleware");

// --- РЕЄСТРАЦІЯ ---
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Будь ласка, заповніть усі поля" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Користувач вже існує" });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign(
      { id: user._id }, // ✅ ЄДИНИЙ payload
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Помилка серверу при реєстрації" });
  }
});

// --- ЛОГІН ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Будь ласка, введіть email та пароль" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Неправильний email або пароль" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Неправильний email або пароль" });
    }

    const token = jwt.sign(
      { id: user._id }, // ✅
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Помилка серверу при логіні" });
  }
});

// --- ОТРИМАТИ ПОТОЧНОГО КОРИСТУВАЧА ---
router.get("/me", auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
