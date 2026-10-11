import { Bell, CheckCheck } from "lucide-react";
import api from "../services/api";
import useLoad from "../hooks/useLoad";
import { Card, Title, Btn, Empty, Loading } from "../components/ui";
import { fmt } from "../utils/helpers";

export default function Notifications() {
  const [ns, load] = useLoad("/notifications");
  const markAll = async () => {
    await api.put("/notifications/read");
    load();
    window.dispatchEvent(new Event("notif-read"));
  };
  if (!ns) return <Loading />;
  return (
    <div className="space-y-6">
      <Title
        title="Notifications"
        sub="Session updates, application status, badges and more."
        right={
          <Btn v="ghost" onClick={markAll}>
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Btn>
        }
      />
      <Card>
        {ns.map((n) => (
          <div
            key={n._id}
            className={`flex items-start gap-3 py-3 border-b border-slate-100 last:border-0 ${n.read ? "" : "bg-indigo-50/40 -mx-3 px-3 rounded-lg"}`}
          >
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p
                className={`text-sm ${n.read ? "text-slate-600" : "font-semibold text-slate-900"}`}
              >
                {n.text}
              </p>
              <p className="text-[11px] text-slate-400">{fmt(n.createdAt)}</p>
            </div>
          </div>
        ))}
        {!ns.length && <Empty>No notifications yet.</Empty>}
      </Card>
    </div>
  );
}
