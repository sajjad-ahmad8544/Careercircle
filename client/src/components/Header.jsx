import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, Sparkles, LogOut } from "lucide-react";
import { Ctx } from "../context/AuthContext";
import Avatar from "./Avatar";

export default function Header({ onMenu, unread }) {
  const { user, logout } = useContext(Ctx),
    nav = useNavigate();
  return (
    <header className="bg-white border-b border-slate-200 shrink-0 z-30">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenu}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
              CC
            </div>
            <div>
              <h1 className="font-bold text-slate-900 tracking-tight text-lg leading-tight">
                CareerCircle
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Complete Career Ecosystem
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="hidden md:inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI-Powered Platform
          </span>
          <button
            onClick={() => nav("/notifications")}
            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <Avatar name={user.name} className="ring-2 ring-indigo-100" />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">
                {user.role}
                {user.targetRole ? ` • ${user.targetRole}` : ""}
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
