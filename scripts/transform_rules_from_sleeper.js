// CommonJS. Run: node scripts/transform_rules_from_sleeper.js
const fs = require("fs");
const path = require("path");

const inPath = path.join("src", "_content", "sleeper_league.json");
const outPath = path.join("src", "_content", "rules.json");

function read(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }

function mapWaiverType(n) { return ({0:"None",1:"Waivers",2:"FAAB"}[n] ?? `code:${n}`); }

function toList(arr){ return Array.isArray(arr) ? arr : []; }

function main() {
  const L = read(inPath);

  const rosterList = toList(L.roster_positions).join(" · ");

  const sections = [
    {
      id: "league",
      title: "League Info",
      items: [
        `Name: ${L.name}`,
        `Season: ${L.season}`,
        `Teams: ${L.settings?.num_teams ?? "N/A"}`,
        `Status: ${L.status}`
      ]
    },
    {
      id: "rosters",
      title: "Rosters & Lineups",
      items: [
        `Positions: ${rosterList}`,
        `Bench slots: ${toList(L.roster_positions).filter(p => p==="BN").length}`,
        `Max substitutions per week: ${L.settings?.max_subs ?? 0}`
      ]
    },
    {
      id: "scoring",
      title: "Scoring Settings",
      items: [
        `Passing: ${L.scoring_settings.pass_td} per pass TD, ${L.scoring_settings.pass_yd} per pass yard, ${L.scoring_settings.pass_int} per INT, +${L.scoring_settings.pass_2pt} for 2PT`,
        `Rushing: ${L.scoring_settings.rush_td} per rush TD, ${L.scoring_settings.rush_yd} per rush yard, +${L.scoring_settings.rush_2pt} for 2PT`,
        `Receiving: ${L.scoring_settings.rec_td} per rec TD, ${L.scoring_settings.rec_yd} per rec yard, PPR = ${L.scoring_settings.rec}`,
        `Turnovers: Fumble lost ${L.scoring_settings.fum_lost}`,
        `Kicking: XP ${L.scoring_settings.xpm}, XP miss ${L.scoring_settings.xpmiss}, ` +
          `FG 0–19:${L.scoring_settings.fgm_0_19}, 20–29:${L.scoring_settings.fgm_20_29}, 30–39:${L.scoring_settings.fgm_30_39}, ` +
          `40–49:${L.scoring_settings.fgm_40_49}, 50–59:${L.scoring_settings.fgm_50_59}, 60+:${L.scoring_settings.fgm_60p}, FG miss ${L.scoring_settings.fgmiss}`,
        `Defense/ST: Sack ${L.scoring_settings.sack}, INT ${L.scoring_settings.int}, FF ${L.scoring_settings.ff}, FR ${L.scoring_settings.fum_rec}, ` +
          `TD ${L.scoring_settings.def_td}, ST/DEF TD ${L.scoring_settings.def_st_td}, Safety ${L.scoring_settings.safe}`,
        `Points allowed: 0=${L.scoring_settings.pts_allow_0}, 1–6=${L.scoring_settings.pts_allow_1_6}, 7–13=${L.scoring_settings.pts_allow_7_13}, ` +
          `14–20=${L.scoring_settings.pts_allow_14_20}, 21–27=${L.scoring_settings.pts_allow_21_27}, 28–34=${L.scoring_settings.pts_allow_28_34}, 35+=${L.scoring_settings.pts_allow_35p}`
      ]
    },
    {
      id: "waivers",
      title: "Waivers & FAAB",
      items: [
        `Type: ${mapWaiverType(L.settings?.waiver_type)}`,
        `Budget: $${L.settings?.waiver_budget ?? 0} (min bid $${L.settings?.waiver_bid_min ?? 0})`,
        `Daily waivers: ${L.settings?.daily_waivers ? "on" : "off"}; processing hour: ${L.settings?.daily_waivers_hour}:00`,
        `Clear time (days): ${L.settings?.waiver_clear_days ?? "N/A"}`
      ]
    },
    {
      id: "trades",
      title: "Trades & Veto",
      items: [
        `Trades allowed: ${L.settings?.disable_trades ? "no" : "yes"}`,
        `Veto votes needed: ${L.settings?.veto_votes_needed}`,
        `Veto vote visibility: ${L.settings?.veto_show_votes ? "shown" : "hidden"}`,
        `Trade review window (days): ${L.settings?.trade_review_days}`,
        `Trade deadline: week ${L.settings?.trade_deadline}`
      ]
    },
    {
      id: "playoffs",
      title: "Playoffs",
      items: [
        `Teams: ${L.settings?.playoff_teams}`,
        `Start week: ${L.settings?.playoff_week_start}`
      ]
    },
    {
      id: "policies",
      title: "Policies & Misc",
      items: [
        `Pick trading: ${L.settings?.pick_trading ? "enabled" : "disabled"}`,
        `Keepers max: ${L.settings?.max_keepers}`,
        `Draft rounds: ${L.settings?.draft_rounds}`
      ]
    }
  ];

  const out = {
    source: "sleeper",
    source_snapshot: new Date().toISOString().slice(0,10),
    season: L.season,
    sections
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`Wrote ${outPath}`);
}

main();
