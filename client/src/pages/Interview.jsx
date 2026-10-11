import { useState, useEffect, useContext, useRef } from "react";
import { Mic, Square, Volume2 } from "lucide-react";
import api from "../services/api";
import { Ctx } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { Card, Title, Btn, inp } from "../components/ui";
import { ROLES } from "../utils/constants";

// Browser speech APIs (best in Chrome / Edge)
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function Interview() {
  const { user, setUser } = useContext(Ctx),
    toast = useToast();
  const [role, setRole] = useState(user.targetRole || ROLES[0]),
    [qs, setQs] = useState(null),
    [i, setI] = useState(0),
    [a, setA] = useState(""),
    [fb, setFb] = useState(null),
    [sc, setSc] = useState([]);
  const [listening, setListening] = useState(false),
    rec = useRef();

  const speak = (t) => {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = "en-IN";
    speechSynthesis.speak(u);
  };
  const stopMic = () => {
    rec.current?.stop();
    setListening(false);
  };
  const toggleMic = () => {
    if (listening) return stopMic();
    speechSynthesis?.cancel();
    const r = new SR(),
      base = a ? a + " " : "";
    r.lang = "en-IN";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) =>
      setA(
        base +
          Array.from(e.results)
            .map((x) => x[0].transcript)
            .join(" "),
      );
    r.onend = () => setListening(false);
    r.onerror = (e) => {
      setListening(false);
      if (e.error === "not-allowed")
        toast("Mic permission allow karo (address bar ke lock icon se)");
    };
    rec.current = r;
    r.start();
    setListening(true);
  };
  useEffect(() => {
    if (qs && i < qs.length) speak(qs[i]);
    return () => {
      speechSynthesis?.cancel();
      rec.current?.stop();
    };
  }, [qs, i]);

  const start = async () => {
    setQs((await api.get("/interview?role=" + role)).data);
    setI(0);
    setSc([]);
    setFb(null);
    setA("");
  };
  const submit = async () => {
    stopMic();
    const { data } = await api.post("/interview", {
      question: qs[i],
      answer: a,
    });
    setFb(data);
    setSc([...sc, data.score]);
  };
  const next = async () => {
    setI(i + 1);
    setA("");
    setFb(null);
    if (i + 1 === qs.length) setUser((await api.get("/me")).data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              AI Mock Interview Simulator
            </h2>
            <p className="text-xs text-slate-500">
              Practice live technical & behavioral rounds — speak your answers
              and get instant AI feedback.
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
            AI Interviewer Active
          </span>
        </div>

        {!qs && (
          <div className="flex flex-wrap gap-3 items-center">
            <select
              className={inp + " !w-64"}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <Btn onClick={start}>
              <Mic className="w-4 h-4" />
              Start interview
            </Btn>
          </div>
        )}

        {qs && i < qs.length && (
          <>
            <div className="bg-slate-900 text-white p-6 rounded-2xl mb-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold">
                  AI
                </div>
                <div>
                  <h4 className="font-bold text-sm">Interviewer ({role})</h4>
                  <p className="text-[10px] text-slate-400">
                    Question {i + 1} of {qs.length}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-100 bg-slate-800/80 p-4 rounded-xl border border-slate-700 mb-4">
                "{qs[i]}"
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => speak(qs[i])}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  Repeat
                </button>
                {SR ? (
                  <button
                    disabled={!!fb}
                    onClick={toggleMic}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md disabled:opacity-50 ${listening ? "bg-rose-600 hover:bg-rose-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
                  >
                    {listening ? (
                      <>
                        <Square className="w-4 h-4" />
                        Stop recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Speak Your Answer
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 self-center">
                    Voice ke liye Chrome/Edge use karo, ya neeche type karo.
                  </span>
                )}
              </div>
              {listening && (
                <p className="text-xs text-emerald-400 mt-3 text-right animate-pulse">
                  🔴 Listening… bolna shuru karo
                </p>
              )}
            </div>
            <textarea
              className={inp}
              rows="4"
              value={a}
              onChange={(e) => setA(e.target.value)}
              disabled={!!fb}
              placeholder="Aapka bola hua answer yahan dikhega (edit bhi kar sakte ho)…"
            />
            <div className="mt-3">
              {!fb ? (
                <Btn disabled={!a.trim()} onClick={submit}>
                  Get AI feedback
                </Btn>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <h4 className="font-bold text-indigo-900 text-xs mb-1">
                      Answer Evaluation · Score {fb.score}/10
                    </h4>
                    <p className="text-xs text-indigo-700">{fb.feedback}</p>
                  </div>
                  <Btn onClick={next}>
                    {i + 1 === qs.length ? "Finish" : "Next question"}
                  </Btn>
                </div>
              )}
            </div>
          </>
        )}

        {qs && i >= qs.length && (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <h3 className="font-bold text-emerald-800">
              Interview complete 🎉
            </h3>
            <p className="text-sm text-emerald-700 my-2">
              Average score:{" "}
              <b>{(sc.reduce((x, y) => x + y, 0) / sc.length).toFixed(1)}/10</b>
            </p>
            <Btn onClick={() => setQs(null)}>Try again</Btn>
          </div>
        )}
      </Card>
    </div>
  );
}
