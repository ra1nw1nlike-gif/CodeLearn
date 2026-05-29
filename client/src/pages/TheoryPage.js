import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { fetchTasks, saveTheoryProgress } from "../api";
import { notifyNewAchievements } from "../achievements";
import {
  getCourseByTitle,
  getCoursePath,
  getCourseTitleFromLocation,
} from "../courseData";
import "../tasks.css";
import "../buttons.css";

function TheoryPage({ darkMode }) {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const course = getCourseByTitle(getCourseTitleFromLocation(location));
  const [totalTasks, setTotalTasks] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const colors = {
    bg: darkMode ? "#020617" : "#f8fafc",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    text: darkMode ? "#e5e7eb" : "#020617",
    subtext: darkMode ? "#cbd5e1" : "#475569",
    codeBg: darkMode ? "#0f172a" : "#020617",
    border: darkMode ? "#334155" : "#e5e7eb",
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

  async function handleGoToPractice() {
    if (!token) return;

    try {
      setSaving(true);
      setError(null);
      await saveTheoryProgress({
        token,
        courseTitle: course.title,
        totalTasks,
      });
      window.dispatchEvent(new Event("progressUpdated"));
      notifyNewAchievements({ token, userId: user._id }).catch((err) => {
        console.error("Помилка перевірки досягнень:", err);
      });
      navigate(getCoursePath("/tasks", course.title), { state: { courseTitle: course.title } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <p style={{ padding: "2rem", color: colors.text }}>
        Будь ласка, увійдіть, щоб відкрити теорію курсу
      </p>
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
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            background: colors.cardBg,
            borderRadius: 12,
            padding: "2rem",
            boxShadow: darkMode
              ? "0 10px 25px rgba(0,0,0,0.4)"
              : "0 10px 25px rgba(0,0,0,0.08)",
            marginBottom: "1.5rem",
          }}
        >
          <p style={{ color: "#22c55e", fontWeight: "bold", marginTop: 0 }}>
            Теоретична частина
          </p>
          <h1 style={{ marginBottom: "1rem" }}>{course.title}</h1>
          <p style={{ color: colors.subtext, lineHeight: 1.7, marginBottom: 0 }}>
            {course.theoryIntro}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {course.theory.map((block) => (
            <div
              key={block.title}
              className="task-card"
              style={{
                background: colors.cardBg,
                borderColor: colors.border,
                color: colors.text,
              }}
            >
              <h2 style={{ marginTop: 0 }}>{block.title}</h2>
              <p style={{ color: colors.subtext, lineHeight: 1.7 }}>{block.text}</p>
              <pre
                className="task-pre"
                style={{
                  width: "100%",
                  maxHeight: "none",
                  background: colors.codeBg,
                  borderColor: colors.border,
                  color: "#86efac",
                  marginTop: "1rem",
                }}
              >
                <code>{block.code}</code>
              </pre>
            </div>
          ))}
        </div>

        {error && (
          <div className="hint-error" style={{ marginTop: "1rem" }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={handleGoToPractice}
            disabled={saving}
            className="fancy-button green"
            style={{ padding: "0.9rem 1.5rem", fontSize: "1rem" }}
          >
            {saving ? "Зберігаю прогрес..." : "Перейти до практичних завдань"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TheoryPage;
