import { useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UserCheck,
  Briefcase,
  Users,
  MessageSquare,
  Cpu,
  Mic,
  BarChart3,
  ShieldCheck,
  X,
} from "lucide-react";
import { Ctx } from "../context/AuthContext";
import { strength } from "../utils/helpers";

// NAV array mein sirf 8 standard modules rakhein
const NAV = [
  ["/", "Dashboard Overview", LayoutDashboard],
  ["/profile", "Profile & Portfolio", UserCheck],
  ["/jobs", "Jobs & ATS Tracker", Briefcase],
  ["/mentors", "Mentor Discovery", Users],
  ["/chat", "Real-Time Chat", MessageSquare],
  ["/skill-gap", "AI Skill-Gap & Roadmap", Cpu],
  ["/interview", "AI Mock Interview", Mic],
  ["/analytics", "Career Analytics", BarChart3],
];

export default function Sidebar({ open, onClose }) {
  const { user } = useContext(Ctx),
    { pct, tip } = strength(user);

  // Yeh check karega ki agar user admin hai, tabhi NAV ke sath 9th item add ho
  const items =
    user?.role === "admin"
      ? [...NAV, ["/admin", "Admin Control Panel", ShieldCheck]]
      : NAV;

  return (
    <aside
      className={`absolute lg:relative inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col z-20 transform transition-transform duration-200 ease-in-out shadow-xl lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Navigation Modules
        </span>
        <button
          onClick={onClose}
          className="lg:hidden text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar">
        {items.map(([to, label, Icon], i) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${isActive ? "text-indigo-600 bg-indigo-50" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`
            }
          >
            <Icon className="w-5 h-5" />
            <span>
              {i + 1}. {label}
            </span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl p-3 text-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
              Profile Strength
            </span>
            <span className="text-xs font-bold">{pct}%</span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div
              className="bg-white h-full rounded-full"
              style={{ width: pct + "%" }}
            />
          </div>
          <p className="text-[11px] mt-2 opacity-90">
            {pct === 100 ? "Your profile is complete! 🎉" : `Next step: ${tip}`}
          </p>
        </div>
      </div>
    </aside>
  );
}