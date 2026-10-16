# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static site of Cub Scout planning tools, published via GitHub Pages from `main` at the repo root (`.nojekyll` makes Pages serve files as-is). There is no build step, package manager, linter, or test suite. To preview, open an `index.html` in a browser or run `python3 -m http.server` from the repo root.

## Structure

- `index.html` — landing page; each resource is an `<li>` card linking to its folder.
- `adventure-crosswalk/index.html` — single self-contained file (inline CSS and JS, only external dependency is html2canvas 1.4.1 from cdnjs, used by the copy-chart-as-image button).

New resources go in their own folder with an `index.html`, plus a card copied from an existing `<li>` in the root `index.html`.

## Adventure crosswalk

- All requirement data lives in the `THEMES` array near the bottom of the script. Each row is `[skill, { rankKey: [requirementNumber, note], ... }]`.
- Rank keys: `L` Lion, `T` Tiger, `W` Wolf, `B` Bear, `We` Webelos, `A` Arrow of Light.
- Cell colors (every rank / shared / unique) are computed from how many ranks a row includes, so don't hand-set them.
- Tabs are routed by URL hash (`#bicycling`, `#bobcat`, `#citizenship`, `#family`, `#outdoors`, `#fitness`, `#safety`); `route()` handles this. A new theme needs a matching tab ID.
- Rendering is in `render()`, the two-rank comparison in `compare()`.
- Requirement wording is condensed from the 2024 Cub Scout program; don't present it as official text.
