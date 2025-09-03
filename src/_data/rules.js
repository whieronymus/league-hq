// Eleventy data loader
// Exposes: { all, toc }
const fs = require("fs");
const path = require("path");

function readJSON(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }

module.exports = () => {
  const p = path.join(process.cwd(), "src", "_content", "rules.json");
  const data = readJSON(p);
  const sections = Array.isArray(data.sections) ? data.sections : [];
  return {
      all: data,
      toc: sections.map(s => ({ id: s.id, title: s.title }))
    };
};