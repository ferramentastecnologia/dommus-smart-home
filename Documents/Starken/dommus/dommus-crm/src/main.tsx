import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Set theme based on localStorage or system preference
const setInitialTheme = () => {
  const persistedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  if (persistedTheme === "dark" || (!persistedTheme && prefersDark)) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.add("light");
  }
};

// Apply theme immediately to avoid flashing on page load
setInitialTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
