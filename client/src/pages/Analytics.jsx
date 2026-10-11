import { useContext } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
} from "chart.js";
import { Doughnut, Line, Bar as BarChart } from "react-chartjs-2";
import { Ctx } from "../context/AuthContext";
import useLoad from "../hooks/useLoad";
import { Card, Title, Loading, Empty } from "../components/ui";
import { atsGroup } from "../utils/helpers";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
);
const opt = { responsive: true, maintainAspectRatio: false };

export default function Analytics() {
  const { user } = useContext(Ctx),
    [apps] = useLoad("/applications?mine=1"),
    [a] = useLoad("/analytics");
  if (!apps || !a) return <Loading />;
  const groups = ["Applied", "Interviewing", "Offered", "Archived"],
    counts = groups.map(
      (g) => apps.filter((x) => atsGroup(x.status) === g).length,
    );
  return (
    <div className="space-y-6">
      <Title
        title="Career Progress & Analytics"
        sub="Track your application success, skill growth and interview performance."
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Points", a.points],
          ["Avg skill", a.skills + "%"],
          ["Mock average", a.mock + "/10"],
          ["Roadmap", a.roadmap + "%"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="text-2xl font-bold text-slate-900">{v}</div>
            <div className="text-xs text-slate-500 font-medium">{k}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-slate-900 text-sm mb-4">
            Applications Status Breakdown
          </h3>
          <div className="h-64 flex items-center justify-center">
            {apps.length ? (
              <Doughnut
                options={opt}
                data={{
                  labels: groups,
                  datasets: [
                    {
                      data: counts,
                      backgroundColor: [
                        "#6366f1",
                        "#8b5cf6",
                        "#10b981",
                        "#cbd5e1",
                      ],
                    },
                  ],
                }}
              />
            ) : (
              <Empty>Apply to jobs to see this chart.</Empty>
            )}
          </div>
        </Card>
        <Card>
          <h3 className="font-bold text-slate-900 text-sm mb-4">
            Mock Interview Score Trend
          </h3>
          <div className="h-64 flex items-center justify-center">
            {user.mockScores.length ? (
              <Line
                options={{ ...opt, scales: { y: { min: 0, max: 10 } } }}
                data={{
                  labels: user.mockScores.map((_, i) => "Answer " + (i + 1)),
                  datasets: [
                    {
                      label: "Score /10",
                      data: user.mockScores,
                      borderColor: "#6366f1",
                      backgroundColor: "rgba(99,102,241,0.1)",
                      fill: true,
                      tension: 0.3,
                    },
                  ],
                }}
              />
            ) : (
              <Empty>Take a mock interview to see your trend.</Empty>
            )}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="font-bold text-slate-900 text-sm mb-4">
            Skill Levels
          </h3>
          <div className="h-64 flex items-center justify-center">
            {user.skills.length ? (
              <BarChart
                options={{ ...opt, scales: { y: { min: 0, max: 100 } } }}
                data={{
                  labels: user.skills.map((s) => s.name),
                  datasets: [
                    {
                      label: "Level %",
                      data: user.skills.map((s) => s.level),
                      backgroundColor: "#6366f1",
                      borderRadius: 8,
                    },
                  ],
                }}
              />
            ) : (
              <Empty>Take a skill assessment to see your levels.</Empty>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}