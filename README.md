# Cub Scout pack resources

Planning tools for den leaders and families, published with GitHub Pages.

## What's here

| Path | What it is |
| --- | --- |
| `index.html` | Landing page that links to each resource |
| `adventure-crosswalk/` | Requirement crosswalk for the six required adventures and the bicycling elective, Lion through Arrow of Light, with a two-rank comparison and a copy-chart-as-image button |
| `.nojekyll` | Tells GitHub Pages to serve files as-is |

Each crosswalk tab has its own link, for example `adventure-crosswalk/#outdoors`. Tab IDs: `bicycling`, `bobcat`, `citizenship`, `family`, `outdoors`, `fitness`, `safety`.

## Publish it

1. Push this folder to a new repository (public, if you want anyone to view the site).
2. In the repo, go to **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then pick `main` and `/ (root)`.
4. After a minute or two the site is live at `https://<your-username>.github.io/<repo-name>/`.

## Add a new resource

1. Create a folder, such as `camping-checklist/`, with an `index.html` inside.
2. Add a card for it in the root `index.html` by copying an existing `<li>` block.

## Update crosswalk requirements

All requirement data lives in the `THEMES` array near the bottom of `adventure-crosswalk/index.html`. Each row is a skill and the ranks that include it:

```js
['Demonstrate hand signals', { T: ['4', 'note'], W: ['5', ''], B: ['3', ''] }]
```

Rank keys: `L` Lion, `T` Tiger, `W` Wolf, `B` Bear, `We` Webelos, `A` Arrow of Light. Cell colors (every rank, shared, unique) are calculated automatically from how many ranks a row has.

Tapping a number opens the activity tiles for that requirement. Those come from `adventure-crosswalk/activities.js`, which is generated from the scouting.org adventure pages. To refresh it, run `python3 tools/scrape_activities.py` (delete `.cache/` first to refetch pages). It reads the adventure list from the `LOOPS` table in the crosswalk page.

Requirement wording is condensed from the 2024 Cub Scout program. Check the rank handbooks or scouting.org for the official text.
