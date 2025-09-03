#!/usr/bin/env python3
"""
Move team image folders from slug-based to team_id-based paths.

Default dry-run. Use --apply to perform moves.
Run from repo root.

Example:
  python scripts/migrate_team_images.py           # dry run
  python scripts/migrate_team_images.py --apply   # execute
"""

import argparse, json, os, shutil
from pathlib import Path

def unique_dest(dest: Path) -> Path:
    """Avoid overwrite by appending an incrementing suffix before extension."""
    if not dest.exists():
        return dest
    stem, suffix = dest.stem, dest.suffix
    parent = dest.parent
    i = 1
    while True:
        candidate = parent / f"{stem}-{i}{suffix}"
        if not candidate.exists():
            return candidate
        i += 1

def remove_empty_dirs(root: Path):
    # Remove empty directories bottom-up
    for dirpath, dirnames, filenames in os.walk(root, topdown=False):
        p = Path(dirpath)
        try:
            if not any(p.iterdir()):
                p.rmdir()
        except Exception:
            pass

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="Perform moves (default is dry-run)")
    ap.add_argument("--teams-json", default="src/_content/teams.json")
    ap.add_argument("--img-root", default="src/assets/img/teams")
    args = ap.parse_args()

    teams_path = Path(args.teams_json).resolve()
    img_root = Path(args.img_root).resolve()

    if not teams_path.exists():
        raise SystemExit(f"Missing {teams_path}")
    if not img_root.exists():
        raise SystemExit(f"Missing {img_root}")

    teams = json.loads(teams_path.read_text(encoding="utf-8"))

    moves_planned = 0
    for t in teams:
        current_slug = t.get("current_slug")
        team_id = t.get("team_id")
        if not current_slug or not team_id:
            print(f"Skipping record missing current_slug/team_id: {t.get('name','<unknown>')}")
            continue

        src_dir = img_root / current_slug
        dst_dir = img_root / team_id

        if not src_dir.exists():
            # nothing to migrate for this team
            continue

        print(f"{'Moving' if args.apply else 'Plan'}: {current_slug} -> {team_id}")

        # Ensure destination dir
        if args.apply:
            dst_dir.mkdir(parents=True, exist_ok=True)

        # Walk all files under the slug directory
        for root, _, files in os.walk(src_dir):
            root_path = Path(root)
            rel_root = root_path.relative_to(src_dir)
            target_root = dst_dir / rel_root

            for fname in files:
                src_file = root_path / fname
                dest_file = target_root / fname

                if args.apply:
                    target_root.mkdir(parents=True, exist_ok=True)
                    final_dest = dest_file if not dest_file.exists() else unique_dest(
                        target_root / f"{dest_file.stem}-from-{current_slug}{dest_file.suffix}"
                    )
                    shutil.move(str(src_file), str(final_dest))
                    print(f"  moved: {src_file.relative_to(Path.cwd())} -> {final_dest.relative_to(Path.cwd())}")
                else:
                    print(f"  would move: {src_file.relative_to(Path.cwd())} -> {dest_file.relative_to(Path.cwd())}")
                moves_planned += 1

        # Clean up empty source directories after move
        if args.apply:
            remove_empty_dirs(src_dir)
            if src_dir.exists():
                try:
                    src_dir.rmdir()
                except OSError:
                    # Not empty; leave as-is
                    pass

    if moves_planned == 0:
        print("No slug folders found to migrate.")
    else:
        print("Done." if args.apply else "Dry run complete. Re-run with --apply to execute.")

if __name__ == "__main__":
    main()
