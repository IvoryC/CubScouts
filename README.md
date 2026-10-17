# Cub Scout pack resources

Planning tools for den leaders and families, published with GitHub Pages.

## What's here

| Path | What it is |
| --- | --- |
| `index.html` | Landing page that links to each resource |
| `adventure-crosswalk/` | Requirement crosswalk for the six required adventures and the bicycling elective, Lion through Arrow of Light, with a two-rank comparison and a copy-chart-as-image button |
| `.nojekyll` | Tells GitHub Pages to serve files as-is |

Each adventure in the crosswalk's dropdown has its own link, for example `adventure-crosswalk/#outdoors`. IDs are the `id` values in `adventure-crosswalk/data/themes.js`: the six required adventures (`bobcat`, `fitness`, `safety`, `family`, `citizenship`, `outdoors`), then the elective themes, then the range and target sports (`archery`, `bbgun`, `slingshot`). The Theme dropdown groups them as Required adventures, Elective themes, and Range and target sports. A second dropdown, Adventure name, lists every adventure by rank (A to Z) and selects the theme it belongs to; it is built automatically from `THEMES`.

## Publish it

1. Push this folder to a new repository (public, if you want anyone to view the site).
2. In the repo, go to **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then pick `main` and `/ (root)`.
4. After a minute or two the site is live at `https://<your-username>.github.io/<repo-name>/`.

## Add a new resource

1. Create a folder, such as `camping-checklist/`, with an `index.html` inside.
2. Add a card for it in the root `index.html` by copying an existing `<li>` block.

## Update crosswalk requirements

The crosswalk is split into `index.html` (markup), `crosswalk.css`, `crosswalk.js` (behavior) and `data/`. Requirement data lives in `adventure-crosswalk/data/themes.js`, one entry per adventure; list the six required adventures first, then elective themes, then range themes (`kind` is `Required`, `Elective`, or `Range`). A rank can have several adventures in one theme (use a list of names, and a third number in a cell to pick which one) or none. To add an adventure, add an entry there and a matching entry in `data/loops.js` (scouting.org page slug and belt-loop image for each rank), then rerun the scraper below. Each row is a skill and the ranks that include it:

```js
['Demonstrate hand signals', { T: ['4', 'note'], W: ['5', ''], B: ['3', ''] }]
```

Rank keys: `L` Lion, `T` Tiger, `W` Wolf, `B` Bear, `We` Webelos, `A` Arrow of Light. Cell colors (every rank, shared, unique) are calculated automatically from how many ranks a row has.

Tapping a number opens the activity tiles for that requirement. Those come from `adventure-crosswalk/activities.js`, which is generated from the scouting.org adventure pages. To refresh it, run `python3 tools/scrape_activities.py` (delete `.cache/` first to refetch pages). Then run `node tools/check-data.js` to confirm every chart number matches a real requirement (add `--gaps` to also list official requirements no row mentions).

The archery, BB gun, and slingshot adventures have no pages on scouting.org (they are earned only at council or district events). Their requirements are hand-condensed in `adventure-crosswalk/data/range-requirements.js` from the lesson-plan PDFs saved in `reference/`, which also holds the 2024 adventure matrix PDF the elective themes follow. It reads the adventure list from the `LOOPS` table in `data/loops.js`.

Requirement wording is condensed from the 2024 Cub Scout program. Check the rank handbooks or scouting.org for the official text.
