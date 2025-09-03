// CommonJS data loader for power rankings (uses stable team_id)
module.exports = () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const file = path.resolve(process.cwd(), "src/_content/power_rankings.json");
  const weeks = JSON.parse(fs.readFileSync(file, "utf8"));
  const key = w => `${w.season}-w${w.week}`;
  const byWeek = Object.fromEntries(weeks.map(w => [key(w), w]));
  const latest = weeks.at(-1) || null;
  return { weeks, byWeek, latest };
};
