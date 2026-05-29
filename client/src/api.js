// --- Прогрес ---
function normalizeCourseProgress(c) {
  const tasksCompleted = (c.tasksCompleted || []).map(String);
  const totalTasks = Number(c.totalTasks) || 0;
  const theoryCompleted = Boolean(c.theoryCompleted);
  const quizCompleted = Boolean(c.quizCompleted);
  const quizScore = Number(c.quizScore) || 0;
  const fallbackProgress =
    (theoryCompleted ? 20 : 0) +
    (totalTasks > 0 ? Math.min(50, Math.round((tasksCompleted.length / totalTasks) * 50)) : 0) +
    (quizCompleted ? 30 : 0);

  return {
    title: c.title,
    theoryCompleted,
    tasksCompleted,
    quizCompleted,
    quizScore,
    totalTasks,
    progress: Number.isFinite(Number(c.progress)) ? Number(c.progress) : fallbackProgress,
  };
}

export async function saveTheoryProgress({ token, courseTitle, totalTasks }) {
  if (!token) throw new Error("Токен не переданий");

  const res = await fetch("/api/progress/theory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ courseTitle, totalTasks }),
  });

  if (!res.ok) throw new Error("Не вдалося зберегти прогрес теорії");
  return normalizeCourseProgress(await res.json());
}

export async function saveProgress({ token, courseTitle, taskId, totalTasks }) {
  if (!token) throw new Error("Токен не переданий");

  const res = await fetch("/api/progress/task", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      courseTitle, 
      taskId: String(taskId), 
      totalTasks 
    }),
  });

  if (!res.ok) throw new Error("Не вдалося зберегти прогрес");
  return normalizeCourseProgress(await res.json());
}

export async function saveQuizProgress({ token, courseTitle, quizScore, totalTasks }) {
  if (!token) throw new Error("Токен не переданий");

  const res = await fetch("/api/progress/quiz", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ courseTitle, quizScore, totalTasks }),
  });

  if (!res.ok) throw new Error("Не вдалося зберегти результат тесту");
  return normalizeCourseProgress(await res.json());
}

export async function fetchProgress(token) {
  if (!token) throw new Error("Токен не переданий");

  const res = await fetch("/api/progress", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Не вдалося отримати прогрес");

  const courses = await res.json();
  return courses.map(normalizeCourseProgress);
}

// --- Завдання ---
export async function fetchTasks(token, courseTitle) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const query = courseTitle ? `?courseTitle=${encodeURIComponent(courseTitle)}` : "";
  const res = await fetch(`/api/tasks${query}`, { headers });
  if (!res.ok) throw new Error("Не вдалося отримати список задач");
  return res.json();
}

export async function fetchTaskById(taskId, token, courseTitle) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const query = courseTitle ? `?courseTitle=${encodeURIComponent(courseTitle)}` : "";
  const res = await fetch(`/api/tasks/${taskId}${query}`, { headers });
  if (!res.ok) throw new Error("Не вдалося отримати задачу");
  return res.json();
}

// --- Виконання коду ---
export async function runCode({ sourceCode, stdin, languageId, token }) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch("/api/run", {
    method: "POST",
    headers,
    body: JSON.stringify({ sourceCode, stdin, languageId }),
  });

  if (!res.ok) throw new Error("Не вдалося виконати код");
  return res.json();
}

// --- Автоперевірка коду ---
export async function submitSolution({ taskId, sourceCode, token, courseTitle }) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch("/api/submissions", {
    method: "POST",
    headers,
    body: JSON.stringify({ taskId, sourceCode, courseTitle }),
  });

  if (!res.ok) throw new Error("Не вдалося перевірити рішення");
  return res.json();
}
