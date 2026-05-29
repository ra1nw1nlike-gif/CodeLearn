import React, { useContext } from "react"; // додано useContext
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // імпортуємо контекст

function HomePage({ darkMode }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // отримуємо юзера

  const colors = {
    bg: darkMode ? "#0f172a" : "#f8fafc",
    text: darkMode ? "#e5e7eb" : "#020617",
    subtext: darkMode ? "#cbd5e1" : "#475569",
    heroText: darkMode ? "#22c55e" : "#22c55e",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    codeBg: darkMode ? "#020617" : "#020617",
    buttonText: darkMode ? "#0f172a" : "#020617",
    buttonShadow: "0 0 25px rgba(34,197,94,0.6)",
  };

  const featureCards = [
    {
      title: "📘 Практичні задачі",
      text: "Задачі різного рівня складності для розвитку алгоритмічного мислення.",
    },
    {
      title: "🧪 Автоматична перевірка",
      text: "Кожне рішення перевіряється набором автотестів.",
    },
    {
      title: "💡 Розумні підказки",
      text: "Система пояснює помилки зрозумілою людською мовою.",
    },
  ];

  const codeCards = [
    {
      text: "n = int(input())\nprint(n * n)\n\n✔ Тест пройдено\n✔ Результат правильний",
      color: "#22c55e",
    },
    {
      text: "a, b = map(int, input().split())\nprint(a + b)\n\n✔ Тест пройдено\n✔ Результат правильний",
      color: "#6366f1",
    },
    {
      text: "s = input()\nprint(s[::-1])\n\n✔ Тест пройдено\n✔ Результат правильний",
      color: "#f97316",
    },
  ];

  const facts = [
    { icon: "💻", text: "95% студентів покращили алгоритмічне мислення за перший місяць" },
    { icon: "⚡", text: "Код на практиці закріплюється швидше, ніж просто читання лекцій" },
    { icon: "🚀", text: "Рішення з автоперевіркою допомагає одразу помічати типові помилки" },
  ];

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        background: "transparent",
        color: colors.text,
        transition: "all 0.3s",
      }}
    >
      {/* HERO */}
      <section
        style={{
          background: "transparent",
          color: colors.text,
          padding: "5rem 2rem",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
              color: colors.heroText,
            }}
          >
            A Better Way to Learn Programming
          </h1>

          <p
            style={{
              maxWidth: 650,
              fontSize: "1.15rem",
              color: darkMode ? "#cbd5e1" : "#334155",
              lineHeight: 1.6,
            }}
          >
            Навчайся програмуванню через практику. Розв’язуй задачі, отримуй
            автоматичну перевірку та розумні підказки, які допомагають зрозуміти
            помилки, а не просто виправити їх.
          </p>

          <button
            onClick={() => {
              if (user) navigate("/theory");
            }}
            disabled={!user} // блокуємо кнопку, якщо юзер не залогінений
            className="fancy-button green"
            style={{
              marginTop: "2rem",
              padding: "0.9rem 1.8rem",
              fontSize: "1rem",
              borderRadius: 8,
              fontWeight: "bold",
              boxShadow: colors.buttonShadow,
              opacity: user ? 1 : 0.5, // візуально показуємо, що кнопка заблокована
              cursor: user ? "pointer" : "not-allowed",
            }}
          >
            🚀 Почати навчання
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section
        style={{
          background: "transparent",
          padding: "4rem 2rem",
          transition: "all 0.3s",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem",
          }}
        >
          {featureCards.map((item, index) => (
            <div
              key={index}
              style={{
                background: colors.cardBg,
                padding: "2rem",
                borderRadius: 12,
                boxShadow: darkMode
                  ? "0 10px 25px rgba(0,0,0,0.3)"
                  : "0 10px 25px rgba(0,0,0,0.07)",
                transition: "all 0.3s",
              }}
            >
              <h3 style={{ marginBottom: "0.5rem", color: colors.text }}>
                {item.title}
              </h3>
              <p style={{ color: colors.subtext }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section style={{ padding: "4rem 2rem" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "3rem",
          }}
        >
          {codeCards.map((card, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: idx % 2 === 0 ? "row" : "row-reverse",
                gap: "2rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 250 }}>
                <h3
                  style={{
                    fontSize: "1.7rem",
                    marginBottom: "1rem",
                    color: colors.text,
                  }}
                >
                  {idx === 0
                    ? "Чому вибирають CodeLearn?"
                    : idx === 1
                    ? "Практика важливіша за теорію"
                    : "Автоматичне відслідковування помилок"}
                </h3>
                <p style={{ color: colors.subtext, lineHeight: 1.6 }}>
                  {idx === 0
                    ? "CodeLearn допомагає студентам швидко навчатися через практичні завдання з автоперевіркою."
                    : idx === 1
                    ? "Код на практиці закріплюється швидше та запам'ятовується на довше."
                    : "Наша система миттєво показує типові помилки, допомагаючи навчитися правильному підходу."}
                </p>
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: 250,
                  borderRadius: 12,
                  padding: "1.5rem",
                  background: colors.cardBg,
                  boxShadow: darkMode
                    ? "0 20px 40px rgba(0,0,0,0.4)"
                    : "0 20px 40px rgba(0,0,0,0.08)",
                  fontFamily: "monospace",
                  color: card.color,
                  whiteSpace: "pre-line",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 30px 50px rgba(0,0,0,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = darkMode
                    ? "0 20px 40px rgba(0,0,0,0.4)"
                    : "0 20px 40px rgba(0,0,0,0.08)";
                }}
              >
                {card.text}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FACTS */}
      <section
        style={{
          padding: "4rem 2rem",
          background: "transparent",
          transition: "all 0.3s",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "2rem", color: colors.text }}>
            💡 Цікаві факти про програмування
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {facts.map((fact, index) => (
              <div
                key={index}
                style={{
                  background: darkMode ? "#1e293b" : "#ffffff",
                  padding: "1.5rem",
                  borderRadius: 12,
                  boxShadow: darkMode
                    ? "0 10px 25px rgba(0,0,0,0.4)"
                    : "0 10px 25px rgba(0,0,0,0.08)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  transition: "all 0.3s",
                  transform: "translateY(0)",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ fontSize: "2rem", lineHeight: 1 }}>{fact.icon}</div>
                <p
                  style={{
                    margin: 0,
                    color: darkMode ? "#e5e7eb" : "#020617",
                    lineHeight: 1.5,
                  }}
                >
                  {fact.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", color: colors.text }}>
          Built for Students & Future Developers
        </h2>
        <p
          style={{
            maxWidth: 700,
            margin: "1rem auto",
            color: colors.subtext,
            lineHeight: 1.6,
          }}
        >
          Платформа створена як навчальний проєкт, що допомагає сформувати
          правильне програмістське мислення та підготуватися до реальних задач.
        </p>
      </section>
    </div>
  );
}

export default HomePage;
