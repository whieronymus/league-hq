const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "_content", "matchups.json");
const weeksRaw = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : [];

const weeks = weeksRaw
  .slice()
  .sort((a, b) => (a.season - b.season) || (a.week - b.week));

const key = (s, w) => `${s}-${w}`;
const index = new Map(weeks.map(w => [key(w.season, w.week), w]));

function byWeek(season, week) {
  return index.get(key(season, week));
}

const latest = weeks[weeks.length - 1] || null;

module.exports = { weeks, byWeek, latest };
