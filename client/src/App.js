import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import HomePage from "./pages/HomePage";
import TheoryPage from "./pages/TheoryPage";
import TasksPage from "./pages/TasksPage";
import QuizPage from "./pages/QuizPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import Header from "./components/Header";
import AchievementToast from "./components/AchievementToast";

import AuthProvider from "./context/AuthContext";
import "./App.css";
import "./buttons.css";

function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div
          className={`tech-app-shell ${darkMode ? "dark" : "light"}`}
          style={{
            backgroundColor: darkMode ? "#020617" : "#e7f0f8",
            minHeight: "100vh",
            transition: "all 0.3s",
          }}
        >
          <div className="tech-app-content">
            <Header darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />

            <Routes>
              <Route path="/" element={<HomePage darkMode={darkMode} />} />
              <Route path="/theory" element={<TheoryPage darkMode={darkMode} />} />
              <Route path="/tasks" element={<TasksPage darkMode={darkMode} />} />
              <Route path="/quiz" element={<QuizPage darkMode={darkMode} />} />
              <Route path="/register" element={<RegisterPage darkMode={darkMode} />} />
              <Route path="/login" element={<LoginPage darkMode={darkMode} />} />
              <Route path="/profile" element={<ProfilePage darkMode={darkMode} />} />
            </Routes>
            <AchievementToast darkMode={darkMode} />
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
