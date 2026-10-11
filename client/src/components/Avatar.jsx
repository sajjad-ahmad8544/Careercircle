const C = [
  "from-indigo-600 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
];
export default function Avatar({
  name = "?",
  size = "w-9 h-9",
  text = "text-xs",
  className = "",
}) {
  const ini = name
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const c = C[[...name].reduce((a, x) => a + x.charCodeAt(0), 0) % C.length];
  return (
    <div
      className={`${size} ${text} rounded-full bg-gradient-to-tr ${c} text-white font-bold flex items-center justify-center shrink-0 ${className}`}
    >
      {ini}
    </div>
  );
}
