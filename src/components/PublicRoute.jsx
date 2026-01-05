import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const checkToken = () => {
      const currentToken = localStorage.getItem("token");
      setToken(currentToken);
    };

    // Initial check
    checkToken();

    // Listen for auth changes (login/logout)
    window.addEventListener("auth-change", checkToken);

    // Optional: listen to storage event for multi-tab sync
    window.addEventListener("storage", checkToken);

    return () => {
      window.removeEventListener("auth-change", checkToken);
      window.removeEventListener("storage", checkToken);
    };
  }, []);

  if (token) {
    // User is already logged in → redirect to dashboard
    return <Navigate to="/hedgingRebalance" replace />;
  }

  // No token → allow access (Login / ForgotPassword)
  return children;
};

export default PublicRoute;
