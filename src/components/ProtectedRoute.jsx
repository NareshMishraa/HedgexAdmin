import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
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
    window.addEventListener("storage", checkToken); // for multi-tab sync

    return () => {
      window.removeEventListener("auth-change", checkToken);
      window.removeEventListener("storage", checkToken);
    };
  }, []);

  if (!token) {
    // no token -> redirect to login
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
