import { fetchProgress, fetchTasks } from "./api";
import { courses, findCourseProgress } from "./courseData";

export const achievements = [
  {
    id: "first-theory",
    icon: "📘",
    title: "Перший конспект",
    description: "Завершити теорію будь-якого курсу.",
    isUnlocked: ({ courseDetails }) => courseDetails.some((course) => course.theoryCompleted),
  },
  {
    id: "first-task",
    icon: "✅",
    title: "Перша перемога",
    description: "Виконати першу практичну задачу.",
    isUnlocked: ({ courseDetails }) => (
      courseDetails.some((course) => course.tasksCompleted.length >= 1)
    ),
  },
  {
    id: "all-tasks-one-course",
    icon: "🧩",
    title: "Практикант",
    description: "Виконати всі задачі в одному курсі.",
    isUnlocked: ({ courseDetails }) => (
      courseDetails.some((course) => (
        course.totalTasks > 0 && course.tasksCompleted.length >= course.totalTasks
      ))
    ),
  },
  {
    id: "first-quiz",
    icon: "🎯",
    title: "Тест пройдено",
    description: "Завершити тест після будь-якого курсу.",
    isUnlocked: ({ courseDetails }) => courseDetails.some((course) => course.quizCompleted),
  },
  {
    id: "quiz-80",
    icon: "⭐",
    title: "Сильний результат",
    description: "Отримати 80% або більше за тест.",
    isUnlocked: ({ courseDetails }) => (
      courseDetails.some((course) => course.quizCompleted && course.quizScore >= 80)
    ),
  },
  {
    id: "basics-complete",
    icon: "🐍",
    title: "Основи засвоєно",
    description: "Завершити курс “Основи Python” на 100%.",
    isUnlocked: ({ courseDetails }) => (
      courseDetails.some((course) => course.title === "Основи Python" && course.progress >= 100)
    ),
  },
  {
    id: "conditionals-complete",
    icon: "🔀",
    title: "Майстер умов",
    description: "Завершити курс “Умовні оператори Python” на 100%.",
    isUnlocked: ({ courseDetails }) => (
      courseDetails.some((course) => (
        course.title === "Умовні оператори Python" && course.progress >= 100
      ))
    ),
  },
  {
    id: "all-theory",
    icon: "📚",
    title: "Теоретик",
    description: "Завершити теорію в усіх доступних курсах.",
    isUnlocked: ({ courseDetails }) => (
      courseDetails.length > 0 && courseDetails.every((course) => course.theoryCompleted)
    ),
  },
  {
    id: "all-courses",
    icon: "🏆",
    title: "Повний курс",
    description: "Завершити всі доступні курси на 100%.",
    isUnlocked: ({ courseDetails }) => (
      courseDetails.length > 0 && courseDetails.every((course) => course.progress >= 100)
    ),
  },
];

export async function loadAchievementCourseDetails(token) {
  const [progressCourses, taskLists] = await Promise.all([
    fetchProgress(token),
    Promise.all(courses.map((course) => fetchTasks(token, course.title))),
  ]);

  return courses.map((course, index) => {
    const progressCourse = findCourseProgress(progressCourses, course);
    const totalTasks = taskLists[index]?.length || progressCourse?.totalTasks || 0;

    return {
      title: course.title,
      theoryCompleted: Boolean(progressCourse?.theoryCompleted),
      tasksCompleted: progressCourse?.tasksCompleted || [],
      quizCompleted: Boolean(progressCourse?.quizCompleted),
      quizScore: Number(progressCourse?.quizScore) || 0,
      progress: Math.round(Number(progressCourse?.progress) || 0),
      totalTasks,
    };
  });
}

export function getAchievementStates(courseDetails) {
  return achievements.map((achievement) => ({
    ...achievement,
    unlocked: achievement.isUnlocked({ courseDetails }),
  }));
}

function getStorageKey(userId) {
  return `notifiedAchievements:${userId || "guest"}`;
}

function getNotifiedAchievementIds(userId) {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(userId)) || "[]");
  } catch (err) {
    return [];
  }
}

function saveNotifiedAchievementIds(userId, ids) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(ids));
}

export async function notifyNewAchievements({ token, userId }) {
  if (!token) return [];

  const courseDetails = await loadAchievementCourseDetails(token);
  const unlockedAchievements = getAchievementStates(courseDetails)
    .filter((achievement) => achievement.unlocked);
  const notifiedIds = getNotifiedAchievementIds(userId);
  const newAchievements = unlockedAchievements
    .filter((achievement) => !notifiedIds.includes(achievement.id));

  if (newAchievements.length === 0) return [];

  saveNotifiedAchievementIds(userId, [
    ...new Set([...notifiedIds, ...newAchievements.map((achievement) => achievement.id)]),
  ]);

  newAchievements.forEach((achievement, index) => {
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("achievementUnlocked", {
        detail: achievement,
      }));
    }, index * 700);
  });

  return newAchievements;
}

export async function syncUnlockedAchievements({ token, userId }) {
  if (!token) return [];

  const courseDetails = await loadAchievementCourseDetails(token);
  const unlockedIds = getAchievementStates(courseDetails)
    .filter((achievement) => achievement.unlocked)
    .map((achievement) => achievement.id);
  const notifiedIds = getNotifiedAchievementIds(userId);
  const mergedIds = [...new Set([...notifiedIds, ...unlockedIds])];

  saveNotifiedAchievementIds(userId, mergedIds);

  return mergedIds;
}
