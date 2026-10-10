import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AppAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nexvion_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem("nexvion_users") || "[]");
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { success: false, error: "Invalid email or password." };
    const userObj = { name: found.name, email: found.email };
    localStorage.setItem("nexvion_user", JSON.stringify(userObj));
    setUser(userObj);
    return { success: true };
  };

  const register = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem("nexvion_users") || "[]");
    if (users.find((u) => u.email === email)) return { success: false, error: "This email is already registered." };
    users.push({ name, email, password });
    localStorage.setItem("nexvion_users", JSON.stringify(users));
    const userObj = { name, email };
    localStorage.setItem("nexvion_user", JSON.stringify(userObj));
    setUser(userObj);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem("nexvion_user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>;
}

export function useAppAuth() {
  return useContext(AuthContext);
}