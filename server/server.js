require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const progressRoutes = require("./routes/progress");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;
const JUDGE0_URL = process.env.JUDGE0_URL;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/progress", authMiddleware, progressRoutes); // Тепер токен обов'язково перевіряється

// --- Tasks + Judge0 ---
const tasks = [
  {
    id: 1,
    courseTitle: "Основи Python",
    title: "Сума двох чисел",
    description: "Зчитай два цілі числа та виведи їх суму.",
    languageId: 71,
    tests: [
      { input: "1 2", expected: "3" },
      { input: "10 20", expected: "30" },
      { input: "-5 8", expected: "3" },
    ],
    inputExample: "1 2",
    outputExample: "3",
  },
  {
    id: 2,
    courseTitle: "Основи Python",
    title: "Квадрат числа",
    description: "Зчитай ціле число та виведи його квадрат.",
    languageId: 71,
    tests: [
      { input: "4", expected: "16" },
      { input: "-3", expected: "9" },
      { input: "0", expected: "0" },
    ],
    inputExample: "4",
    outputExample: "16",
  },
  {
    id: 10,
    courseTitle: "Умовні оператори Python",
    title: "Парне чи непарне",
    description: 'Зчитайте число. Виведіть "Парне" або "Непарне".',
    languageId: 71,
    tests: [
      { input: "2", expected: "Парне" },
      { input: "5", expected: "Непарне" },
      { input: "10", expected: "Парне" },
    ],
    inputExample: "2",
    outputExample: "Парне",
  },
  {
    id: 11,
    courseTitle: "Умовні оператори Python",
    title: "Більше число",
    description: "Зчитати два числа. Вивести більше з них.",
    languageId: 71,
    tests: [
      { input: "2 8", expected: "8" },
      { input: "10 3", expected: "10" },
      { input: "5 5", expected: "5" },
    ],
    inputExample: "2 8",
    outputExample: "8",
  },
  {
    id: 12,
    courseTitle: "Умовні оператори Python",
    title: "Оцінка студента",
    description: "Зчитати бал. 90+ → A, 70-89 → B, 50-69 → C, нижче → F.",
    languageId: 71,
    tests: [
      { input: "95", expected: "A" },
      { input: "72", expected: "B" },
      { input: "55", expected: "C" },
      { input: "20", expected: "F" },
    ],
    inputExample: "95",
    outputExample: "A",
  },
  {
    id: 13,
    courseTitle: "Умовні оператори Python",
    title: "Калькулятор",
    description: "Користувач вводить a b operation. Вивести результат операції.",
    languageId: 71,
    tests: [
      { input: "4 2 +", expected: "6" },
      { input: "4 2 -", expected: "2" },
      { input: "4 2 *", expected: "8" },
      { input: "4 2 /", expected: "2" },
    ],
    inputExample: "4 2 +",
    outputExample: "6",
  },
];

function isCourseMatch(task, courseTitle) {
  if (!courseTitle) return true;
  if (courseTitle === "Python Basics") return task.courseTitle === "Основи Python";
  return task.courseTitle === courseTitle;
}

function normalizeOutput(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/\r\n/g, "\n").trim();
}

function encodeJudgeValue(value) {
  return Buffer.from(value || "", "utf8").toString("base64");
}

function isBase64Value(value) {
  if (typeof value !== "string" || value.length === 0) return false;
  return /^[A-Za-z0-9+/]+={0,2}$/.test(value) && value.length % 4 === 0;
}

function decodeJudgeValue(value) {
  if (value === null || value === undefined || !isBase64Value(value)) return value;
  return Buffer.from(value, "base64").toString("utf8");
}

function decodeJudgeResponse(data) {
  return {
    ...data,
    stdout: decodeJudgeValue(data.stdout),
    stderr: decodeJudgeValue(data.stderr),
    compile_output: decodeJudgeValue(data.compile_output),
    message: decodeJudgeValue(data.message),
  };
}

// Tasks API
app.get("/api/tasks", (req, res) => {
  const safeTasks = tasks
    .filter((task) => isCourseMatch(task, req.query.courseTitle))
    .map(({ tests, ...rest }) => rest);
  res.json(safeTasks);
});

app.get("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id && isCourseMatch(t, req.query.courseTitle));
  if (!task) return res.status(404).json({ message: "Задачу не знайдено" });
  const { tests, ...rest } = task;
  res.json(rest);
});

// Run code
app.post("/api/run", async (req, res) => {
  try {
    const { sourceCode, stdin, languageId } = req.body;

    const judgeRes = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`,
      {
        source_code: encodeJudgeValue(sourceCode),
        language_id: languageId,
        stdin: encodeJudgeValue(stdin || ""),
      }
    );

    res.json(decodeJudgeResponse(judgeRes.data));
  } catch (error) {
    console.error("Run code error:", error.response?.data || error.message);
    res.status(500).json({ message: "Помилка при запуску коду" });
  }
});

// Submit solution
app.post("/api/submissions", async (req, res) => {
  try {
    const { taskId, sourceCode, courseTitle } = req.body;
    const task = tasks.find((t) => t.id === Number(taskId) && isCourseMatch(t, courseTitle));
    if (!task) return res.status(404).json({ message: "Задачу не знайдено" });

    let passedCount = 0;
    let results = [];

    for (let test of task.tests) {
      const judgeRes = await axios.post(
        `${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`,
        {
          source_code: encodeJudgeValue(sourceCode),
          language_id: task.languageId,
          stdin: encodeJudgeValue(test.input),
        }
      );

      const decodedJudgeData = decodeJudgeResponse(judgeRes.data);
      const output = normalizeOutput(decodedJudgeData.stdout);
      const expected = normalizeOutput(test.expected);
      const passed = output === expected;
      if (passed) passedCount++;

      results.push({
        testNumber: task.tests.indexOf(test) + 1,
        input: test.input,
        expected,
        actual: output,
        passed,
      });
    }

    res.json({
      passed: passedCount === task.tests.length,
      passedCount,
      totalTests: task.tests.length,
      results,
    });
  } catch (err) {
    console.error("Submit solution error:", err.message);
    res.status(500).json({ message: "Помилка перевірки" });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
