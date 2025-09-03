// Exposes: site.meta, site.branding, site.contact, site.nav, site.footer
const fs = require("fs");
const path = require("path");

module.exports = () => {
  const p = path.join(process.cwd(), "src", "_content", "site.json");
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  // expand footer smallprint placeholder
  const season = data?.meta?.season ?? "";
  const footer = data.footer || {};
  if (typeof footer.smallprint === "string") {
    footer.smallprint = footer.smallprint.replace("{season}", season);
  }
  return { ...data, footer };
};
