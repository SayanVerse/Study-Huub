import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <Loader fullScreen />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
