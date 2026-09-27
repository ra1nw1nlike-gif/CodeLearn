import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// 🔹 Іменований експорт AuthContext
import { AuthContext } from "../context/AuthContext";

function LoginPage({ darkMode }) {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "/api/auth/login",
        form
      );

      login(res.data.token);
      navigate("/theory");
    } catch (err) {
      setError(err.response?.data?.message || "Помилка сервера");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "transparent",
        transition: "all 0.3s",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: darkMode ? "#1e293b" : "#fff",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: darkMode
            ? "0 10px 25px rgba(0,0,0,0.4)"
            : "0 10px 25px rgba(0,0,0,0.08)",
          width: "350px",
        }}
      >
        <h2
          style={{
            marginBottom: "1rem",
            color: darkMode ? "#e5e7eb" : "#020617",
          }}
        >
          Вхід
        </h2>
        {error && (
          <div style={{ color: "#e74c3c", marginBottom: "1rem" }}>{error}</div>
        )}

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={{
            width: "100%",
            marginBottom: "1rem",
            padding: "0.6rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={form.password}
          onChange={handleChange}
          style={{
            width: "100%",
            marginBottom: "1rem",
            padding: "0.6rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          className="fancy-button green"
          style={{ width: "100%" }}
        >
          Увійти
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
