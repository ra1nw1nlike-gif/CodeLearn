import { useEffect, useState } from "react";
import { useContext } from "react";
import { syncUnlockedAchievements } from "../achievements";
import { AuthContext } from "../context/AuthContext";

function AchievementToast({ darkMode }) {
  const { user, token } = useContext(AuthContext);
  const [achievement, setAchievement] = useState(null);

  useEffect(() => {
    if (!user || !token) return;

    syncUnlockedAchievements({ token, userId: user._id }).catch((err) => {
      console.error("Помилка синхронізації досягнень:", err);
    });
  }, [user, token]);

  useEffect(() => {
    let timerId;

    function handleAchievementUnlocked(event) {
      setAchievement(event.detail);
      window.clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        setAchievement(null);
      }, 4200);
    }

    window.addEventListener("achievementUnlocked", handleAchievementUnlocked);

    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener("achievementUnlocked", handleAchievementUnlocked);
    };
  }, []);

  if (!achievement) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 1000,
        width: "min(360px, calc(100vw - 2rem))",
        padding: "1rem",
        borderRadius: "10px",
        background: darkMode ? "#0f172a" : "#ffffff",
        color: darkMode ? "#e5e7eb" : "#020617",
        border: darkMode ? "1px solid #22c55e" : "1px solid #bbf7d0",
        boxShadow: darkMode
          ? "0 15px 35px rgba(0,0,0,0.55), 0 0 22px rgba(34,197,94,0.25)"
          : "0 15px 35px rgba(15,23,42,0.18), 0 0 20px rgba(34,197,94,0.18)",
      }}
    >
      <div style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
        <div style={{ fontSize: "1.8rem", lineHeight: 1 }}>{achievement.icon}</div>
        <div>
          <div style={{ fontWeight: "bold", color: "#22c55e", marginBottom: "0.2rem" }}>
            Досягнення відкрито
          </div>
          <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
            {achievement.title}
          </div>
          <div style={{ fontSize: "0.9rem", lineHeight: 1.4, opacity: 0.9 }}>
            {achievement.description}
          </div>
          <div style={{ fontSize: "0.82rem", marginTop: "0.5rem", opacity: 0.75 }}>
            Переглянути всі досягнення можна у профілі.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AchievementToast;
