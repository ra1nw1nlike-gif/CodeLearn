import React, { useEffect, useState, useContext } from "react";
import {
  fetchTasks,
  fetchTaskById,
  submitSolution,
  runCode,
  saveProgress,
  fetchProgress
} from "../api";
import { AuthContext } from "../context/AuthContext";
import "../tasks.css";
import "../buttons.css";
import { useLocation, useNavigate } from "react-router-dom";
import {
  findCourseProgress,
  getCourseByTitle,
  getCoursePath,
  getCourseTitleFromLocation,
} from "../courseData";
import { notifyNewAchievements } from "../achievements";

function getSyntaxHint(errorText) {
  if (!errorText) return null;
  if (errorText.includes("unexpected EOF"))
    return "Схоже, ви не закрили дужку або лапки. Перевірте, чи всі дужки () та лапки закриті.";
  if (errorText.includes("IndentationError"))
    return "Помилка відступів. У Python важливо, щоб відступи були однаковими.";
  if (errorText.includes("SyntaxError"))
    return "У коді є синтаксична помилка. Перевірте правильність дужок, лапок та двокрапок.";
  return "У коді є помилка синтаксису. Уважно перевірте написання коду.";
}

function getConditionalHint(task, actual, expected, input) {
  if (!task) return null;

  const taskId = Number(task.id);
  const actualText = String(actual || "").trim();
  const expectedText = String(expected || "").trim();
  const tokens = (input || "").trim().split(/\s+/).filter(Boolean);

  if (![10, 11, 12, 13].includes(taskId)) return null;

  if (!actualText) {
    return "Програма нічого не вивела. Перевірте, що у потрібній гілці if/else є print().";
  }

  if (actualText.split(/\s+/).length > 1 && taskId !== 13) {
    return "Виведіть тільки одну відповідь без зайвого тексту, бо автоперевірка порівнює точний результат.";
  }

  if (taskId === 10) {
    const n = Number(tokens[0]);

    if (!Number.isNaN(n)) {
      const correctParity = n % 2 === 0 ? "Парне" : "Непарне";
      const oppositeParity = correctParity === "Парне" ? "Непарне" : "Парне";

      if (actualText === oppositeParity) {
        return "Схоже, умова переплутана. Парне число має остачу 0 при діленні на 2: n % 2 == 0.";
      }
    }

    return 'Для цієї задачі зчитайте n, перевірте n % 2 == 0 і виведіть рівно "Парне" або "Непарне".';
  }

  if (taskId === 11) {
    const a = Number(tokens[0]);
    const b = Number(tokens[1]);
    const actualNum = Number(actualText);
    const expectedNum = Number(expectedText);

    if (!Number.isNaN(a) && !Number.isNaN(b) && !Number.isNaN(actualNum)) {
      const smaller = Math.min(a, b);

      if (actualNum === smaller && a !== b) {
        return "Схоже, ви виводите менше число. Перевірте знак порівняння у if.";
      }

      if (a === b && actualNum !== expectedNum) {
        return "Коли числа однакові, можна вивести будь-яке з них. Для 5 5 очікується 5.";
      }
    }

    return "Порівняйте два числа: якщо a >= b, виведіть a, інакше виведіть b.";
  }

  if (taskId === 12) {
    const score = Number(tokens[0]);

    if (!Number.isNaN(score)) {
      if (score >= 90 && actualText !== "A") {
        return "Для балів 90 і вище має бути A. Починайте перевірку з найбільшої межі: if score >= 90.";
      }

      if (score >= 70 && score < 90 && actualText !== "B") {
        return "Для балів від 70 до 89 має бути B. Перевірте умову elif score >= 70.";
      }

      if (score >= 50 && score < 70 && actualText !== "C") {
        return "Для балів від 50 до 69 має бути C. Перевірте умову elif score >= 50.";
      }

      if (score < 50 && actualText !== "F") {
        return "Для балів нижче 50 має бути F. Цей випадок зручно залишити в else.";
      }
    }

    return "Перевіряйте межі у порядку спадання: >= 90, потім >= 70, потім >= 50, інакше F.";
  }

  if (taskId === 13) {
    const a = Number(tokens[0]);
    const b = Number(tokens[1]);
    const operation = tokens[2];
    const actualNum = Number(actualText);
    const expectedNum = Number(expectedText);

    if (operation === "/" && actualText.includes(".")) {
      return "Для ділення у цих тестах очікується результат без .0. Можна використати // або перетворити результат на int, якщо ділення без остачі.";
    }

    if (!Number.isNaN(a) && !Number.isNaN(b) && !Number.isNaN(actualNum) && !Number.isNaN(expectedNum)) {
      const operations = {
        "+": a + b,
        "-": a - b,
        "*": a * b,
        "/": b !== 0 ? a / b : null,
      };

      const usedOperation = Object.keys(operations).find((op) => operations[op] === actualNum);

      if (usedOperation && usedOperation !== operation) {
        return `Операція у вхідних даних: ${operation}. Схоже, виконується ${usedOperation} замість потрібної операції.`;
      }
    }

    return "Зчитайте a, b і operation. Далі перевірте operation через if/elif: '+', '-', '*', '/'.";
  }

  return null;
}

function getHint(actual, expected, input, task) {
  const conditionalHint = getConditionalHint(task, actual, expected, input);
  if (conditionalHint) return conditionalHint;

  const actualNum = Number(actual);
  const expectedNum = Number(expected);
  const tokens = (input || "").trim().split(/\s+/).filter(Boolean);

  if (!isNaN(actualNum) && !isNaN(expectedNum)) {
    if (tokens.length === 1) {
      const n = Number(tokens[0]);
      if (!isNaN(n)) {
        if (actualNum === n + n) return "Схоже, ви додаєте число саме до себе. Для квадрату потрібно n * n.";
        if (actualNum === n * 2) return "Схоже, ви множите число на 2. Для квадрату потрібно n * n.";
        if (actualNum === n * 3) return "Схоже, ви множите число на 3. Перевірте умову.";
        if (actualNum === n - n) return "Схоже, ви віднімаєте число від себе. Перевірте формулу.";
        if (actualNum < expectedNum) return "Ваш результат менший за очікуваний.";
        if (actualNum > expectedNum) return "Ваш результат більший за очікуваний.";
      }
    }
    if (tokens.length === 2) {
      const x = Number(tokens[0]);
      const y = Number(tokens[1]);
      if (!isNaN(x) && !isNaN(y)) {
        const sum = x + y;
        const prod = x * y;
        const diff1 = x - y;
        const diff2 = y - x;
        if (actualNum === prod) return "Схоже, ви перемножили числа замість додавання (+).";
        if (actualNum === diff1 || actualNum === diff2) return "Схоже, ви віднімаєте замість додавання.";
        if (actualNum === sum + x || actualNum === sum + y) return "Схоже, ви додаєте число двічі.";
        if (actualNum < sum) return "Ваш результат менший за суму чисел.";
        if (actualNum > sum) return "Ваш результат більший за суму чисел.";
      }
    }
    if (actualNum < expectedNum) return "Ваш результат менший за очікуваний.";
    if (actualNum > expectedNum) return "Ваш результат більший за очікуваний.";
  }

  if (typeof actual === "string" && actual.trim().split(/\s+/).length > 1)
    return "Схоже, ви вивели зайві числа або текст.";

  return "Перевірте формулу обчислення та формат виводу.";
}

function TasksPage({ darkMode }) {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const course = getCourseByTitle(getCourseTitleFromLocation(location));

  const [tasks, setTasks] = useState([]);
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [sourceCode, setSourceCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [runResult, setRunResult] = useState(null);
  const [checkResult, setCheckResult] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingRun, setLoadingRun] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [error, setError] = useState(null);

  const stdoutTrimmed = (runResult?.stdout || "").trim();
  const exampleOutputTrimmed = (selectedTask?.outputExample || "").trim();
  const canCompareExample = !!selectedTask?.outputExample;
  const exampleIsCorrect = canCompareExample && stdoutTrimmed === exampleOutputTrimmed;

  // --- Завантаження задач ---
  useEffect(() => {
    if (!user) return;
    async function loadTasks() {
      try {
        setLoadingTasks(true);
        setError(null);
        const data = await fetchTasks(token, course.title);
        setTasks(data);
        setSelectedTaskId(null);
        setSelectedTask(null);
        setRunResult(null);
        setCheckResult(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingTasks(false);
      }
    }
    loadTasks();
  }, [user, token, course.title]);

  // --- Завантаження прогресу ---
  useEffect(() => {
    if (!user) return;
    async function loadProgress() {
      try {
        const courses = await fetchProgress(token);
        const progressCourse = findCourseProgress(courses, course) || null;
        setCompletedTaskIds(progressCourse?.tasksCompleted || []);
      } catch (err) {
        console.error("Помилка завантаження прогресу:", err);
      }
    }
    loadProgress();
  }, [user, token, course]);

  // --- Завантаження конкретної задачі ---
  useEffect(() => {
    if (!selectedTaskId) return;
    async function loadTask() {
      try {
        setError(null);
        const data = await fetchTaskById(selectedTaskId, token, course.title);
        setSelectedTask(data);
        setSourceCode("");
        setStdin(data.inputExample || "");
        setRunResult(null);
        setCheckResult(null);
      } catch (err) {
        setError(err.message);
      }
    }
    loadTask();
  }, [selectedTaskId, token, course.title]);

  // --- Запуск коду ---
  async function handleRun(e) {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      setLoadingRun(true);
      setError(null);
      setRunResult(null);
      const resp = await runCode({
        sourceCode,
        stdin,
        languageId: selectedTask.languageId,
        token,
      });
      setRunResult(resp);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingRun(false);
    }
  }

  // --- Перевірка коду ---
  async function handleCheck(e) {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      setLoadingCheck(true);
      setError(null);
      setCheckResult(null);
      const resp = await submitSolution({
        taskId: selectedTask.id,
        sourceCode,
        courseTitle: course.title,
        token,
      });
      setCheckResult(resp);

      // ✅ Якщо рішення пройшло тести, зберігаємо прогрес
      if (resp.passed && token) {
        try {
          await saveProgress({
            token,
            courseTitle: course.title,
            taskId: String(selectedTask.id),
            totalTasks: tasks.length || 1
          });

          // 🔹 Завантажуємо оновлений прогрес із БД
          const courses = await fetchProgress(token);
          const progressCourse = findCourseProgress(courses, course) || null;
          const updatedCompletedTaskIds = progressCourse?.tasksCompleted || [];
          setCompletedTaskIds(updatedCompletedTaskIds);

          // 🔹 Викликаємо подію для ProfilePage
          window.dispatchEvent(new Event("progressUpdated"));
          notifyNewAchievements({ token, userId: user._id }).catch((err) => {
            console.error("Помилка перевірки досягнень:", err);
          });

          if (tasks.length > 0 && updatedCompletedTaskIds.length >= tasks.length) {
            navigate(getCoursePath("/quiz", course.title), { state: { courseTitle: course.title } });
          }

        } catch (err) {
          console.error("Помилка збереження прогресу:", err);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCheck(false);
    }
  }

  // Курс вважається завершеним автоматично, коли виконані всі задачі.

  if (!user) {
    return <p style={{ padding: "2rem" }}>Будь ласка, увійдіть, щоб бачити задачі</p>;
  }

  return (
    <div className={`tasks-page ${darkMode ? "dark" : "light"}`} style={{ position: "relative", minHeight: "100vh" }}>
      <div className="tasks-sidebar">
        <h2>Задачі</h2>
        {loadingTasks && <p>Завантаження...</p>}
        {error && <p className="error-text">{error}</p>}
        <ul className="tasks-list">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`tasks-list-item ${selectedTaskId === task.id ? "selected" : ""} ${completedTaskIds.includes(String(task.id)) ? "completed" : ""}`}
              onClick={() => setSelectedTaskId(task.id)}
            >
              {task.title} {completedTaskIds.includes(String(task.id)) && "✅"}
            </li>
          ))}
        </ul>
      </div>

      <div className="tasks-main">
        {selectedTask ? (
          <>
            <h2>{selectedTask.title}</h2>

            <div className="task-card">
              <h3>📘 Завдання</h3>
              <p>{selectedTask.description}</p>
            </div>

            <div className="task-editor-and-results">
              <div className="task-editor-column">
                <form>
                  <div className="task-card task-stdin-card">
                    <label>
                      Ввід (stdin):
                      <input type="text" value={stdin} readOnly className="stdin-input" />
                    </label>
                  </div>

                  <div className="task-card">
                    <label>
                      Код:
                      <textarea
                        value={sourceCode}
                        onChange={(e) => setSourceCode(e.target.value)}
                        className="code-editor"
                      />
                    </label>
                  </div>

                  <div className="task-buttons">
                    <button type="button" onClick={handleRun} disabled={loadingRun || loadingCheck} className="fancy-button">
                      {loadingRun ? "Запускаю..." : "▶ Запустити (приклад з умови)"}
                    </button>
                    <button type="button" onClick={handleCheck} disabled={loadingRun || loadingCheck} className="fancy-button">
                      {loadingCheck ? "Перевіряю..." : "✓ Перевірити (тести)"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="task-results-column">
                <div className="task-results">
                  <h3>Результати</h3>
                  <div className="task-results-grid">

                    <div className="task-result-block-wrapper">
                      <h4>👤 Перевірка на прикладі з умови</h4>
                      <div className="task-result-inner">
                        {!runResult ? (
                          <p>Натисніть “Запустити (приклад з умови)”, щоб побачити результат.</p>
                        ) : runResult.compile_output ? (
                          <div className="error">
                            <p className="error-text">🔴 Синтаксична помилка в коді</p>
                            <p className="error-hint">{getSyntaxHint(runResult.compile_output)}</p>
                            <pre className="task-pre">{runResult.compile_output}</pre>
                          </div>
                        ) : runResult.stderr ? (
                          <div className="error">
                            <p className="error-text">🔴 Помилка виконання</p>
                            <pre className="task-pre">{runResult.stderr}</pre>
                          </div>
                        ) : (
                          <div className="success">
                            <pre className="task-pre">{runResult.stdout || " "}</pre>
                            {canCompareExample && (
                              exampleIsCorrect ? (
                                <div className="hint-success">🟢 Результат правильний для прикладу!</div>
                              ) : (
                                <div className="hint-error">
                                  🔴 Результат неправильний
                                  <p><strong>Очікувано:</strong> {selectedTask.outputExample}</p>
                                  <p><strong>Отримано:</strong> {stdoutTrimmed || " "}</p>
                                  <p>{getHint(stdoutTrimmed, exampleOutputTrimmed, stdin, selectedTask)}</p>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="task-result-block-wrapper">
                      <h4>✅ Автоперевірка платформи</h4>
                      <div className="task-result-inner">
                        {!checkResult ? (
                          <p>Натисніть “Перевірити (тести)” щоб запустити автоперевірку.</p>
                        ) : (
                          <>
                            {checkResult.passed ? (
                              <div className="hint-success">🟢 Рішення правильне!</div>
                            ) : (
                              <div className="hint-error">🔴 Рішення має помилки</div>
                            )}
                            <p>Пройдено тестів: <strong>{checkResult.passedCount}</strong> з <strong>{checkResult.totalTests}</strong></p>
                            <ul className="task-tests-list">
                              {checkResult.results?.map(t => (
                                <li key={t.testNumber}>
                                  {t.passed ? <span className="test-pass">✔ Тест {t.testNumber} пройдено</span> :
                                  <span className="test-fail">✘ Тест {t.testNumber} НЕ пройдено</span>}
                                  <br />
                                  <span className="test-note">(це автотест платформи)</span>
                                  <br />
                                  <strong>Вхідні дані тесту:</strong> {t.input}<br />
                                  <strong>Очікувано:</strong> {t.expected}<br />
                                  <strong>Отримано:</strong> {t.actual}
                                  {!t.passed && (
                                    <>
                                      <br />
                                      <span className="test-note">
                                        Підказка: {getHint(t.actual, t.expected, t.input, selectedTask)}
                                      </span>
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p>Оберіть задачу зліва.</p>
        )}
      </div>

    </div>
  );
}

export default TasksPage;
