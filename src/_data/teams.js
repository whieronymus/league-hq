const fs = require("node:fs");
const path = require("node:path");

function loadJSON(relPath) {
  const file = path.join(__dirname, relPath);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const teams = loadJSON("../_content/teams.json");
const byId = Object.fromEntries(teams.map(t => [t.team_id, t]));
const byCurrentSlug = Object.fromEntries(teams.map(t => [t.current_slug, t]));
const slugToId = Object.fromEntries(
  teams.flatMap(t => (t.slug_history || []).map(s => [s, t.team_id]))
);

module.exports = {
  all: teams,
  byId,
  byCurrentSlug,
  slugToId
};
