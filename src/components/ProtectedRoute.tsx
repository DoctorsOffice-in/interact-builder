import { Navigate, useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center bg-background"><LoaderCircle className="h-6 w-6 animate-spin text-primary" aria-label="Checking account" /></main>;
  }
  if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  return children;
};