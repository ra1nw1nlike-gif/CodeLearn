import { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const loadUser = useCallback(async (token) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Auth failed");

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("Auth error:", err);
      logout();
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("userToken");
    if (savedToken) {
      setToken(savedToken);
      loadUser(savedToken);
    }
  }, [loadUser]);

  const login = (token) => {
    localStorage.setItem("userToken", token);
    setToken(token);
    loadUser(token);
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
