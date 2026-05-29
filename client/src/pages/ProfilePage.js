import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { fetchProgress, fetchTasks } from "../api";
import ProgressBar from "../components/ProgressBar";
import { getAchievementStates } from "../achievements";
import {
  courses,
  findCourseProgress,
  getCoursePath,
} from "../courseData";

function ProfilePage({ darkMode }) {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showAchievements, setShowAchievements] = useState(false);
  const [courseDetails, setCourseDetails] = useState(
    courses.map((course) => ({
      title: course.title,
      theoryCompleted: false,
      tasksCompleted: [],
      quizCompleted: false,
      quizScore: 0,
      progress: 0,
      totalTasks: 0,
    }))
  );

  // --- Завантаження прогресу ---
  useEffect(() => {
    if (!user) return;

    async function loadProgress() {
      try {
        const [progressCourses, taskLists] = await Promise.all([
          fetchProgress(token),
          Promise.all(courses.map((course) => fetchTasks(token, course.title))),
        ]);

        const normalizedDetails = courses.map((course, index) => {
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

        setCourseDetails(normalizedDetails);
      } catch (err) {
        console.error("Помилка завантаження прогресу:", err);
      }
    }

    // Завантажуємо при монтуванні
    loadProgress();

    // Слухаємо подію оновлення прогресу
    function handleProgressUpdated() {
      loadProgress();
    }
    window.addEventListener("progressUpdated", handleProgressUpdated);

    return () => {
      window.removeEventListener("progressUpdated", handleProgressUpdated);
    };
  }, [user, token]);

  if (!user)
    return <p style={{ padding: "2rem" }}>Будь ласка, увійдіть</p>;

  const handleCourseClick = (courseTitle) => {
    navigate(getCoursePath("/theory", courseTitle), { state: { courseTitle } });
  };

  const achievementStates = getAchievementStates(courseDetails);
  const unlockedCount = achievementStates.filter((achievement) => achievement.unlocked).length;

  const renderAchievementCard = (achievement) => (
    <div
      key={achievement.id}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.8rem",
        padding: "0.9rem 1rem",
        borderRadius: "8px",
        background: achievement.unlocked
          ? (darkMode ? "#0f172a" : "#f8fafc")
          : (darkMode ? "rgba(15,23,42,0.55)" : "#f1f5f9"),
        border: achievement.unlocked
          ? "1px solid #22c55e"
          : (darkMode ? "1px solid #334155" : "1px solid #e5e7eb"),
        color: darkMode ? "#e5e7eb" : "#020617",
        opacity: achievement.unlocked ? 1 : 0.62,
      }}
    >
      <div style={{ fontSize: "1.7rem", lineHeight: 1 }}>
        {achievement.unlocked ? achievement.icon : "🔒"}
      </div>
      <div>
        <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
          {achievement.title}
        </div>
        <div style={{ fontSize: "0.92rem", lineHeight: 1.45 }}>
          {achievement.description}
        </div>
        <div
          style={{
            marginTop: "0.35rem",
            fontSize: "0.82rem",
            color: achievement.unlocked ? "#22c55e" : (darkMode ? "#94a3b8" : "#64748b"),
            fontWeight: "bold",
          }}
        >
          {achievement.unlocked ? "Відкрито" : "Ще не відкрито"}
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        padding: "2rem",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: "1.25rem",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          padding: "2rem",
          maxWidth: 600,
          width: "100%",
          flex: "1 1 560px",
          background: darkMode ? "#1e293b" : "#fff",
          borderRadius: "12px",
          boxShadow: darkMode
            ? "0 10px 25px rgba(0,0,0,0.4)"
            : "0 10px 25px rgba(0,0,0,0.08)",
          color: darkMode ? "#e5e7eb" : "#020617",
        }}
      >
        <h2>Профіль користувача</h2>
        <p><strong>Нік:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>ID:</strong> {user._id}</p>

        <hr style={{ margin: "1.5rem 0" }} />

        <button
          type="button"
          onClick={() => setShowAchievements((value) => !value)}
          className="fancy-button purple"
          aria-expanded={showAchievements}
          aria-controls="profile-achievements-panel"
          style={{
            width: "100%",
            padding: "0.8rem 1rem",
            marginBottom: "1rem",
          }}
        >
          {showAchievements ? "Закрити досягнення" : "Розкрити досягнення"}{" "}
          {unlockedCount}/{achievementStates.length}
        </button>

        <h3>Мої курси</h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          {courseDetails.map((courseInfo) => (
          <div key={courseInfo.title}>
            <div
              onClick={() => handleCourseClick(courseInfo.title)}
              className="fancy-button green"
              style={{
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1rem",
                transition: "all 0.3s",
                boxShadow: darkMode
                  ? "0 5px 15px rgba(0,0,0,0.4)"
                  : "0 5px 15px rgba(0,0,0,0.15)",
                background: darkMode ? "#22c55e" : "#4ade80",
                color: "#fff",
                width: "100%",
                boxSizing: "border-box",
                textAlign: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {courseInfo.title}
            </div>

            {/* Прогрес бар під кнопкою */}
            <div style={{ width: "100%", marginTop: "0.5rem" }}>
              <ProgressBar value={courseInfo.progress} />
            </div>

            <div
              style={{
                background: darkMode ? "#0f172a" : "#f8fafc",
                border: darkMode ? "1px solid #334155" : "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "1rem",
                color: darkMode ? "#e5e7eb" : "#020617",
                lineHeight: 1.6,
              }}
            >
              <p style={{ margin: "0 0 0.4rem" }}>
                <strong>Назва курсу:</strong> {courseInfo.title}
              </p>
              <p style={{ margin: "0 0 0.4rem" }}>
                <strong>Прогрес:</strong> {courseInfo.progress}%
              </p>
              <p style={{ margin: "0 0 0.4rem" }}>
                <strong>Теорія завершена:</strong>{" "}
                {courseInfo.theoryCompleted ? "✅" : "Не завершена"}
              </p>
              <p style={{ margin: "0 0 0.4rem" }}>
                <strong>Виконано задач:</strong>{" "}
                {courseInfo.tasksCompleted.length}/{courseInfo.totalTasks}
              </p>
              <p style={{ margin: "0 0 0.4rem" }}>
                <strong>Тест:</strong>{" "}
                {courseInfo.quizCompleted ? "Пройдено" : "Не пройдено"}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Результат тесту:</strong> {courseInfo.quizScore}%
              </p>
            </div>
          </div>
          ))}
        </div>
      </div>

      {showAchievements && (
        <aside
          id="profile-achievements-panel"
          style={{
            padding: "1.5rem",
            width: "100%",
            maxWidth: 360,
            flex: "0 1 360px",
            background: darkMode ? "#1e293b" : "#fff",
            borderRadius: "12px",
            boxShadow: darkMode
              ? "0 10px 25px rgba(0,0,0,0.4)"
              : "0 10px 25px rgba(0,0,0,0.08)",
            color: darkMode ? "#e5e7eb" : "#020617",
            position: "sticky",
            top: "5.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ margin: 0 }}>
              Досягнення {unlockedCount}/{achievementStates.length}
            </h3>
            <button
              type="button"
              onClick={() => setShowAchievements(false)}
              className="fancy-button purple"
              aria-label="Закрити досягнення"
              style={{
                width: "2.25rem",
                minWidth: "2.25rem",
                height: "2.25rem",
                padding: 0,
                borderRadius: "8px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              maxHeight: "calc(100vh - 12rem)",
              overflowY: "auto",
              paddingRight: "0.25rem",
            }}
          >
            {achievementStates.map(renderAchievementCard)}
          </div>
        </aside>
      )}
    </div>
  );
}

export default ProfilePage;
