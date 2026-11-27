# AGENTS.md

Notes for coding agents working on this repo. The README describes the app for users.

## Files

- `app.html`: the source: HTML, CSS and all app JS except the IV tab. **Edit this.**
- `iv.js`: the IV tab. `build.js` inlines it into the page.
- `build.js`: injects the fallback data into `app.html` and writes `index.html` (GitHub Pages) and `artifact.html` (page content only). Never edit those two by hand.
  Usage: `node build.js <gamemaster.min.json> <rocketLineups.json> <raids.json> <GAME_MASTER.json> <pokebattler-raids.json> [dates…]`
- `sw.js`, `manifest.webmanifest`: PWA. The service worker is network-first.

No dependencies, no bundler, no CI. Plain JS in compact one-line style; follow it.

## Data

The live data is refreshed in the browser at most every 3 h, from PvPoke (stats, moves), ScrapedDuck (Rocket lineups, raid bosses), the alexelgt game master (raid moves, Max data) and Pokebattler (Max bosses). It's cached in `localStorage`. Each source falls back to the data embedded at build time.

The code between `//<transform>`, `//<calc>` and `//<raid>` markers is also run by `build.js` in Node (compacting the data and precomputing the all-time raid ranking). Keep those sections free of DOM access.

To rebuild without downloading data, reuse what the current `index.html` embeds: the values of `GM`, `RK`, `RD`, `RM`, `MX`, `MB` and the `GMT…MBT` dates, plus `RO` recomputed with `overallSaved()`. Then do the same replacements as `build.js`.

## Tabs

- **IV**: rank of an IV spread within the species, per league.
- **Auto**: one Pokémon, ranked among released Pokémon of each of its own types:
  - Rocket: fast move of the type. Raid: fast or charged move of the type. Max attacker: Max Attack of the type (its fast move type, or its own G-Max or special Max Move). Max tanks and healers: among Dynamax Pokémon of the type.
  - Only opponents weak to the type count. Rocket: grunts whose lineup the type hits super effectively on average. Raid: only 4★ and stronger bosses (all-time and current). Max tanks and healers: every Max boss.
  - Score: the average over opponents of the score relative to #1 against each one.
  - Entries without a rank are hidden, and so is a section without entries. When everything is hidden, a "Nothing to rank" card explains why.
  - Rankings are cached per type for the session, and raid ranks are calculated in the background with progress.
- **Rocket / Raid / Max**: rankings against one chosen opponent, plus all-time views.

## Intentional decisions (don't "fix")

- Megas are left out of Rocket rankings, in both the Rocket and the Auto tab.
- Everything except the IV tab assumes level 50 hundos.
- Dark theme only. Light mode was removed and isn't supported.
- The Auto strip tooltip may cover the rank number, picks the nearest tick in dense clusters and has no keyboard access. All accepted as is.

## Conventions

- UI texts (labels, messages, calculation details) state only what a user needs. No reasoning from chats, no justifications, no comparisons, nothing that another sentence already implies. Use paragraphs in calculation details.
- Changes must not alter the other tabs' results. After touching the `raid` section, check that `overallSaved()` gives the same result as the `RO` embedded in the previous build.

## Testing

Use headless Chrome on a test copy of `index.html`:
- Stub `fetch` (so the embedded data is used) and preset `localStorage` (`tab`, `rf-auto`).
- Use `--virtual-time-budget` so background calculations finish, and read results via `--dump-dom`.
- Headless Chrome won't lay out narrower than about 500 px. For phone-width screenshots, load the page in a 375 px wide iframe.
