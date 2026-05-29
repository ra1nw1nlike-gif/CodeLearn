import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // іменований експорт
import "../buttons.css";

function Header({ darkMode, toggleDarkMode }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleTasksClick = () => {
    if (user) {
      navigate("/profile"); // переходимо на профіль
    } else {
      alert("Будь ласка, увійдіть, щоб переглядати завдання.");
    }
  };

  return (
    <header
      style={{
        background: darkMode ? "#020617" : "#ffffff",
        borderBottom: darkMode ? "1px solid #1e293b" : "1px solid #e5e7eb",
        padding: "1rem 2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className={`gradient-bar ${darkMode ? "dark" : "light"}`}></div>

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Link
          to="/"
          className="fancy-button purple"
          style={{ fontSize: "1.3rem", fontWeight: "bold" }}
        >
          CodeLearn
        </Link>

        <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            onClick={handleTasksClick}
            className="fancy-button purple"
          >
            Tasks
          </button>

          <button
            onClick={toggleDarkMode}
            className="fancy-button"
            style={{
              background: darkMode ? "#000" : "#fff",
              color: darkMode ? "#fff" : "#000",
            }}
          >
            {darkMode ? "🌙 Dark" : "☀ Light"}
          </button>

          {user ? (
            <>
              <Link to="/profile" className="fancy-button green">
                {user.username} 👤
              </Link>
              <button onClick={logout} className="fancy-button purple">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="fancy-button green">
                🔑 Register
              </Link>
              <Link to="/login" className="fancy-button purple">
                🔐 Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
