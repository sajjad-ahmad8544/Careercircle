import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle } from "lucide-react";

const T = createContext(() => {});
export const useToast = () => useContext(T);

export function ToastProvider({ children }) {
  const [m, setM] = useState("");
  const show = useCallback((msg) => {
    setM(msg);
    clearTimeout(window.__toast);
    window.__toast = setTimeout(() => setM(""), 3000);
  }, []);
  return (
    <T.Provider value={show}>
      {children}
      <div
        className={`fixed bottom-5 right-5 z-50 transition-all duration-300 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${m ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"}`}
      >
        <CheckCircle className="w-5 h-5 text-emerald-400" />
        <span className="text-sm font-medium">{m}</span>
      </div>
    </T.Provider>
  );
}
