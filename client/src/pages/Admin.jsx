import { useState, useContext } from "react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Briefcase,
  ClipboardList,
  Calendar,
  Star,
  Megaphone,
  ShieldCheck,
} from "lucide-react";
import api from "../services/api";
import { Ctx } from "../context/AuthContext";
import useLoad from "../hooks/useLoad";
import Avatar from "../components/Avatar";
import { useToast } from "../components/Toast";
import { Card, CardTitle, Btn, Pill, Empty, Loading, Bar, inp } from "../components/ui";
import { fmt, fail, STATUSES } from "../utils/helpers";

const TABS = [
  ["overview", "Overview", LayoutDashboard],
  ["users", "Users", Users],
  ["mentors", "Mentors", UserCheck],
  ["jobs", "Jobs", Briefcase],
  ["apps", "Applications", ClipboardList],
  ["sessions", "Sessions", Calendar],
  ["reviews", "Reviews", Star],
  ["announce", "Announcements", Megaphone],
];
const roleTone = { admin: "rose", mentor: "violet", student: "indigo" };
const sessTone = { pending: "amber", accepted: "indigo", completed: "emerald", rejected: "rose", cancelled: "slate" };

// run an admin action, show a toast with the result (or the server error)
const useAct = () => {
  const toast = useToast();
  return async (fn, ok) => {
    try {
      await fn();
      ok && toast(ok);
      return true;
    } catch (e) {
      toast(fail(e));
      return false;
    }
  };
};

const Th = ({ children }) => <th className="py-2 pr-3 font-semibold">{children}</th>;
const Table = ({ head, children, empty }) => (
  <div className="overflow-x-auto scrollbar">
    <table className="w-full text-xs">
      <thead>
        <tr className="text-left text-slate-500 border-b border-slate-200">
          {head.map((h, i) => (
            <Th key={i}>{h}</Th>
          ))}
        </tr>
      </thead>
      <tbody className="[&_td]:py-2.5 [&_td]:pr-3 [&_tr]:border-b [&_tr]:border-slate-100 align-middle">
        {children}
      </tbody>
    </table>
    {empty && <Empty>{empty}</Empty>}
  </div>
);

/* ---------------- Overview ---------------- */
function Overview({ go }) {
  const [st] = useLoad("/admin/stats");
  if (!st) return <Loading />;
  const cards = [
    ["Students", st.students, "to-users"],
    ["Verified mentors", st.mentors, "to-mentors"],
    ["Pending mentors", st.pendingMentors, "to-mentors", st.pendingMentors > 0],
    ["Active jobs", st.jobs, "to-jobs"],
    ["Applications", st.applications, "to-apps"],
    ["Sessions", st.sessions, "to-sessions"],
    ["Reviews", st.reviews, "to-reviews"],
    ["Suspended users", st.suspended, "to-users"],
  ];
  const max = Math.max(1, ...st.signups.map((s) => s.count));
  const breakdown = (o) => Object.entries(o);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(([k, v, to, hot]) => (
          <button
            key={k}
            onClick={() => go(to.slice(3))}
            className={`text-left bg-white p-5 rounded-2xl border shadow-sm hover:border-indigo-300 transition ${hot ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-200"}`}
          >
            <div className="text-2xl font-bold text-slate-900">{v}</div>
            <div className="text-xs text-slate-500 font-medium">{k}</div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardTitle>New sign-ups · last 7 days</CardTitle>
          <div className="flex items-end gap-3 h-40">
            {st.signups.map((s) => (
              <div key={s.date} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-[10px] text-slate-500 mb-1">{s.count}</span>
                <div
                  className="w-full bg-indigo-500 rounded-t-lg min-h-[4px]"
                  style={{ height: (s.count / max) * 100 + "%" }}
                />
                <span className="text-[10px] text-slate-400 mt-1">{s.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>Latest members</CardTitle>
          <div className="space-y-3">
            {st.latest.map((u) => (
              <div key={u._id} className="flex items-center gap-3">
                <Avatar name={u.name} />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate">{u.name}</div>
                  <div className="text-[10px] text-slate-400">{fmt(u.createdAt)}</div>
                </div>
                <span className="ml-auto"><Pill tone={roleTone[u.role]}>{u.role}</Pill></span>
              </div>
            ))}
          </div>
        </Card>
        {[
          ["Applications by status", st.applicationStatus, st.applications],
          ["Sessions by status", st.sessionStatus, st.sessions],
        ].map(([t, o, total]) => (
          <Card key={t} className="lg:col-span-1">
            <CardTitle>{t}</CardTitle>
            <div className="space-y-3">
              {breakdown(o).map(([k, n]) => (
                <div key={k}>
                  <div className="flex justify-between text-xs mb-1 capitalize">
                    <span>{k}</span>
                    <b>{n}</b>
                  </div>
                  <Bar v={n} max={total || 1} />
                </div>
              ))}
              {!breakdown(o).length && <Empty>No data yet.</Empty>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Users ---------------- */
function UsersTab({ me }) {
  const act = useAct(),
    [us, load] = useLoad("/admin/users"),
    [q, setQ] = useState(""),
    [role, setRole] = useState("");
  if (!us) return <Loading />;
  const list = us.filter(
    (u) =>
      (!role || u.role === role) &&
      (u.name + " " + u.email).toLowerCase().includes(q.toLowerCase()),
  );
  const patch = (u, body, ok) => act(() => api.put("/admin/users/" + u._id, body), ok).then(load);
  return (
    <Card>
      <CardTitle
        right={
          <div className="flex gap-2">
            <input className={inp + " !w-48"} placeholder="Search name / email…" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className={inp + " !w-auto"} value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All roles</option>
              <option value="student">Students</option>
              <option value="mentor">Mentors</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        }
      >
        All Users ({list.length})
      </CardTitle>
      <Table head={["Name", "Email", "Role", "Status", "Joined", ""]} empty={!list.length && "No users match."}>
        {list.map((u) => {
          const self = u._id === me._id;
          return (
            <tr key={u._id}>
              <td className="font-semibold text-slate-900 whitespace-nowrap">{u.name}{self && " (you)"}</td>
              <td className="whitespace-nowrap">{u.email}</td>
              <td>
                <select
                  disabled={self}
                  className="border border-slate-200 rounded-lg p-1 text-[11px] disabled:opacity-60"
                  value={u.role}
                  onChange={(e) => patch(u, { role: e.target.value }, `${u.name} is now ${e.target.value}`)}
                >
                  <option value="student">student</option>
                  <option value="mentor">mentor</option>
                  <option value="admin">admin</option>
                </select>
                {u.role === "mentor" && u.mentorStatus !== "approved" && (
                  <span className="ml-1"><Pill tone="amber">{u.mentorStatus}</Pill></span>
                )}
              </td>
              <td>
                <Pill tone={u.active === false ? "rose" : "emerald"}>{u.active === false ? "suspended" : "active"}</Pill>
              </td>
              <td className="whitespace-nowrap text-slate-500">{fmt(u.createdAt)}</td>
              <td className="text-right whitespace-nowrap space-x-3">
                {!self && (
                  <>
                    <button
                      className="text-amber-600 hover:underline"
                      onClick={() => patch(u, { active: u.active === false }, u.active === false ? "User reactivated" : "User suspended")}
                    >
                      {u.active === false ? "Activate" : "Suspend"}
                    </button>
                    <button
                      className="text-indigo-600 hover:underline"
                      onClick={() => {
                        const p = prompt(`New password for ${u.name} (min 6 characters):`);
                        p && patch(u, { password: p }, "Password updated");
                      }}
                    >
                      Reset password
                    </button>
                    <button
                      className="text-rose-600 hover:underline"
                      onClick={() =>
                        confirm(`Delete ${u.name} and all their data (applications, sessions, messages…)?`) &&
                        act(() => api.delete("/admin/users/" + u._id), "User deleted").then(load)
                      }
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          );
        })}
      </Table>
    </Card>
  );
}

/* ---------------- Mentors ---------------- */
function MentorsTab() {
  const act = useAct(),
    [us, load] = useLoad("/admin/users");
  if (!us) return <Loading />;
  const all = us.filter((u) => u.role === "mentor"),
    pending = all.filter((u) => u.mentorStatus === "pending"),
    decide = (u, status) =>
      act(() => api.put("/admin/mentors/" + u._id, { status }), `Mentor ${u.name} ${status}`).then(load);
  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>Pending Mentor Verifications ({pending.length})</CardTitle>
        <div className="space-y-3">
          {pending.map((u) => (
            <div key={u._id} className="p-4 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={u.name} size="w-10 h-10" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">{u.name} · {u.email}</h4>
                  <p className="text-[11px] text-slate-500">
                    {u.headline || "No headline"}
                    {u.expertise?.length ? ` • ${u.expertise.join(", ")}` : ""}
                    {u.rate ? ` • ₹${u.rate}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Btn v="success" className="!py-1.5" onClick={() => decide(u, "approved")}>Approve</Btn>
                <Btn v="soft" className="!py-1.5" onClick={() => decide(u, "rejected")}>Reject</Btn>
              </div>
            </div>
          ))}
          {!pending.length && <Empty>No pending applications.</Empty>}
        </div>
      </Card>
      <Card>
        <CardTitle>All Mentors ({all.length})</CardTitle>
        <Table head={["Name", "Status", "Expertise", "Rate", "Rating", ""]}>
          {all.map((u) => (
            <tr key={u._id}>
              <td className="font-semibold text-slate-900 whitespace-nowrap">{u.name}</td>
              <td>
                <Pill tone={u.mentorStatus === "approved" ? "emerald" : u.mentorStatus === "pending" ? "amber" : "rose"}>{u.mentorStatus}</Pill>
              </td>
              <td>{u.expertise?.join(", ") || "–"}</td>
              <td>₹{u.rate || 0}</td>
              <td>{u.rating || "–"} ({u.ratingCount})</td>
              <td className="text-right whitespace-nowrap">
                {u.mentorStatus !== "approved" && (
                  <button className="text-emerald-600 hover:underline mr-3" onClick={() => decide(u, "approved")}>Approve</button>
                )}
                {u.mentorStatus !== "rejected" && (
                  <button className="text-rose-600 hover:underline" onClick={() => decide(u, "rejected")}>Revoke / Reject</button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

/* ---------------- Jobs ---------------- */
function JobsTab() {
  const act = useAct(),
    [js, load] = useLoad("/admin/jobs");
  if (!js) return <Loading />;
  return (
    <Card>
      <CardTitle>Job & Internship Postings ({js.length})</CardTitle>
      <p className="text-[11px] text-slate-500 mb-3">Post new roles from the “Jobs & ATS Tracker” page. Deleting a job also removes its applications.</p>
      <Table head={["Title", "Company", "Type", "Posted by", "Applicants", ""]} empty={!js.length && "No jobs yet."}>
        {js.map((j) => (
          <tr key={j._id}>
            <td className="font-semibold text-slate-900">{j.title}</td>
            <td>{j.company}</td>
            <td><Pill tone="violet">{j.type}</Pill></td>
            <td>{j.postedBy?.name || "System"}</td>
            <td>{j.applicants}</td>
            <td className="text-right">
              <button
                className="text-rose-600 hover:underline"
                onClick={() =>
                  confirm(`Delete "${j.title}"?`) && act(() => api.delete("/jobs/" + j._id), "Job deleted").then(load)
                }
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}

/* ---------------- Applications ---------------- */
function AppsTab() {
  const act = useAct(),
    [as, load] = useLoad("/applications");
  if (!as) return <Loading />;
  return (
    <Card>
      <CardTitle>All Applications ({as.length})</CardTitle>
      <Table head={["Candidate", "Job", "Company", "Applied", "Status"]} empty={!as.length && "No applications yet."}>
        {as.map((a) => (
          <tr key={a._id}>
            <td className="font-semibold text-slate-900 whitespace-nowrap">{a.user?.name}</td>
            <td>{a.job?.title || "—"}</td>
            <td>{a.job?.company}</td>
            <td className="whitespace-nowrap text-slate-500">{fmt(a.createdAt)}</td>
            <td>
              <select
                className="border border-slate-200 rounded-lg p-1 text-[11px]"
                value={a.status}
                onChange={(e) =>
                  act(() => api.put("/applications/" + a._id, { status: e.target.value }), "Status updated").then(load)
                }
              >
                {STATUSES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}

/* ---------------- Sessions ---------------- */
function SessionsTab() {
  const act = useAct(),
    [ss, load] = useLoad("/admin/sessions");
  if (!ss) return <Loading />;
  return (
    <Card>
      <CardTitle>Mentor Sessions ({ss.length})</CardTitle>
      <Table head={["Topic", "Student", "Mentor", "Date", "Status", ""]} empty={!ss.length && "No sessions yet."}>
        {ss.map((s) => (
          <tr key={s._id}>
            <td className="font-semibold text-slate-900">{s.topic}</td>
            <td>{s.student?.name || "—"}</td>
            <td>{s.mentor?.name || "—"}</td>
            <td className="whitespace-nowrap">{fmt(s.date)}</td>
            <td><Pill tone={sessTone[s.status]}>{s.status}</Pill></td>
            <td className="text-right">
              {["pending", "accepted"].includes(s.status) && (
                <button
                  className="text-rose-600 hover:underline"
                  onClick={() =>
                    confirm("Cancel this session? Both users will be notified.") &&
                    act(() => api.put("/admin/sessions/" + s._id, { status: "cancelled" }), "Session cancelled").then(load)
                  }
                >
                  Cancel
                </button>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}

/* ---------------- Reviews ---------------- */
function ReviewsTab() {
  const act = useAct(),
    [rs, load] = useLoad("/admin/reviews");
  if (!rs) return <Loading />;
  return (
    <Card>
      <CardTitle>Review Moderation ({rs.length})</CardTitle>
      <Table head={["Mentor", "By", "Rating", "Comment", ""]} empty={!rs.length && "No reviews yet."}>
        {rs.map((r) => (
          <tr key={r._id}>
            <td className="font-semibold text-slate-900 whitespace-nowrap">{r.mentor?.name || "—"}</td>
            <td className="whitespace-nowrap">{r.student?.name || "—"}</td>
            <td className="text-amber-500 whitespace-nowrap">{"★".repeat(r.rating)}</td>
            <td className="max-w-xs truncate" title={r.comment}>{r.comment || "–"}</td>
            <td className="text-right">
              <button
                className="text-rose-600 hover:underline"
                onClick={() =>
                  confirm("Delete this review? The mentor's rating will be recalculated.") &&
                  act(() => api.delete("/admin/reviews/" + r._id), "Review deleted").then(load)
                }
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}

/* ---------------- Announcements ---------------- */
function Announce() {
  const act = useAct(),
    toast = useToast(),
    [text, setText] = useState(""),
    [audience, setAudience] = useState("all"),
    [busy, setBusy] = useState(false);
  const send = async (e) => {
    e.preventDefault();
    if (!confirm(`Send this to ${audience === "all" ? "everyone" : audience + "s"}?`)) return;
    setBusy(true);
    let n = 0;
    const ok = await act(async () => (n = (await api.post("/admin/announce", { text, audience })).data.sent));
    setBusy(false);
    if (ok) {
      toast(`Announcement sent to ${n} user${n === 1 ? "" : "s"}`);
      setText("");
    }
  };
  return (
    <Card className="max-w-xl">
      <CardTitle icon={Megaphone}>Send an announcement</CardTitle>
      <p className="text-[11px] text-slate-500 mb-3">It appears instantly as a notification for every selected user.</p>
      <form onSubmit={send} className="space-y-3">
        <select className={inp} value={audience} onChange={(e) => setAudience(e.target.value)}>
          <option value="all">Everyone</option>
          <option value="student">Students only</option>
          <option value="mentor">Mentors only</option>
        </select>
        <textarea className={inp} rows="3" maxLength={300} placeholder="Write your message (max 300 characters)…" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">{text.length}/300</span>
          <Btn disabled={busy || text.trim().length < 3}>Send announcement</Btn>
        </div>
      </form>
    </Card>
  );
}

/* ---------------- Page ---------------- */
export default function Admin() {
  const { user } = useContext(Ctx),
    [tab, setTab] = useState("overview");
  const body = {
    overview: <Overview go={setTab} />,
    users: <UsersTab me={user} />,
    mentors: <MentorsTab />,
    jobs: <JobsTab />,
    apps: <AppsTab />,
    sessions: <SessionsTab />,
    reviews: <ReviewsTab />,
    announce: <Announce />,
  }[tab];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Admin Control Panel</h2>
          <p className="text-xs text-slate-500">Manage users, verify mentors, moderate content and oversee the whole platform.</p>
        </div>
        <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200 inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Admin Access
        </span>
      </div>
      <div className="flex gap-1 overflow-x-auto scrollbar border-b border-slate-200">
        {TABS.map(([k, label, Icon]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5 border-b-2 -mb-px transition ${tab === k ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
      {body}
    </div>
  );
}