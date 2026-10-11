export const inp =
  "w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500";
const V = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
  ghost: "border border-slate-200 hover:bg-slate-50 text-slate-700",
  dark: "bg-slate-900 hover:bg-slate-800 text-white",
  danger: "bg-rose-50 hover:bg-rose-100 text-rose-700",
  success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  white: "bg-white text-indigo-700 hover:bg-indigo-50 shadow-md",
  soft: "bg-slate-100 hover:bg-slate-200 text-slate-700",
};
export const Btn = ({ v = "primary", className = "", ...p }) => (
  <button
    {...p}
    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${V[v]} ${className}`}
  />
);
export const Card = ({ className = "", children }) => (
  <section
    className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm ${className}`}
  >
    {children}
  </section>
);
export const CardTitle = ({ icon: I, children, right }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-bold text-slate-900 text-base flex items-center">
      {I && <I className="w-5 h-5 mr-2 text-indigo-600" />}
      {children}
    </h3>
    {right}
  </div>
);
export const Title = ({ title, sub, right }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
    {right}
  </div>
);
export const Pill = ({ tone = "slate", children }) => {
  const T = {
    slate: "bg-slate-100 text-slate-700",
    indigo: "bg-indigo-100 text-indigo-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
    violet: "bg-violet-100 text-violet-700",
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${T[tone]}`}
    >
      {children}
    </span>
  );
};
export const Bar = ({ v, max = 100 }) => (
  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
    <div
      className="bg-indigo-600 h-full rounded-full transition-all"
      style={{ width: Math.min(100, (v / max) * 100) + "%" }}
    />
  </div>
);
export const Empty = ({ children }) => (
  <p className="text-xs text-slate-400 py-4 text-center">{children}</p>
);
export const Loading = () => (
  <p className="text-sm text-slate-400 py-10 text-center">Loading…</p>
);
