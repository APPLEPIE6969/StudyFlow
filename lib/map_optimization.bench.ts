const SUBJECTS = [
  { id: "general", name: "General Tutor", icon: "school", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "math", name: "Mathematics", icon: "calculate", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "science", name: "Science", icon: "science", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { id: "coding", name: "Coding", icon: "code", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { id: "history", name: "History", icon: "history_edu", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
];

const SUBJECT_OPTIONS = SUBJECTS.map(s => ({ value: s.id, label: s.name }));

const ITERATIONS = 10_000_000;

function benchmarkInline() {
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    const options = SUBJECTS.map(s => ({ value: s.id, label: s.name }));
    // Prevent optimization
    if (options.length === 0) console.log(options);
  }
  return performance.now() - start;
}

function benchmarkConstant() {
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    const options = SUBJECT_OPTIONS;
    // Prevent optimization
    if (options.length === 0) console.log(options);
  }
  return performance.now() - start;
}

console.log("Starting benchmark...");
const inlineTime = benchmarkInline();
console.log(`Inline map: ${inlineTime.toFixed(2)}ms`);

const constantTime = benchmarkConstant();
console.log(`Constant: ${constantTime.toFixed(2)}ms`);

if (inlineTime > 0) {
    console.log(`Improvement: ${((inlineTime - constantTime) / inlineTime * 100).toFixed(2)}%`);
}
