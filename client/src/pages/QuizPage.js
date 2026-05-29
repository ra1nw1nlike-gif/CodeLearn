import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { fetchTasks, saveQuizProgress } from "../api";
import { notifyNewAchievements } from "../achievements";
import {
  getCourseByTitle,
  getCourseTitleFromLocation,
} from "../courseData";
import "../tasks.css";
import "../buttons.css";

function QuizPage({ darkMode }) {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const course = getCourseByTitle(getCourseTitleFromLocation(location));
  const quizQuestions = course.quiz;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState(Array(quizQuestions.length).fill(null));
  const [result, setResult] = useState(null);
  const [totalTasks, setTotalTasks] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const currentQuestion = quizQuestions[currentQuestionIndex] || quizQuestions[0];

  const colors = {
    bg: darkMode ? "#020617" : "#f8fafc",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    text: darkMode ? "#e5e7eb" : "#020617",
    subtext: darkMode ? "#cbd5e1" : "#475569",
    border: darkMode ? "#334155" : "#e5e7eb",
    optionBg: darkMode ? "#0f172a" : "#f8fafc",
  };

  useEffect(() => {
    if (!user || !token) return;

    async function loadTasksCount() {
      try {
        const tasks = await fetchTasks(token, course.title);
        setTotalTasks(tasks?.length || 0);
      } catch (err) {
        console.error("Помилка завантаження кількості задач:", err);
      }
    }

    loadTasksCount();
  }, [user, token, course.title]);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers(Array(quizQuestions.length).fill(null));
    setResult(null);
    setError(null);
  }, [quizQuestions.length, course.title]);

  async function handleNextQuestion() {
    if (selectedAnswer === null) return;

    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(updatedAnswers[nextIndex]);
      return;
    }

    const correctAnswers = updatedAnswers.reduce((count, answer, index) => {
      return answer === quizQuestions[index].correctIndex ? count + 1 : count;
    }, 0);
    const percent = Math.round((correctAnswers / quizQuestions.length) * 100);

    setSaving(true);
    setError(null);
    setResult({ correctAnswers, percent });

    try {
      await saveQuizProgress({
        token,
        courseTitle: course.title,
        quizScore: percent,
        totalTasks,
      });
      window.dispatchEvent(new Event("progressUpdated"));
      notifyNewAchievements({ token, userId: user._id }).catch((err) => {
        console.error("Помилка перевірки досягнень:", err);
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <p style={{ padding: "2rem", color: colors.text }}>
        Будь ласка, увійдіть, щоб пройти тест
      </p>
    );
  }

  if (result) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "transparent",
          color: colors.text,
          padding: "2rem",
          transition: "all 0.3s",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "2rem auto",
            background: colors.cardBg,
            borderRadius: 12,
            padding: "2rem",
            boxShadow: darkMode
              ? "0 10px 25px rgba(0,0,0,0.4)"
              : "0 10px 25px rgba(0,0,0,0.08)",
          }}
        >
          <p style={{ color: "#22c55e", fontWeight: "bold", marginTop: 0 }}>
            Тест завершено
          </p>
          <h1 style={{ marginBottom: "1rem" }}>{course.title}</h1>
          <div className="hint-success">
            Курс успішно завершено.
          </div>
          <p style={{ fontSize: "1.1rem" }}>
            Правильних відповідей: <strong>{result.correctAnswers}</strong> з{" "}
            <strong>{quizQuestions.length}</strong>
          </p>
          <p style={{ fontSize: "1.1rem" }}>
            Результат: <strong>{result.percent}%</strong>
          </p>
          {saving && <p style={{ color: colors.subtext }}>Зберігаю результат...</p>}
          {error && <div className="hint-error">{error}</div>}
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="fancy-button green"
            style={{ marginTop: "1rem", padding: "0.8rem 1.3rem" }}
          >
            Перейти до профілю
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: colors.text,
        padding: "2rem",
        transition: "all 0.3s",
      }}
    >
      <div
        style={{
          maxWidth: 860,
          margin: "2rem auto",
          background: colors.cardBg,
          borderRadius: 12,
          padding: "2rem",
          boxShadow: darkMode
            ? "0 10px 25px rgba(0,0,0,0.4)"
            : "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        <p style={{ color: "#22c55e", fontWeight: "bold", marginTop: 0 }}>
          Питання {currentQuestionIndex + 1} з {quizQuestions.length}
        </p>
        <h1 style={{ marginBottom: "1.5rem" }}>{currentQuestion.question}</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {currentQuestion.options.map((option, index) => (
            <label
              key={option}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.9rem 1rem",
                borderRadius: 8,
                border: `1px solid ${selectedAnswer === index ? "#22c55e" : colors.border}`,
                background: selectedAnswer === index ? "rgba(34,197,94,0.12)" : colors.optionBg,
                cursor: "pointer",
                color: colors.text,
              }}
            >
              <input
                type="radio"
                name="quiz-answer"
                checked={selectedAnswer === index}
                onChange={() => setSelectedAnswer(index)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>

        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null || saving}
            className="fancy-button green"
            style={{
              padding: "0.85rem 1.4rem",
              opacity: selectedAnswer === null ? 0.6 : 1,
              cursor: selectedAnswer === null ? "not-allowed" : "pointer",
            }}
          >
            {currentQuestionIndex === quizQuestions.length - 1
              ? "Завершити тест"
              : "Наступне питання"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
