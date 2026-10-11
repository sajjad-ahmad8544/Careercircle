import { useState, useContext } from "react";
import { Search, Kanban, Trash2, Plus } from "lucide-react";
import api from "../services/api";
import { Ctx } from "../context/AuthContext";
import useLoad from "../hooks/useLoad";
import useDebounce from "../hooks/useDebounce";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import {
  Card,
  CardTitle,
  Title,
  Btn,
  Pill,
  Empty,
  inp,
} from "../components/ui";
import { atsGroup, STATUSES, fail } from "../utils/helpers";

const TONES = [
  "bg-indigo-50 text-indigo-600",
  "bg-rose-50 text-rose-600",
  "bg-amber-50 text-amber-600",
  "bg-emerald-50 text-emerald-600",
  "bg-violet-50 text-violet-600",
];
const COLS = [
  {
    k: "Applied",
    wrap: "bg-slate-50 border-slate-200",
    head: "text-slate-700",
    pill: "bg-slate-200",
    card: "border-slate-200",
  },
  {
    k: "Interviewing",
    wrap: "bg-indigo-50/50 border-indigo-100",
    head: "text-indigo-700",
    pill: "bg-indigo-200",
    card: "border-indigo-200",
  },
  {
    k: "Offered",
    wrap: "bg-emerald-50/50 border-emerald-100",
    head: "text-emerald-700",
    pill: "bg-emerald-200",
    card: "border-emerald-200",
  },
  {
    k: "Archived",
    wrap: "bg-slate-50 border-slate-200",
    head: "text-slate-700",
    pill: "bg-slate-200",
    card: "border-slate-200 opacity-70",
  },
];
const empty = {
  title: "",
  company: "",
  type: "job",
  skills: "",
  location: "",
  description: "",
};

export default function Jobs() {
  const { user } = useContext(Ctx),
    toast = useToast(),
    [q, setQ] = useState(""),
    [type, setType] = useState(""),
    [post, setPost] = useState(false),
    [f, setF] = useState(empty),
    dq = useDebounce(q);
  const [jobs, loadJ] = useLoad(
      `/jobs?q=${encodeURIComponent(dq)}&type=${type}`,
      [dq, type],
    ),
    [apps, loadA] = useLoad("/applications");
  const admin = user.role === "admin",
    manage = admin || user.role === "mentor",
    student = user.role === "student",
    applied = new Set((apps || []).map((a) => a.job?._id));
  const match = (j) => {
    const n = j.skills.filter((s) =>
      user.skills.some(
        (x) => x.name.toLowerCase() === s.toLowerCase() && x.level >= 60,
      ),
    ).length;
    return j.skills.length ? Math.round((n / j.skills.length) * 100) : 0;
  };
  const apply = (j) =>
    api
      .post("/apply/" + j._id)
      .then(() => {
        toast(`Application submitted to ${j.company}!`);
        loadA();
      })
      .catch((e) => toast(fail(e)));
  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/jobs", f);
      setF(empty);
      setPost(false);
      loadJ();
      toast("Job posted!");
    } catch (x) {
      toast(fail(x));
    }
  };
  const move = async (id, status) => {
    try {
      await api.put("/applications/" + id, { status });
      loadA();
      toast("Status updated");
    } catch (x) {
      toast(fail(x));
    }
  };

  return (
    <div className="space-y-6">
      <Title
        title="Job & Internship Board"
        sub="Explore curated roles and track your application status in real-time."
        right={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                className={inp + " !pl-9 !w-52"}
                placeholder="Search roles, skills…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select
              className={inp + " !w-auto"}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All</option>
              <option value="job">Jobs</option>
              <option value="internship">Internships</option>
            </select>
            {!student && (
              <Btn onClick={() => setPost(true)}>
                <Plus className="w-4 h-4" />
                Post job
              </Btn>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(jobs || []).map((j) => {
          const m = match(j),
            tone =
              TONES[
                [...j.company].reduce((a, c) => a + c.charCodeAt(0), 0) %
                  TONES.length
              ];
          return (
            <div
              key={j._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${tone}`}
                  >
                    {j.company[0]}
                  </div>
                  <div className="flex gap-1.5 items-center">
                    {student && (
                      <Pill
                        tone={m >= 80 ? "emerald" : m >= 50 ? "amber" : "slate"}
                      >
                        {m}% Match
                      </Pill>
                    )}
                    <Pill tone="violet">{j.type}</Pill>
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{j.title}</h4>
                <p className="text-xs text-slate-500 mb-3">
                  {j.company} • {j.location}
                </p>
                <p className="text-xs text-slate-600 mb-3">{j.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {j.skills.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {student && (
                <Btn disabled={applied.has(j._id)} onClick={() => apply(j)}>
                  {applied.has(j._id) ? "Applied ✓" : "Apply via ATS"}
                </Btn>
              )}
              {admin && (
                <Btn
                  v="danger"
                  onClick={async () => {
                    await api.delete("/jobs/" + j._id);
                    loadJ();
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Btn>
              )}
            </div>
          );
        })}
        {jobs && !jobs.length && <Empty>No jobs found.</Empty>}
      </div>

      <Card>
        <CardTitle icon={Kanban}>
          Application Tracking System (ATS) Board
        </CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLS.map((c) => {
            const list = (apps || []).filter((a) => atsGroup(a.status) === c.k);
            return (
              <div key={c.k} className={`p-4 rounded-xl border ${c.wrap}`}>
                <div
                  className={`text-xs font-bold mb-3 flex justify-between ${c.head}`}
                >
                  <span>{c.k}</span>
                  <span className={`px-2 rounded-full text-[10px] ${c.pill}`}>
                    {list.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {list.map((a) => (
                    <div
                      key={a._id}
                      className={`bg-white p-3 rounded-lg border text-xs ${c.card}`}
                    >
                      <div className="font-semibold text-slate-900">
                        {a.job?.company}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {a.job?.title}
                        {manage && ` • ${a.user?.name}`}
                      </div>
                      {manage && (
                        <select
                          className="mt-2 w-full text-[11px] border border-slate-200 rounded-lg p-1"
                          value={a.status}
                          onChange={(e) => move(a._id, e.target.value)}
                        >
                          {STATUSES.map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                  {!list.length && (
                    <p className="text-[11px] text-slate-400">
                      Nothing here yet
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {post && (
        <Modal title="Post a job / internship" onClose={() => setPost(false)}>
          <form onSubmit={create} className="space-y-3">
            <input
              className={inp}
              placeholder="Title"
              value={f.title}
              onChange={(e) => setF({ ...f, title: e.target.value })}
              required
            />
            <input
              className={inp}
              placeholder="Company"
              value={f.company}
              onChange={(e) => setF({ ...f, company: e.target.value })}
              required
            />
            <select
              className={inp}
              value={f.type}
              onChange={(e) => setF({ ...f, type: e.target.value })}
            >
              <option value="job">Job</option>
              <option value="internship">Internship</option>
            </select>
            <input
              className={inp}
              placeholder="Skills (comma separated)"
              value={f.skills}
              onChange={(e) => setF({ ...f, skills: e.target.value })}
            />
            <input
              className={inp}
              placeholder="Location"
              value={f.location}
              onChange={(e) => setF({ ...f, location: e.target.value })}
            />
            <textarea
              className={inp}
              rows="3"
              placeholder="Description"
              value={f.description}
              onChange={(e) => setF({ ...f, description: e.target.value })}
            />
            <Btn className="w-full">Post</Btn>
          </form>
        </Modal>
      )}
    </div>
  );
}