#!/usr/bin/env python3
"""Turn bare ID citations in Slite notes into links.

INV-P9 -> 01 Product Invariants. SET-D6 -> the settlement BRD. ADR-014 -> 04
Decision Records. PRO-982 -> the Linear issue. And so on.

Two deliberate limits:
  - Slite has no per-row anchors, so an ID links to the note that owns it,
    not to the exact row.
  - An ID is never linked inside the note that defines it. Every row in 01
    linking to 01 is noise.

Usage:
    python3 slite_link_ids.py            # dry run, prints counts, writes nothing
    python3 slite_link_ids.py --apply    # backs up, then writes
"""

import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request

API = "https://api.slite.com/v1/notes"
BACKUP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "slite_backups")


def api_key():
    key = os.environ.get("SLITE_API_KEY")
    if key:
        return key
    # Hooks and scripts run under bash, which never reads ~/.zshrc. Read the
    # export line directly rather than sourcing the file.
    zshrc = os.path.expanduser("~/.zshrc")
    if os.path.exists(zshrc):
        with open(zshrc) as fh:
            for line in fh:
                m = re.match(r'\s*export\s+SLITE_API_KEY=(.+)', line)
                if m:
                    return m.group(1).strip().strip('"').strip("'")
    sys.exit("SLITE_API_KEY not found")


def slite_url(note_id):
    return f"https://getcami.slite.com/app/docs/{note_id}"


# Notes that own each ID family, and therefore never link it to themselves.
NOTES = {
    "01": "OIHVxNDanQi9_9",
    "02": "LPrFmzybLzuylD",
    "03": "LxDHv2n9J5QWgJ",
    "04": "QqvUwQfP4Wc8IY",
    "05": "4ksIWfUxP-S-YK",
    "06": "uT_0EQB3wfO3g8",
    "brd": "JwmmLS2yWTv3s9",
    "prd": "ESjLsKwtgdyvro",
    "pack": "bCxbyMX5N87L-y",
    "hub": "JRsOIram0TZPlV",
}

# Each rule: regex, the note that owns it, and the URL to point at.
RULES = [
    # INV-M first: it is a prefix collision with INV- generally.
    (r"INV-M\d{1,2}", "01", slite_url(NOTES["01"])),
    (r"INV-[PCBAX]\d{1,2}", "01", slite_url(NOTES["01"])),
    (r"INV-\d{2}", "01", slite_url(NOTES["01"])),
    (r"(?:ADR|PDR)-\d{3}", "04", slite_url(NOTES["04"])),
    (r"EC-[A-Z]{2,4}-E\d{1,2}", "05", slite_url(NOTES["05"])),
    (r"EC-\d{1,2}", "05", slite_url(NOTES["05"])),
    (r"SET-[A-EX]\d{1,2}", "brd", slite_url(NOTES["brd"])),
    # Section references into the money contract, e.g. "06 §4" or "06 §9.6".
    (r"06 §\d(?:\.\d)?", "06", slite_url(NOTES["06"])),
    # Linear issues are a deterministic URL pattern. Inner groups must be
    # non-capturing, the wrapper below addresses its own groups by name.
    (r"\b(?:PRO|DSG|PRD)-\d{1,4}\b", None, "linear"),
]

TARGETS = list(NOTES.items())


def link_ids(md, owner_key):
    """Return (new_md, {id_family: count}). Never touches fenced code blocks."""
    counts = {}
    # Split on fenced blocks so code samples are left alone. Odd indices are code.
    parts = re.split(r"(```.*?```)", md, flags=re.S)

    for i, part in enumerate(parts):
        if i % 2 == 1:
            continue
        for pattern, owner, target in RULES:
            if owner is not None and owner == owner_key:
                continue

            def repl(m):
                tick_open = m.group("o")
                token = m.group("id")
                tick_close = m.group("c")
                whole = m.group(0)
                start, end = m.start(), m.end()

                # Already inside a markdown link, as link text or as the href.
                before = part[max(0, start - 2):start]
                after = part[end:end + 2]
                if before.endswith("[") or after.startswith("]") or after.startswith("]("):
                    return whole

                url = target
                if target == "linear":
                    url = f"https://linear.app/getcami/issue/{token}"

                # Keep inline-code styling inside the link: [`SET-D6`](url).
                label = f"`{token}`" if (tick_open and tick_close) else token
                # A lone backtick on one side is someone else's code span. Leave it.
                if bool(tick_open) != bool(tick_close):
                    return whole

                counts[token.split("-")[0]] = counts.get(token.split("-")[0], 0) + 1
                return f"[{label}]({url})"

            part = re.sub(
                r"(?P<o>`?)(?P<id>" + pattern + r")(?P<c>`?)", repl, part
            )
        parts[i] = part

    return "".join(parts), counts


def fetch(note_id, key):
    req = urllib.request.Request(
        f"{API}/{note_id}?format=md", headers={"x-slite-api-key": key}
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.load(resp)


def push(note_id, md, key):
    body = json.dumps({"markdown": md}).encode()
    req = urllib.request.Request(
        f"{API}/{note_id}",
        data=body,
        method="PUT",
        headers={"x-slite-api-key": key, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.status


def main():
    apply = "--apply" in sys.argv
    key = api_key()
    if apply:
        os.makedirs(BACKUP_DIR, exist_ok=True)

    total = 0
    for owner_key, note_id in TARGETS:
        try:
            note = fetch(note_id, key)
        except urllib.error.HTTPError as e:
            print(f"{owner_key:5} FETCH FAILED http={e.code}")
            continue

        md = note.get("content") or ""
        title = note.get("title", "?")
        new_md, counts = link_ids(md, owner_key)
        n = sum(counts.values())
        total += n

        summary = ", ".join(f"{k}×{v}" for k, v in sorted(counts.items())) or "nothing to link"
        print(f"{owner_key:5} {n:4} links  {title}  ({summary})")

        if apply and n:
            with open(os.path.join(BACKUP_DIR, f"{owner_key}-{note_id}.md"), "w") as fh:
                fh.write(md)
            try:
                push(note_id, new_md, key)
            except urllib.error.HTTPError as e:
                print(f"      PUSH FAILED http={e.code}")

    print(f"\n{'APPLIED' if apply else 'DRY RUN'}: {total} links across {len(TARGETS)} notes")
    if not apply:
        print("Re-run with --apply to write. Originals are backed up first.")


if __name__ == "__main__":
    main()
