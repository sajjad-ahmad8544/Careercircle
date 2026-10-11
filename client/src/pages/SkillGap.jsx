import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, AlertCircle, Map as MapIcon, Check } from "lucide-react";
import api from "../services/api";
import { Ctx } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { Card, CardTitle, Btn, Bar, Empty } from "../components/ui";
import { SKILLS } from "../utils/constants";

export default function SkillGap() {
  const { user, setUser } = useContext(Ctx),
    nav = useNavigate(),
    toast = useToast();
  const [busy, setBusy] = useState(false),
    [advice, setAdvice] = useState(""),
    [sk, setSk] = useState(""),
    [qs, setQs] = useState(null),
    [ans, setAns] = useState([]);
  const refresh = async () => setUser((await api.get("/me")).data);
  const run = async () => {
    if (!user.targetRole)
      return toast("Set a target role in your profile first");
    setBusy(true);
    try {
      const { data } = await api.get("/gap");
      setAdvice(data.advice);
      await refresh();
      toast("AI analysis completed successfully!");
    } catch {
      toast("Analysis failed, please try again");
    }
    setBusy(false);
  };
  const start = async (s) => {
    setSk(s);
    setAns([]);
    setQs((await api.get("/assessment/" + s)).data);
  };
  const submit = async () => {
    const { data } = await api.post("/assessment/" + sk, { answers: ans });
    setQs(null);
    await refresh();
    toast(`${sk}: ${data.right}/${data.total} correct → ${data.level}%`);
  };
  const toggle = async (i) => {
    const { data } = await api.put("/roadmap/" + i);
    setUser({ ...user, roadmap: data });
  };
  const done = user.roadmap.filter((x) => x.done).length,
    pct = user.roadmap.length
      ? Math.round((done / user.roadmap.length) * 100)
      : 0;
  const level = (n) => user.skills.find((s) => s.name === n)?.level || 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            AI Engine
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            AI Skill-Gap & Roadmap Analyzer
          </h2>
          <p className="text-violet-100 text-xs sm:text-sm">
            Compare your skills with your target role (
            {user.targetRole || "not set"}) and generate a custom learning plan.
          </p>
        </div>
        <Btn
          v="white"
          className="!py-3 !px-5 shrink-0"
          disabled={busy}
          onClick={run}
        >
          {busy ? "Analysing…" : "Run AI Analysis Now"}
        </Btn>
      </div>
      {!user.targetRole && (
        <div
          className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 cursor-pointer"
          onClick={() => nav("/profile")}
        >
          Target role set nahi hai. Profile → Edit Profile mein jaakar choose
          karo →
        </div>
      )}
      {advice && (
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
          <h4 className="font-bold text-indigo-900 text-xs mb-1">AI Advice</h4>
          <p className="text-xs text-indigo-700 whitespace-pre-wrap">
            {advice}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardTitle icon={AlertCircle}>Identified Skill Gaps</CardTitle>
          <div className="space-y-3">
            {user.gap.map((g) => {
              const l = level(g);
              return (
                <div
                  key={g}
                  className={`p-3 border rounded-xl flex items-center justify-between ${l ? "bg-amber-50 border-amber-100" : "bg-rose-50 border-rose-100"}`}
                >
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs">
                      {g}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Required for {user.targetRole}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold ${l ? "bg-amber-200 text-amber-800" : "bg-rose-200 text-rose-800"}`}
                  >
                    {l ? `${l}%` : "Missing"}
                  </span>
                </div>
              );
            })}
            {!user.gap.length && (
              <Empty>
                {user.targetRole
                  ? "No gaps found. Run the analysis to refresh."
                  : "Run the analysis to see your gaps."}
              </Empty>
            )}
          </div>
        </Card>
        <Card>
          <CardTitle
            icon={MapIcon}
            right={
              <span className="text-xs font-semibold text-indigo-600">
                {pct}% done
              </span>
            }
          >
            AI-Generated Roadmap
          </CardTitle>
          <Bar v={pct} />
          <div className="space-y-3 mt-4">
            {user.roadmap.map((x, i) => (
              <div
                key={i}
                className="flex items-start space-x-3 cursor-pointer"
                onClick={() => toggle(i)}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${x.done ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white"}`}
                >
                  {x.done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <h4
                  className={`font-semibold text-xs pt-1 ${x.done ? "line-through text-slate-400" : "text-slate-900"}`}
                >
                  {x.title}
                </h4>
              </div>
            ))}
            {!user.roadmap.length && (
              <Empty>Your roadmap appears after the AI analysis.</Empty>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>Skill Assessments</CardTitle>
        {!qs ? (
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <Btn key={s} v="ghost" onClick={() => start(s)}>
                {s} {level(s) ? `· ${level(s)}%` : ""}
              </Btn>
            ))}
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-3">{sk} assessment</p>
            {qs.map((q, i) => (
              <div key={i} className="mb-4">
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  {i + 1}. {q.q}
                </p>
                {q.options.map((o, j) => (
                  <label
                    key={j}
                    className="flex items-center gap-2 text-xs py-1 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={"q" + i}
                      onChange={() => {
                        const a = [...ans];
                        a[i] = j;
                        setAns(a);
                      }}
                    />
                    {o}
                  </label>
                ))}
              </div>
            ))}
            <div className="flex gap-2">
              <Btn
                disabled={ans.filter((x) => x !== undefined).length < qs.length}
                onClick={submit}
              >
                Submit {sk}
              </Btn>
              <Btn v="ghost" onClick={() => setQs(null)}>
                Cancel
              </Btn>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}