import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  CheckCircle,
  Users,
  Award,
  Cpu,
  Calendar,
  FileText,
  Mic,
} from "lucide-react";
import { Ctx } from "../context/AuthContext";
import useLoad from "../hooks/useLoad";
import { Card, Btn, Loading, Empty } from "../components/ui";
import { strength, userLevel, fmt } from "../utils/helpers";

const MODS = [
  [
    "/profile",
    "Resume & Portfolio",
    "Build professional resumes and showcase projects with live links.",
    FileText,
    "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
  ],
  [
    "/mentors",
    "Mentor Booking",
    "Connect with industry experts and book 1-on-1 sessions.",
    Calendar,
    "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
  ],
  [
    "/skill-gap",
    "AI Skill-Gap & Roadmap",
    "Find your skill gaps and get a personalised learning roadmap.",
    Cpu,
    "bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
  ],
  [
    "/interview",
    "AI Mock Interview",
    "Practice with your voice and get instant AI feedback.",
    Mic,
    "bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
  ],
];

export default function Dashboard() {
  const { user } = useContext(Ctx),
    nav = useNavigate(),
    [a] = useLoad("/analytics"),
    [sess] = useLoad("/sessions");
  if (!a || !sess) return <Loading />;
  const { pct } = strength(user),
    mentor = user.role === "mentor";
  const up = sess
    .filter((s) => ["pending", "accepted"].includes(s.status))
    .sort((x, y) => new Date(x.date) - new Date(y.date));
  const other = (s) => (mentor ? s.student?.name : s.mentor?.name);
  const stats = [
    [
      "Active Applications",
      a.applications - (a.status.rejected || 0),
      Briefcase,
      "bg-indigo-50 text-indigo-600",
    ],
    [
      "Interview Rounds",
      a.status.interview || 0,
      CheckCircle,
      "bg-emerald-50 text-emerald-600",
    ],
    ["Mentorship Sessions", a.sessions, Users, "bg-amber-50 text-amber-600"],
    [
      `Reputation · ${a.points} pts`,
      `${a.badges.length} Badges`,
      Award,
      "bg-violet-50 text-violet-600",
    ],
  ];
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-4">
            <Award className="w-3.5 h-3.5 mr-1.5 text-yellow-300" />
            Level {userLevel(user.points)} Career Aspirant
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Welcome back, {user.name.split(" ")[0]}! 🚀
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base mb-6">
            Your profile is {pct}% complete.{" "}
            {up[0]
              ? `Next up: ${up[0].topic} with ${other(up[0])} on ${fmt(up[0].date)}.`
              : "No upcoming sessions yet — book a mentor to get started."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Btn v="white" onClick={() => nav("/skill-gap")}>
              <Cpu className="w-4 h-4" />
              Run AI Skill-Gap Check
            </Btn>
            <button
              onClick={() => nav("/mentors")}
              className="bg-indigo-900/40 hover:bg-indigo-900/60 text-white font-semibold px-5 py-2.5 rounded-xl text-xs border border-indigo-400/30 transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {mentor ? "My Sessions" : "Book Mentor Session"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(([k, v, I, tone]) => (
          <div
            key={k}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${tone}`}
            >
              <I className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{v}</div>
              <div className="text-xs font-medium text-slate-500">{k}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">
              Platform Modules Overview
            </h3>
            <span
              className="text-xs text-indigo-600 font-semibold cursor-pointer"
              onClick={() => nav("/profile")}
            >
              Explore All →
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MODS.map(([to, t, d, I, tone]) => (
              <div
                key={to}
                onClick={() => nav(to)}
                className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition cursor-pointer group"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg transition ${tone}`}>
                    <I className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm">{t}</h4>
                </div>
                <p className="text-xs text-slate-500">{d}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-4">
              Upcoming Schedule
            </h3>
            <div className="space-y-3">
              {up.slice(0, 3).map((s, i) => (
                <div
                  key={s._id}
                  className={`p-3.5 rounded-xl border ${i === 0 ? "bg-indigo-50/70 border-indigo-100" : "bg-slate-50 border-slate-200"}`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-700 capitalize">
                      {s.status} session
                    </span>
                    <span className="text-[10px] bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                      {fmt(s.date)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    {s.topic}
                  </p>
                  <p className="text-[11px] text-slate-500">with {other(s)}</p>
                </div>
              ))}
              {!up.length && <Empty>Nothing scheduled.</Empty>}
            </div>
          </div>
          <Btn v="dark" className="mt-4 w-full" onClick={() => nav("/mentors")}>
            View Full Calendar
          </Btn>
        </Card>
      </div>
    </div>
  );
}
