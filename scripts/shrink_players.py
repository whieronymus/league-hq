#!/usr/bin/env python3
"""
shrink_players.py
Filter a large Sleeper players.json down to only:
- The player IDs actually present in your league's rosters JSON
- A concise subset of useful fields

Outputs: reduced_players.json

Usage:
  python shrink_players.py --players /path/to/players.json --rosters /path/to/rosters.json --out /path/to/reduced_players.json

Notes:
- The rosters file should be a JSON array like the example the user shared
  (one object per team with "players" and "starters" arrays).
- The players file should be the big Sleeper players.json { "<id>": { ... }, ... }.
"""

import argparse
import json
from pathlib import Path
from typing import Dict, Any, Iterable, Set

KEEP_FIELDS = [
    "player_id",
    "first_name",
    "last_name",
    "position",
    "fantasy_positions",
    "team",
    "status",
    "injury_status",
    "depth_chart_position",
    "depth_chart_order",
    "age",
    "years_exp",
]

def load_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

def collect_needed_ids(rosters: Iterable[Dict[str, Any]]) -> Set[str]:
    needed: Set[str] = set()
    for entry in rosters:
        for key in ("players", "starters", "reserve", "taxi"):
            vals = entry.get(key)
            if not vals:
                continue
            for pid in vals:
                # Sleeper IDs are strings. Ensure type consistency.
                if pid is None:
                    continue
                needed.add(str(pid))
    return needed

def minimize_player(player: Dict[str, Any]) -> Dict[str, Any]:
    out = {}
    for k in KEEP_FIELDS:
        if k == "player_id":
            # ensure we have a stable id even if missing in source record
            out[k] = str(player.get("player_id") or player.get("playerId") or "")
        else:
            out[k] = player.get(k, None)

    # Fallbacks for missing names
    if not out.get("first_name") and not out.get("last_name"):
        hashtag = player.get("hashtag") or ""
        # Example: "#TomBrady-NFL-NE-12" -> "Tom", "Brady"
        if hashtag.startswith("#"):
            core = hashtag[1:].split("-")[0]
            # naive split between first and last name
            if core:
                # try camel case split
                import re
                parts = re.findall(r"[A-Z][a-z]*", core) or [core]
                if len(parts) >= 2:
                    out["first_name"], out["last_name"] = parts[0], " ".join(parts[1:])
                else:
                    out["first_name"] = core

    # Normalize types
    if out.get("fantasy_positions") is None and player.get("position"):
        out["fantasy_positions"] = [player["position"]]

    if not out.get("player_id"):
        # As a last resort, use key-like fields
        for k in ("id", "gsis_id", "sportradar_id", "yahoo_id"):
            if player.get(k):
                out["player_id"] = str(player[k])
                break

    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--players", type=Path, required=True, help="Path to big players.json")
    ap.add_argument("--rosters", type=Path, required=True, help="Path to rosters.json")
    ap.add_argument("--out", type=Path, default=Path("reduced_players.json"), help="Output path")
    args = ap.parse_args()

    players = load_json(args.players)
    rosters = load_json(args.rosters)

    needed_ids = collect_needed_ids(rosters)
    # Keep only records that exist in players.json
    found = {pid for pid in needed_ids if pid in players}
    missing = needed_ids - found

    reduced: Dict[str, Any] = {}
    for pid in sorted(found):
        reduced[pid] = minimize_player(players[pid])

    # Optionally report missing ids for transparency
    meta = {
        "_counts": {
            "needed_ids": len(needed_ids),
            "found": len(found),
            "missing": len(missing),
        },
        "_missing_ids": sorted(missing),
        "_kept_fields": KEEP_FIELDS,
    }
    # Attach meta block under special key
    reduced_meta_key = "_meta"
    reduced[reduced_meta_key] = meta

    # Pretty print with deterministic key order
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8") as f:
        json.dump(reduced, f, ensure_ascii=False, indent=2, sort_keys=True)

    print(f"Wrote {len(found)} players → {args.out}")
    if missing:
        print(f"Warning: {len(missing)} IDs from rosters not present in players.json.")
        print("Missing example(s):", list(sorted(missing))[:10])

if __name__ == "__main__":
    main()
