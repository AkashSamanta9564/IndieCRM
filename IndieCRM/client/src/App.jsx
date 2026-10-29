import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";

import NotificationBell from "./components/NotificationBell";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";

function App() {
  const location = useLocation();
  const [theme, setTheme] = useState("dark");

  // Check if current page is an auth page
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("crm-theme") || "dark";
    setTheme(savedTheme);
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Update theme instantly
  useEffect(() => {
    const updateTheme = () => {
      const savedTheme = localStorage.getItem("crm-theme") || "dark";
      setTheme(savedTheme);
    };

    window.addEventListener("storage", updateTheme);
    window.addEventListener("focus", updateTheme);
    window.addEventListener("themeChanged", updateTheme);

    return () => {
      window.removeEventListener("storage", updateTheme);
      window.removeEventListener("focus", updateTheme);
      window.removeEventListener("themeChanged", updateTheme);
    };
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#111827",
            color: "#fff",
            border: "1px solid #374151",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      {isAuthPage ? (
        // Full-screen auth pages
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      ) : (
        // Main CRM layout
        <div
          className={`flex min-h-screen text-white transition-colors duration-300 ${
            theme === "dark"
              ? "bg-gray-950"
              : theme === "blue"
              ? "bg-slate-900"
              : theme === "purple"
              ? "bg-purple-950"
              : "bg-emerald-950"
          }`}
        >
          <Sidebar />

          <main className="flex-1 p-8">
            {location.pathname !== "/settings" && (
              <div className="flex justify-end mb-6">
                <NotificationBell />
              </div>
            )}

            <Routes>
             <Route
  path="/"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/leads"
  element={
    <ProtectedRoute>
      <Leads />
    </ProtectedRoute>
  }
/>

<Route
  path="/tasks"
  element={
    <ProtectedRoute>
      <Tasks />
    </ProtectedRoute>
  }
/>

<Route
  path="/settings"
  element={
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  }
/>
            </Routes>
          </main>
        </div>
      )}
    </>
  );
}

export default App;