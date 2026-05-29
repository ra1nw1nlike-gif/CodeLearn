const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

const DEFAULT_COURSE_TITLE = "Основи Python";
const COURSE_ALIASES = {
  "Основи Python": ["Python Basics"],
  "Умовні оператори Python": [],
};

function normalizeCourseTitle(courseTitle) {
  const requestedTitle = courseTitle || DEFAULT_COURSE_TITLE;
  const canonicalTitle = Object.keys(COURSE_ALIASES).find((title) => (
    title === requestedTitle || COURSE_ALIASES[title].includes(requestedTitle)
  ));

  return canonicalTitle || requestedTitle;
}

function isCourseTitleMatch(storedTitle, requestedTitle) {
  const normalizedStoredTitle = normalizeCourseTitle(storedTitle);
  const normalizedRequestedTitle = normalizeCourseTitle(requestedTitle);

  return normalizedStoredTitle === normalizedRequestedTitle;
}

function getCourseTitle(body) {
  return normalizeCourseTitle(body.courseTitle || body.title || DEFAULT_COURSE_TITLE);
}

function ensureCourse(user, courseTitle) {
  const normalizedTitle = normalizeCourseTitle(courseTitle);
  let course = user.courses.find(c => isCourseTitleMatch(c.title, normalizedTitle));

  if (course && course.title !== normalizedTitle) {
    course.title = normalizedTitle;
  }

  if (!course) {
    user.courses.push({
      title: normalizedTitle,
      theoryCompleted: false,
      tasksCompleted: [],
      quizCompleted: false,
      quizScore: 0,
      progress: 0,
      totalTasks: 0,
    });
    course = user.courses[user.courses.length - 1];
  }

  if (typeof course.theoryCompleted !== "boolean") {
    course.theoryCompleted = false;
  }

  if (!Array.isArray(course.tasksCompleted)) {
    course.tasksCompleted = [];
  }

  if (typeof course.quizCompleted !== "boolean") {
    course.quizCompleted = false;
  }

  if (typeof course.quizScore !== "number") {
    course.quizScore = Number(course.quizScore) || 0;
  }

  if (typeof course.totalTasks !== "number") {
    course.totalTasks = Number(course.totalTasks) || 0;
  }

  if (typeof course.progress !== "number") {
    course.progress = Number(course.progress) || 0;
  }

  return course;
}

function calculateProgress(course, totalTasksFromRequest) {
  const completedTasks = course.tasksCompleted?.length || 0;
  const requestedTotalTasks = Number(totalTasksFromRequest || course.totalTasks || 0);
  const totalTasks = requestedTotalTasks > 0 ? requestedTotalTasks : completedTasks;

  const theoryProgress = course.theoryCompleted ? 20 : 0;
  const tasksProgress = totalTasks > 0
    ? Math.min(50, Math.round((completedTasks / totalTasks) * 50))
    : 0;
  const quizProgress = course.quizCompleted ? 30 : 0;

  return Math.min(100, theoryProgress + tasksProgress + quizProgress);
}

function updateCourseProgress(course, totalTasks) {
  if (totalTasks && Number(totalTasks) > 0) {
    course.totalTasks = Number(totalTasks);
  }

  course.progress = calculateProgress(course, totalTasks);
}

function formatCourse(course) {
  const plain = course.toObject ? course.toObject() : course;
  const tasksCompleted = (plain.tasksCompleted || []).map(String);
  const totalTasks = Number(plain.totalTasks) || tasksCompleted.length || 0;
  const normalizedTitle = normalizeCourseTitle(plain.title);
  const normalizedCourse = {
    ...plain,
    title: normalizedTitle,
    tasksCompleted,
    totalTasks,
    theoryCompleted: Boolean(plain.theoryCompleted),
    quizCompleted: Boolean(plain.quizCompleted),
  };

  return {
    _id: plain._id,
    title: normalizedTitle,
    theoryCompleted: Boolean(plain.theoryCompleted),
    tasksCompleted,
    quizCompleted: Boolean(plain.quizCompleted),
    quizScore: Number(plain.quizScore) || 0,
    progress: calculateProgress(normalizedCourse, totalTasks),
    totalTasks,
  };
}

async function getUser(req, res) {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404).json({ message: "Користувача не знайдено" });
    return null;
  }

  return user;
}

async function saveTaskProgress(req, res) {
  const { taskId, totalTasks } = req.body;
  const courseTitle = getCourseTitle(req.body);

  try {
    const user = await getUser(req, res);
    if (!user) return;

    const course = ensureCourse(user, courseTitle);
    const taskIdStr = String(taskId);

    if (taskId && !course.tasksCompleted.includes(taskIdStr)) {
      course.tasksCompleted.push(taskIdStr);
    }

    updateCourseProgress(course, totalTasks);

    await user.save();

    res.json(formatCourse(course));
  } catch (err) {
    console.error("Progress save error:", err);
    res.status(500).json({ message: "Помилка збереження прогресу задачі" });
  }
}

// ✅ ЗБЕРЕГТИ ВИКОНАНУ ТЕОРІЮ
router.post("/theory", auth, async (req, res) => {
  const { totalTasks } = req.body;
  const courseTitle = getCourseTitle(req.body);

  try {
    const user = await getUser(req, res);
    if (!user) return;

    const course = ensureCourse(user, courseTitle);
    course.theoryCompleted = true;

    updateCourseProgress(course, totalTasks);

    await user.save();

    res.json(formatCourse(course));
  } catch (err) {
    console.error("Theory progress save error:", err);
    res.status(500).json({ message: "Помилка збереження прогресу теорії" });
  }
});

// ✅ ЗБЕРЕГТИ ВИКОНАНУ ЗАДАЧУ
router.post("/task", auth, saveTaskProgress);

// ✅ Сумісність зі старим POST /api/progress
router.post("/", auth, saveTaskProgress);

// ✅ ЗБЕРЕГТИ РЕЗУЛЬТАТ ТЕСТУ
router.post("/quiz", auth, async (req, res) => {
  const { quizScore, totalTasks } = req.body;
  const courseTitle = getCourseTitle(req.body);

  try {
    const user = await getUser(req, res);
    if (!user) return;

    const course = ensureCourse(user, courseTitle);
    course.quizCompleted = true;
    course.quizScore = Math.max(0, Math.min(100, Math.round(Number(quizScore) || 0)));

    updateCourseProgress(course, totalTasks);

    await user.save();

    res.json(formatCourse(course));
  } catch (err) {
    console.error("Quiz progress save error:", err);
    res.status(500).json({ message: "Помилка збереження результату тесту" });
  }
});

// ✅ ОТРИМАТИ ПРОГРЕС
router.get("/", auth, async (req, res) => {
  try {
    const user = await getUser(req, res);
    if (!user) return;

    res.json(user.courses.map(formatCourse));
  } catch (err) {
    console.error("Progress get error:", err);
    res.status(500).json({ message: "Помилка отримання прогресу" });
  }
});

module.exports = router;
