import { useState, useEffect, useContext } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, Ctx } from "./context/AuthContext";
import { ToastProvider, useToast } from "./components/Toast";
import { socket } from "./services/socket";
import api from "./services/api";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import * as P from "./pages";

function Shell() {
  const { user, ready } = useContext(Ctx),
    [open, setOpen] = useState(false),
    [unread, setUnread] = useState(0),
    loc = useLocation(),
    toast = useToast();
  useEffect(() => setOpen(false), [loc]);
  useEffect(() => {
    if (!user) return;
    const count = () =>
      api
        .get("/notifications")
        .then((r) => setUnread(r.data.filter((n) => !n.read).length));
    count();
    socket.connect();
    const onN = (n) => {
      toast(n.text);
      setUnread((u) => u + 1);
    };
    socket.on("notif", onN);
    window.addEventListener("notif-read", count);
    return () => {
      socket.off("notif", onN);
      window.removeEventListener("notif-read", count);
    };
  }, [user?._id]);
  if (!ready)
    return <p className="text-center mt-[20vh] text-slate-400">Loading…</p>;
  if (!user) return <P.Auth />;
  return (
    <div className="shell h-screen flex flex-col overflow-hidden bg-slate-50 text-slate-800">
      <Header onMenu={() => setOpen(!open)} unread={unread} />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        {open && (
          <div
            className="lg:hidden fixed inset-0 bg-slate-900/40 z-10"
            onClick={() => setOpen(false)}
          />
        )}
        <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50 scrollbar">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<P.Dashboard />} />
              <Route path="/profile" element={<P.Profile />} />
              <Route path="/jobs" element={<P.Jobs />} />
              <Route path="/mentors" element={<P.Mentors />} />
              <Route path="/chat" element={<P.Chat />} />
              <Route path="/skill-gap" element={<P.SkillGap />} />
              <Route path="/interview" element={<P.Interview />} />
              <Route path="/analytics" element={<P.Analytics />} />
              <Route path="/notifications" element={<P.Notifications />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <P.Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </AuthProvider>
  );
}