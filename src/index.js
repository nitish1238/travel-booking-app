import React, { createContext, useState, useMemo } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// ==========================
// Contexts
// ==========================

// Theme Context
export const ThemeContext = createContext();

// Auth Context (future use)
export const AuthContext = createContext();

// ==========================
// Theme Provider Component
// ==========================
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Memoize value for performance
  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={theme === "light" ? "theme-light" : "theme-dark"}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// ==========================
// Auth Provider (Mock Setup)
// ==========================
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (username) => {
    setUser({ name: username });
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// ==========================
// Root Rendering
// ==========================
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);

// ==========================
// Web Vitals (Optional)
// ==========================
function reportWebVitals(metric) {
  if (metric.label === "web-vital") {
    console.log(
      `[Web Vital] ${metric.name}: ${metric.value} (id: ${metric.id})`
    );
  }
}

// Example usage of web vitals logging
import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
  getCLS(reportWebVitals);
  getFID(reportWebVitals);
  getFCP(reportWebVitals);
  getLCP(reportWebVitals);
  getTTFB(reportWebVitals);
});

// ==========================
// Global Styles for Themes
// ==========================
import "./styles/App.css";

// Light Theme Styles
const lightTheme = `
  .theme-light {
    background-color: #f9f9f9;
    color: #222;
    transition: background 0.3s, color 0.3s;
  }
`;

// Dark Theme Styles
const darkTheme = `
  .theme-dark {
    background-color: #181818;
    color: #f5f5f5;
    transition: background 0.3s, color 0.3s;
  }
`;

// Inject dynamic CSS for themes
const style = document.createElement("style");
style.innerHTML = lightTheme + darkTheme;
document.head.appendChild(style);

