import { useState, useContext } from "react";
import { Star, Search, AlertCircle } from "lucide-react";
import api from "../services/api";
import { Ctx } from "../context/AuthContext";
import useLoad from "../hooks/useLoad";
import useDebounce from "../hooks/useDebounce";
import Avatar from "../components/Avatar";
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
import { fmt, fail } from "../utils/helpers";

const tone = {
  pending: "amber",
  accepted: "indigo",
  completed: "emerald",
  rejected: "rose",
  cancelled: "slate",
};

export default function Mentors() {
  const { user } = useContext(Ctx),
    toast = useToast(),
    mentor = user.role === "mentor",
    student = user.role === "student",
    admin = user.role === "admin",
    browse = student || admin; // students book, admin can only look
  const [q, setQ] = useState(""),
    dq = useDebounce(q),
    [list] = useLoad("/mentors?q=" + encodeURIComponent(dq), [dq]),
    [sess, loadS] = useLoad("/sessions");
  const [bk, setBk] = useState(null),
    [f, setF] = useState({ date: "", topic: "" }),
    [revs, setRevs] = useState(null),
    [rate, setRate] = useState(null),
    [rv, setRv] = useState({ rating: 5, comment: "" });

  const book = async (e) => {
    e.preventDefault();
    try {
      await api.post("/sessions", { mentor: bk._id, ...f });
      toast(`Session requested with ${bk.name}!`);
      setBk(null);
      setF({ date: "", topic: "" });
      loadS();
    } catch (x) {
      toast(fail(x));
    }
  };
  const setStatus = async (id, status) => {
    try {
      await api.put("/sessions/" + id, { status });
      loadS();
      toast(`Session ${status}`);
    } catch (x) {
      toast(fail(x));
    }
  };
  const review = async (e) => {
    e.preventDefault();
    try {
      await api.post("/reviews", { mentor: rate.mentor._id, ...rv });
      setRate(null);
      toast("Thanks for your review!");
    } catch (x) {
      toast(fail(x));
    }
  };

  return (
    <div className="space-y-6">
      <Title
        title="Mentor Discovery & Booking"
        sub="Book 1-on-1 mentorship sessions with industry professionals."
        right={
          browse && (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                className={inp + " !pl-9 !w-56"}
                placeholder="Search name or skill…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          )
        }
      />

      {mentor && user.mentorStatus !== "approved" && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {user.mentorStatus === "rejected"
            ? "Your mentor application was not approved by the admin."
            : "Your mentor profile is waiting for admin approval. Students can book you after it is approved."}
        </div>
      )}

      {browse && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(list || []).map((m) => (
            <div
              key={m._id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center"
            >
              <Avatar
                name={m.name}
                size="w-20 h-20"
                text="text-xl"
                className="mb-3 shadow-md"
              />
              <h4 className="font-bold text-slate-900 text-sm">{m.name}</h4>
              <p className="text-xs text-indigo-600 font-semibold">
                {m.headline || "Mentor"}
              </p>
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {m.expertise?.map((x) => (
                  <span
                    key={x}
                    className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                  >
                    {x}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2 mb-3">{m.bio}</p>
              <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold mb-4">
                <Star className="w-4 h-4 fill-current" />
                <span>
                  {m.rating || "–"} ({m.ratingCount} reviews)
                </span>
              </div>
              <div className="flex gap-2 w-full">
                {student ? (
                  <Btn className="flex-1" onClick={() => setBk(m)}>
                    Book Session (₹{m.rate || 0})
                  </Btn>
                ) : (
                  <span className="flex-1 text-xs text-slate-500 self-center">
                    ₹{m.rate || 0} / session
                  </span>
                )}
                <Btn
                  v="ghost"
                  onClick={async () =>
                    setRevs({
                      m,
                      list: (await api.get("/reviews/" + m._id)).data,
                    })
                  }
                >
                  Reviews
                </Btn>
              </div>
            </div>
          ))}
          {list && !list.length && (
            <Empty>
              {dq
                ? "No mentor matches your search."
                : admin
                  ? "No mentors yet. Run `npm run seed:demo` in the project folder to add demo mentors, or approve mentors from the Admin Control Panel."
                  : "No mentors are available yet. Mentors appear here as soon as they register and are approved."}
            </Empty>
          )}
        </div>
      )}

      {!admin && (
      <Card>
        <CardTitle>{mentor ? "Session Requests" : "My Sessions"}</CardTitle>
        {sess?.length ? (
          sess.map((s) => (
            <div
              key={s._id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Avatar name={(mentor ? s.student : s.mentor)?.name || "?"} />
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {s.topic}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {(mentor ? s.student : s.mentor)?.name} · {fmt(s.date)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Pill tone={tone[s.status]}>{s.status}</Pill>
                {mentor && s.status === "pending" && (
                  <>
                    <Btn
                      v="success"
                      className="!py-1.5"
                      onClick={() => setStatus(s._id, "accepted")}
                    >
                      Accept
                    </Btn>
                    <Btn
                      v="soft"
                      className="!py-1.5"
                      onClick={() => setStatus(s._id, "rejected")}
                    >
                      Reject
                    </Btn>
                  </>
                )}
                {mentor && s.status === "accepted" && (
                  <Btn
                    className="!py-1.5"
                    onClick={() => setStatus(s._id, "completed")}
                  >
                    Mark completed
                  </Btn>
                )}
                {!mentor && s.status === "completed" && (
                  <Btn v="ghost" className="!py-1.5" onClick={() => setRate(s)}>
                    ⭐ Review
                  </Btn>
                )}
              </div>
            </div>
          ))
        ) : (
          <Empty>No sessions yet.</Empty>
        )}
      </Card>
      )}
      {admin && (
        <p className="text-xs text-slate-500">
          You are viewing mentors as admin. Manage sessions from Admin Control Panel → Sessions.
        </p>
      )}

      {bk && (
        <Modal title={`Book ${bk.name}`} onClose={() => setBk(null)}>
          <form onSubmit={book} className="space-y-3">
            <input
              type="datetime-local"
              className={inp}
              value={f.date}
              onChange={(e) => setF({ ...f, date: e.target.value })}
              required
            />
            <input
              className={inp}
              placeholder="Topic (e.g. System design basics)"
              value={f.topic}
              onChange={(e) => setF({ ...f, topic: e.target.value })}
              required
            />
            <Btn className="w-full">Send request</Btn>
          </form>
        </Modal>
      )}
      {revs && (
        <Modal title={`Reviews · ${revs.m.name}`} onClose={() => setRevs(null)}>
          {revs.list.length ? (
            revs.list.map((r) => (
              <div
                key={r._id}
                className="text-xs border-b border-slate-100 pb-2"
              >
                <b className="text-amber-500">{"★".repeat(r.rating)}</b>{" "}
                {r.comment}{" "}
                <span className="text-slate-400">— {r.student?.name}</span>
              </div>
            ))
          ) : (
            <Empty>No reviews yet.</Empty>
          )}
        </Modal>
      )}
      {rate && (
        <Modal
          title={`Rate ${rate.mentor?.name}`}
          onClose={() => setRate(null)}
        >
          <form onSubmit={review} className="space-y-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRv({ ...rv, rating: n })}
                >
                  <Star
                    className={`w-7 h-7 ${n <= rv.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                  />
                </button>
              ))}
            </div>
            <textarea
              className={inp}
              rows="3"
              placeholder="Share your experience…"
              value={rv.comment}
              onChange={(e) => setRv({ ...rv, comment: e.target.value })}
            />
            <Btn className="w-full">Submit review</Btn>
          </form>
        </Modal>
      )}
    </div>
  );
}