import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
    >
      <div className={`theme-toggle__track ${theme === "dark" ? "dark" : "light"}`}>
        <div className="theme-toggle__sun">
          <Sun size={14} color="#F59E0B" />
        </div>
        <div className="theme-toggle__moon">
          <Moon size={14} color="#60A5FA" />
        </div>
        <div className="theme-toggle__thumb" />
      </div>
    </button>
  );
}
