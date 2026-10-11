import { useState, useEffect, useRef, useContext } from "react";
import { Send, ArrowLeft } from "lucide-react";
import api from "../services/api";
import { socket } from "../services/socket";
import { Ctx } from "../context/AuthContext";
import useLoad from "../hooks/useLoad";
import Avatar from "../components/Avatar";
import { useToast } from "../components/Toast";
import { fail } from "../utils/helpers";
import { Title, Btn, Empty, inp } from "../components/ui";

export default function Chat() {
  const { user } = useContext(Ctx),
    toast = useToast(),
    [people] = useLoad("/people"),
    [to, setTo] = useState(null),
    [msgs, setMsgs] = useState([]),
    [t, setT] = useState(""),
    [online, setOnline] = useState(socket.connected),
    end = useRef();

  // show whether the live connection is up
  useEffect(() => {
    const up = () => setOnline(true),
      down = () => setOnline(false);
    socket.on("connect", up);
    socket.on("disconnect", down);
    socket.on("connect_error", down);
    if (!socket.connected && localStorage.getItem("t")) socket.connect();
    setOnline(socket.connected);
    return () => {
      socket.off("connect", up);
      socket.off("disconnect", down);
      socket.off("connect_error", down);
    };
  }, []);

  // add a message once (history + live messages can overlap)
  const add = (m) => setMsgs((x) => (x.some((y) => y._id === m._id) ? x : [...x, m]));

  useEffect(() => {
    if (!to) return;
    setMsgs([]);
    let live = true;
    const on = (m) => {
      if (m.from === to._id || m.to === to._id) add(m);
    };
    socket.on("msg", on); // listen first so nothing is missed while history loads
    api
      .get("/messages/" + to._id)
      .then((r) => live && setMsgs((x) => [...r.data, ...x.filter((m) => !r.data.some((h) => h._id === m._id))]))
      .catch(() => toast("Could not load messages"));
    return () => {
      live = false;
      socket.off("msg", on);
    };
  }, [to]);
  useEffect(() => {
    end.current?.scrollIntoView();
  }, [msgs]);
  const send = async (e) => {
    e.preventDefault();
    const text = t.trim();
    if (!text) return;
    setT("");
    if (socket.connected) return socket.emit("msg", { to: to._id, text });
    try {
      // websocket is down: send over normal HTTP, the server still delivers it live to the other person
      add((await api.post("/messages/" + to._id, { text })).data);
    } catch (x) {
      setT(text);
      toast(fail(x));
    }
  };
  const time = (d) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-4">
      <Title
        title="Real-Time Chat"
        sub="Message mentors and students instantly."
        right={
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${online ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
          >
            {online ? "● Live" : "● Reconnecting…"}
          </span>
        }
      />
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex h-[600px]">
        <div
          className={`${to ? "hidden md:block" : "block"} w-full md:w-72 border-r border-slate-200 overflow-y-auto scrollbar`}
        >
          {(people || []).map((p) => (
            <div
              key={p._id}
              onClick={() => setTo(p)}
              className={`flex items-center gap-3 p-3 cursor-pointer border-b border-slate-100 ${to?._id === p._id ? "bg-indigo-50" : "hover:bg-slate-50"}`}
            >
              <Avatar name={p.name} size="w-10 h-10" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {p.name}
                </div>
                <div className="text-[11px] text-slate-500 capitalize truncate">
                  {p.headline || p.role}
                </div>
              </div>
            </div>
          ))}
          {people && !people.length && (
            <Empty>
              No other users yet. Ask others to register, or run <b>npm run seed:demo</b> to add demo users.
            </Empty>
          )}
        </div>
        <div
          className={`${to ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0`}
        >
          {to ? (
            <>
              <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
                <button className="md:hidden" onClick={() => setTo(null)}>
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Avatar name={to.name} size="w-10 h-10" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {to.name}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">
                    {to.role}
                  </div>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 scrollbar">
                {msgs.map((m) =>
                  m.from === to._id ? (
                    <div key={m._id} className="flex items-start space-x-3">
                      <Avatar name={to.name} size="w-8 h-8" />
                      <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 max-w-md">
                        <p className="text-xs text-slate-800 break-words">
                          {m.text}
                        </p>
                        <span className="text-[9px] text-slate-400 mt-1 block">
                          {time(m.createdAt)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={m._id}
                      className="flex items-start space-x-3 justify-end"
                    >
                      <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none max-w-md">
                        <p className="text-xs break-words">{m.text}</p>
                        <span className="text-[9px] text-indigo-200 mt-1 block text-right">
                          {time(m.createdAt)}
                        </span>
                      </div>
                      <Avatar name={user.name} size="w-8 h-8" />
                    </div>
                  ),
                )}
                <div ref={end} />
              </div>
              <form
                onSubmit={send}
                className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2"
              >
                <input
                  className={inp + " !bg-slate-100 !py-2.5"}
                  value={t}
                  onChange={(e) => setT(e.target.value)}
                  placeholder="Type a message…"
                />
                <Btn className="!p-2.5">
                  <Send className="w-4 h-4" />
                </Btn>
              </form>
            </>
          ) : (
            <div className="m-auto text-sm text-slate-400">
              Select someone to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}