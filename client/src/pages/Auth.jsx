import { useState, useContext } from "react";
import { Sparkles } from "lucide-react";
import api from "../services/api";
import { Ctx } from "../context/AuthContext";
import { Btn, inp } from "../components/ui";
import { fail } from "../utils/helpers";

export default function Auth() {
  const { setUser } = useContext(Ctx);
  const [reg, setReg] = useState(false),
    [f, setF] = useState({
      name: "",
      email: "",
      password: "",
      role: "student",
    }),
    [err, setErr] = useState("");
  const ch = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const go = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post(
        reg ? "/auth/register" : "/auth/login",
        f,
      );
      localStorage.setItem("t", data.token);
      setUser(data.user);
    } catch (x) {
      setErr(fail(x));
    }
  };
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      <div className="hidden lg:flex flex-col justify-center p-14 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-16 -translate-y-16 w-96 h-96 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 max-w-md">
          <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-yellow-300" />
            AI-Powered Platform
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            CareerCircle
          </h1>
          <p className="text-indigo-100">
            Profile, skills, mentors, jobs, mock interviews and a personal
            roadmap — your complete career ecosystem in one place.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <form
          onSubmit={go}
          className="w-full max-w-sm bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3"
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
              CC
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg leading-tight">
                {reg ? "Create account" : "Welcome back"}
              </h2>
              <p className="text-xs text-slate-500">
                {reg ? "Start your career journey" : "Login to continue"}
              </p>
            </div>
          </div>
          {reg && (
            <input
              className={inp}
              name="name"
              placeholder="Full name"
              value={f.name}
              onChange={ch}
              required
            />
          )}
          <input
            className={inp}
            name="email"
            type="email"
            placeholder="Email"
            value={f.email}
            onChange={ch}
            required
          />
          <input
            className={inp}
            name="password"
            type="password"
            placeholder="Password"
            value={f.password}
            onChange={ch}
            required
          />
          {reg && (
            <select className={inp} name="role" value={f.role} onChange={ch}>
              <option value="student">I'm a Student</option>
              <option value="mentor">
                I'm a Mentor (needs admin approval)
              </option>
            </select>
          )}
          {err && <p className="text-xs text-rose-600">{err}</p>}
          <Btn className="w-full">{reg ? "Create account" : "Login"}</Btn>
          <p
            className="text-xs text-center text-slate-500 cursor-pointer hover:text-indigo-600"
            onClick={() => setReg(!reg)}
          >
            {reg ? "Have an account? Login" : "New here? Register"}
          </p>
        </form>
      </div>
    </div>
  );
}
