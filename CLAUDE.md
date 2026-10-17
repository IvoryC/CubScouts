# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static site of Cub Scout planning tools, published via GitHub Pages from `main` at the repo root (`.nojekyll` makes Pages serve files as-is). There is no build step, package manager, linter, or test suite. To preview, open an `index.html` in a browser or run `python3 -m http.server` from the repo root.

## Structure

- `index.html` — landing page; each resource is an `<li>` card linking to its folder.
- `adventure-crosswalk/` — `index.html` (markup only), `crosswalk.css`, `crosswalk.js` (all behavior), `data/themes.js` (`THEMES`), `data/loops.js` (`LOOPS`), and generated `activities.js`. Scripts load in that order from plain `<script>` tags (no modules, no build). The only external dependency is html2canvas 1.4.1 from cdnjs, used by the copy-chart-as-image button.

New resources go in their own folder with an `index.html`, plus a card copied from an existing `<li>` in the root `index.html`.

## Adventure crosswalk

- All requirement data lives in the `THEMES` array in `data/themes.js`; array order is dropdown order (six required adventures first in scouting.org's order, then elective themes in the order of `reference/2024_New_Cub_Scout_Required_and_Elective_Adventures.pdf`, then the `Range` themes). A rank may have no adventure, or several: `adv[rank]` is then a list of names, `LOOPS[id][rank]` a list of `[slug, image]` pairs, and a cell's optional third element is the index of its adventure. Each row is `[skill, { rankKey: [requirementNumber, note], ... }]`.
- Rank keys: `L` Lion, `T` Tiger, `W` Wolf, `B` Bear, `We` Webelos, `A` Arrow of Light.
- Cell colors (every rank / shared / unique) are computed from how many ranks a row includes, so don't hand-set them.
- Themes are chosen from a custom listbox dropdown (`wireListbox`, `buildThemePicker`, `syncPicker` in `crosswalk.js`; required entries get the pale-gold `--req-bg`). A second dropdown, "Adventure name" (`buildAdvPicker`), lists adventures by rank and just sets the theme; `advSel` keeps its name showing until a theme is picked directly and routed by URL hash (the theme `id`); `route()` handles this. A new theme needs a `THEMES` entry and a `LOOPS` entry with the same id.
- Rendering is in `render()`, the two-rank comparison in `compare()`.
- `LOOPS` (`data/loops.js`) maps each theme and rank to its scouting.org adventure slug and belt-loop image; it drives the header images and the cell and header links.
- Tapping a number cell opens a detail panel (`openDetail`; a cell opens one rank's section, a row name opens one per rank that has the row) built from `activities.js` (`ACTIVITIES`, keyed by adventure slug then requirement number). Don't edit that file by hand: regenerate it with `python3 tools/scrape_activities.py` (stdlib only; caches pages in git-ignored `.cache/`). scouting.org returns 403 to requests without browser-like headers; the script sends them.
- Range themes (`kind:'Range'`) set `link` (a lesson-plan PDF), `note` (shown above the chart) and `noActs`; their requirement text is in `data/range-requirements.js`, merged into `ACTIVITIES` at load, since scouting.org has no pages for them.
- Run `node tools/check-data.js` after any data change; it fails on chart numbers that don't match a real requirement.
- Cell numbers must match the official requirement numbers on scouting.org, since they select the activities. `reqNums()` expands `'1, 3'` and `'3–5'`.
- Requirement wording is condensed from the 2024 Cub Scout program; don't present it as official text.
