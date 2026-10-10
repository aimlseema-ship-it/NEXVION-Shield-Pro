import { Navigate, Outlet } from "react-router-dom";
import { useAppAuth } from "@/lib/AppAuth";

export default function RequireAuth() {
  const { user, loading } = useAppAuth();
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}