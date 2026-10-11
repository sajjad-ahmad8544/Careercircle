import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Edit3,
  MapPin,
  Cpu,
  FolderGit2,
  ExternalLink,
  Trash2,
} from "lucide-react";
import api from "../services/api";
import { Ctx } from "../context/AuthContext";
import useLoad from "../hooks/useLoad";
import Avatar from "../components/Avatar";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { Card, CardTitle, Btn, Pill, Empty, inp } from "../components/ui";
import { ROLES } from "../utils/constants";
import { levelLabel } from "../utils/helpers";

const L = (t) =>
  t
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

export default function Profile() {
  const { user, setUser } = useContext(Ctx),
    nav = useNavigate(),
    toast = useToast(),
    R = user.resume || {};
  const [edit, setEdit] = useState(false),
    [add, setAdd] = useState(false),
    [ps, load] = useLoad("/projects");
  const [f, setF] = useState({
    name: user.name,
    headline: user.headline || "",
    bio: user.bio || "",
    targetRole: user.targetRole || "",
    summary: R.summary || "",
    education: (R.education || []).join("\n"),
    experience: (R.experience || []).join("\n"),
    expertise: (user.expertise || []).join(", "),
    rate: user.rate || 0,
  });
  const [p, setP] = useState({
    title: "",
    description: "",
    link: "",
    tech: "",
  });
  const ch = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const { data } = await api.put("/me", {
      name: f.name,
      headline: f.headline,
      bio: f.bio,
      targetRole: f.targetRole,
      rate: +f.rate,
      expertise: f.expertise
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      resume: {
        summary: f.summary,
        education: L(f.education),
        experience: L(f.experience),
      },
    });
    setUser(data);
    setEdit(false);
    toast("Profile saved successfully!");
  };
  const addProject = async (e) => {
    e.preventDefault();
    await api.post("/projects", p);
    setP({ title: "", description: "", link: "", tech: "" });
    setAdd(false);
    load();
    toast("Project added to your portfolio!");
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <Avatar
            name={user.name}
            size="w-20 h-20"
            text="text-2xl"
            className="!rounded-2xl shadow-md"
          />
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <Pill tone="indigo">
                {user.role === "mentor"
                  ? "Mentor"
                  : user.role === "admin"
                    ? "Admin"
                    : "Verified Student"}
              </Pill>
            </div>
            <p className="text-slate-500 text-sm">
              {user.headline || "Add a headline to introduce yourself"}
            </p>
            <p className="text-xs text-slate-400 mt-1 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {user.email || "CareerCircle member"}
              {user.targetRole && ` • Target: ${user.targetRole}`}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Btn
            onClick={() => {
              toast('Choose "Save as PDF" in the print window');
              setTimeout(() => window.print(), 600);
            }}
          >
            <Download className="w-4 h-4" />
            Download Resume
          </Btn>
          <Btn v="ghost" onClick={() => setEdit(!edit)}>
            <Edit3 className="w-4 h-4" />
            {edit ? "Close" : "Edit Profile"}
          </Btn>
        </div>
      </Card>

      {edit && (
        <Card>
          <CardTitle>Edit profile & resume</CardTitle>
          <form onSubmit={save} className="grid md:grid-cols-2 gap-3">
            <input
              className={inp}
              name="name"
              placeholder="Name"
              value={f.name}
              onChange={ch}
            />
            <input
              className={inp}
              name="headline"
              placeholder="Headline (e.g. Final-year CSE student)"
              value={f.headline}
              onChange={ch}
            />
            {user.role === "student" && (
              <select
                className={inp}
                name="targetRole"
                value={f.targetRole}
                onChange={ch}
              >
                <option value="">Target role…</option>
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            )}
            {user.role === "mentor" && (
              <>
                <input
                  className={inp}
                  name="expertise"
                  placeholder="Expertise (comma separated)"
                  value={f.expertise}
                  onChange={ch}
                />
                <input
                  className={inp}
                  name="rate"
                  type="number"
                  placeholder="Rate ₹ per session"
                  value={f.rate}
                  onChange={ch}
                />
              </>
            )}
            <textarea
              className={inp + " md:col-span-2"}
              rows="2"
              name="bio"
              placeholder="Bio"
              value={f.bio}
              onChange={ch}
            />
            <textarea
              className={inp + " md:col-span-2"}
              rows="2"
              name="summary"
              placeholder="Resume summary"
              value={f.summary}
              onChange={ch}
            />
            <textarea
              className={inp}
              rows="3"
              name="education"
              placeholder="Education (one per line)"
              value={f.education}
              onChange={ch}
            />
            <textarea
              className={inp}
              rows="3"
              name="experience"
              placeholder="Experience (one per line)"
              value={f.experience}
              onChange={ch}
            />
            <div className="md:col-span-2">
              <Btn>Save profile</Btn>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardTitle icon={Cpu}>Verified Skills & Assessments</CardTitle>
        <div className="flex flex-wrap gap-2">
          {user.skills.map((s) => (
            <span
              key={s.name}
              className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            >
              <span>{s.name}</span>
              <span className="bg-indigo-200 text-indigo-800 text-[10px] px-1.5 rounded">
                {levelLabel(s.level)} · {s.level}%
              </span>
            </span>
          ))}
          {user.expertise?.map((x) => (
            <span
              key={x}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              {x}
            </span>
          ))}
          <button
            onClick={() => nav("/skill-gap")}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-dashed border-slate-300"
          >
            + Add Skill
          </button>
        </div>
      </Card>

      <Card>
        <CardTitle
          icon={FolderGit2}
          right={
            <button
              onClick={() => setAdd(true)}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              + Add Project
            </button>
          }
        >
          Project Portfolio
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(ps || []).map((x) => (
            <div
              key={x._id}
              className="p-5 border border-slate-200 rounded-xl hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-900 text-sm">{x.title}</h4>
                <button
                  onClick={async () => {
                    await api.delete("/projects/" + x._id);
                    load();
                  }}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-3">{x.description}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {x.tech.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
              {x.link && (
                <a
                  href={x.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  Open project
                </a>
              )}
            </div>
          ))}
        </div>
        {ps && !ps.length && (
          <Empty>No projects yet. Add your first project!</Empty>
        )}
      </Card>

      {add && (
        <Modal title="Add project" onClose={() => setAdd(false)}>
          <form onSubmit={addProject} className="space-y-3">
            <input
              className={inp}
              placeholder="Title"
              value={p.title}
              onChange={(e) => setP({ ...p, title: e.target.value })}
              required
            />
            <textarea
              className={inp}
              rows="3"
              placeholder="Description"
              value={p.description}
              onChange={(e) => setP({ ...p, description: e.target.value })}
            />
            <input
              className={inp}
              placeholder="Link (GitHub / live demo)"
              value={p.link}
              onChange={(e) => setP({ ...p, link: e.target.value })}
            />
            <input
              className={inp}
              placeholder="Tech (comma separated)"
              value={p.tech}
              onChange={(e) => setP({ ...p, tech: e.target.value })}
            />
            <Btn className="w-full">Add project</Btn>
          </form>
        </Modal>
      )}

      {/* printable resume */}
      <div id="resume" className="hidden">
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>{user.name}</h1>
        <p>{user.headline}</p>
        <p>{user.email}</p>
        <hr />
        {R.summary && (
          <>
            <h3>Summary</h3>
            <p>{R.summary}</p>
          </>
        )}
        {!!R.education?.length && (
          <>
            <h3>Education</h3>
            <ul>
              {R.education.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </>
        )}
        {!!R.experience?.length && (
          <>
            <h3>Experience</h3>
            <ul>
              {R.experience.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </>
        )}
        {!!user.skills.length && (
          <>
            <h3>Skills</h3>
            <p>
              {user.skills.map((s) => `${s.name} (${s.level}%)`).join(" · ")}
            </p>
          </>
        )}
        {!!ps?.length && (
          <>
            <h3>Projects</h3>
            <ul>
              {ps.map((x) => (
                <li key={x._id}>
                  <b>{x.title}</b> — {x.description}{" "}
                  {x.tech.length ? `[${x.tech.join(", ")}]` : ""}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
