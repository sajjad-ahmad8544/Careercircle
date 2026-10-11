import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Ctx } from "../context/AuthContext";

export default function ProtectedRoute({ roles, children }) {
  const { user } = useContext(Ctx);
  return !roles || roles.includes(user.role) ? children : <Navigate to="/" />;
}
