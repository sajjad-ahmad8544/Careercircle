export const fail = (e) => e.response?.data?.error || "Something went wrong";
export const fmt = (d) =>
  new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
export const userLevel = (p) => Math.floor((p || 0) / 50) + 1;
export const levelLabel = (l) =>
  l >= 80
    ? "Expert"
    : l >= 60
      ? "Advanced"
      : l >= 30
        ? "Intermediate"
        : "Beginner";
export const atsGroup = (s) =>
  ({
    applied: "Applied",
    reviewing: "Applied",
    interview: "Interviewing",
    offered: "Offered",
    rejected: "Archived",
  })[s] || "Applied";
export const STATUSES = [
  ["applied", "Applied"],
  ["reviewing", "Reviewing"],
  ["interview", "Interviewing"],
  ["offered", "Offered"],
  ["rejected", "Archived"],
];
// profile completeness (used in sidebar + dashboard)
export const strength = (u) => {
  const mentor = u.role === "mentor";
  const c = [
    [u.headline, "Add a headline"],
    [u.bio, "Write your bio"],
    [u.resume?.summary, "Add a resume summary"],
    [
      mentor ? u.expertise?.length : u.targetRole,
      mentor ? "Add your expertise" : "Choose a target role",
    ],
    [(u.skills?.length || 0) >= 3, "Add 3 skills via assessments"],
  ];
  return {
    pct: Math.round((c.filter((x) => x[0]).length / c.length) * 100),
    tip: (c.find((x) => !x[0]) || [])[1],
  };
};
