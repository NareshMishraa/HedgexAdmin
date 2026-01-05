import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import ForgotPassword from "./pages/ForgotPassword";
import HedgingRebalance from "./pages/HedgingRebalance";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { Navigate } from "react-router-dom";

function App() {
   const [activeTab, setActiveTab] = useState("pool");
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-slate-950">
      <Router>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/forgotPassword"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/hedgingRebalance"
            element={
              <ProtectedRoute>
                 <HedgingRebalance
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </ProtectedRoute>
            }
          />
           {/* 👇 Catch-all route for unknown URLs */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
