# Theme Service — Visual Overview

A tour of what this service is, how you work with it, and the workflows you'll hit. The diagrams
below render as graphics on GitHub; the same diagrams, live and themed, are on
[overview.html](overview.html).

🌐 **Live:** the overview is the repo's [GitHub Pages home](https://kaseycolian.github.io/theme-service/);
the **Preview Themes** nav segment opens the
[template page](https://kaseycolian.github.io/theme-service/preview/), which shows every theme in real
components.

---

## What it is

Create WCAG 2.2 compliant themes, then install them into a new or existing app. Use the themes that
ship here, or use the skill (`AGENTS.md` for other agents) to create your own — a guided process for
choosing colors that checks contrast as it goes. **A theme that fails WCAG 2.2 AA is never written.**

```mermaid
flowchart LR
  subgraph SRC["Source (committed)"]
    A["Built-in palettes<br/>tools/palettes/draft-*.mjs"]
    B["Your palettes<br/>tools/palettes/local.mjs"]
  end
  A --> BUILD["npm run build-themes<br/>contrast check — every color pair"]
  B --> BUILD
  BUILD -->|"passes"| OUT["themes/ — build output<br/>theme.css · tokens.json · helpers"]
  BUILD -. "fails WCAG 2.2 AA" .-> STOP["Not written<br/>fix the palette and re-run"]
  OUT --> APPS["Your app — new or legacy<br/>vendor the CSS + a theme picker"]
  SKILL["Claude skill / AGENTS.md"] -. "create · validate · install" .-> APPS
  SKILL -. guides .-> BUILD
```

**What you get:** accessibility handled up front — every color pair is checked before a theme exists.
On top of that: consistent branding across *all* your apps, driven by plain-English requests to an
agent, works fully offline, and it's **yours** — fork it, add themes, and keep pulling upstream
improvements without losing your work.

---

## Two ways in

You never have to create a theme to get value — Path 1 stands alone. Both paths are contrast-checked
the same way.

```mermaid
flowchart TD
  U(("You")) --> Q{"What do you want?"}
  Q -->|"1"| P1["Path 1 — Use the themes that ship here<br/>Install the skill → apply them to any app<br/>▶ npm run install-all"]
  Q -->|"2"| P2["Path 2 — Create your own themes<br/>Guided process for choosing colors<br/>▶ npm run build-themes"]
  P1 --> D1["Your app gets a theme picker,<br/>every theme already passes WCAG 2.2 AA"]
  P2 --> D2["Your themes join the set —<br/>checked the same way, reusable across apps"]
```

| Path | Who it's for | Start here |
|------|--------------|-----------|
| **1 — Use as-is** | Anyone who wants accessible theming fast | `npm run install-all`, then ask an agent to apply it |
| **2 — Create / edit** | You want your own brand themes | [CREATING-THEMES.md](../CREATING-THEMES.md) |

---

## Workflow A — Install themes into a new or existing app

You ask; the agent does the wiring and confirms the choices that matter before changing anything.

```mermaid
sequenceDiagram
  actor You
  participant Agent as Claude (skill)
  participant App as Your app repo
  You->>Agent: "Apply the theme-service to this app"
  Agent->>Agent: Locate the source (machine-local config)
  Agent->>You: Confirm — restyle depth? fonts? existing selector? placement?
  You-->>Agent: Your choices
  Agent->>App: Vendor theme CSS + map the app's colors to tokens
  Agent->>App: Add a theme picker (all themes) + persistence
  Agent->>App: Verify WCAG 2.2 AA, write THEME-SERVICE.md tracking log
  Agent-->>You: Done — switch themes live, nothing else changed
```

Later: *"Update this app to the latest theme-service version"* re-syncs it — new themes show up in the
picker automatically.

---

## Workflow B — Clone / save / update, with your own local + GitHub storage

This is the heart of "make it your own." **Your themes live on your machine and persist with a plain
local commit — GitHub is optional.** You can still pull my updates anytime without losing your themes.

```mermaid
flowchart TB
  O["Origin — mine<br/>github.com/kaseycolian/theme-service"]
  O -->|"clone or fork (once)"| C["Your machine — local clone"]

  subgraph FIRST["Add & save your themes"]
    C --> A["Add your themes → tools/palettes/local.mjs"]
    A --> B["npm run build-themes"]
    B --> D["git commit — saved locally ✔<br/>no GitHub required"]
  end

  D -. "optional: git push" .-> P["Your own GitHub<br/>backup · sync machines · share"]

  O ==>|"when I ship an update"| E["npm run update-from-origin<br/>fetch + merge — conflict-free<br/>(your local.mjs is never touched)"]
  E --> F["npm run build-themes<br/>you're asked: include my built-in themes?"]
  F --> G["git commit — updated locally ✔"]
  G -. "optional: git push" .-> P
```

- **Solid arrows = what you do locally.** Everything works with just local git.
- **Dotted arrows = optional GitHub** — only if you want backup, multi-machine sync, or to share.
- **Updates never overwrite your themes.** Your themes sit in `local.mjs`, which the origin never
  edits; the generated `themes/` files aren't committed, so merges don't conflict. During an update
  you choose whether to also take my built-in themes — and **nothing is ever auto-deleted**.

Storage at a glance:

| Where | What lives there | Committed? |
|-------|------------------|-----------|
| **Your machine** (local git) | your clone + `local.mjs` themes + your commits | yes (local) |
| **Your GitHub** (optional) | a pushed copy for backup / sharing | only if you push |
| **Origin — mine** | the built-in themes, skill, tools you pull updates from | yes (public) |
| **`~/.claude/…local.json`** | which repo is *your* source + your install/update history | **never** (machine-only) |

---

## Workflow C — Create or edit a theme

Three ways to start. All of them end at the same contrast check, and a palette only becomes a theme if
it passes.

```mermaid
flowchart LR
  START(("Add / edit<br/>a theme")) --> WAY{"How?"}
  WAY -->|"I have a palette"| W1["Give the colors →<br/>agent fills gaps + checks contrast"]
  WAY -->|"Guide me"| W2["Describe a vibe →<br/>agent proposes + iterates"]
  WAY -->|"A whole new style"| W3["Design candidates in a<br/>discovery draft, compare side-by-side"]
  W1 --> INTO["local.mjs (yours)"]
  W2 --> INTO
  W3 --> INTO
  INTO --> CHECK{"npm run build-themes<br/>contrast check — every color pair"}
  CHECK -->|"passes"| WRITTEN["Written to themes/<br/>and shown on the template page"]
  CHECK -. "fails" .-> REFUSED["Nothing written —<br/>adjust the palette and re-run"]
  REFUSED -. "iterate" .-> INTO
  WRITTEN --> COMMIT["git commit<br/>(saved locally)"]
```

Full walkthrough + copy-paste prompts: [CREATING-THEMES.md](../CREATING-THEMES.md).

---

## Workflow D — Releasing (origin owner)

When the owner changes themes/skill/tools, one command cuts a versioned, tagged release that forks
can pull.

```mermaid
flowchart LR
  CH["Make changes"] --> R["npm run release minor -- --note '…'"]
  R --> V["bump VERSION"]
  R --> CL["CHANGELOG entry"]
  R --> TG["git tag vX.Y.Z"]
  V --> PUSH["git push --follow-tags"]
  CL --> PUSH
  TG --> PUSH
  PUSH --> FORKS["Forks update via<br/>update-from-origin"]
```

---

## Key terms

- **Source repo** — the theme-service clone your machine points at (where themes are created/edited).
  Apps only get *copies*.
- **Built-in themes** — the origin's pre-installed set (`tools/palettes/draft-*.mjs`).
- **`local.mjs`** — *your* themes; the origin never touches it, so updates never lose them.
- **Build output** — `themes/theme.css` and friends: generated by `npm run build-themes`, not
  committed (so forks update cleanly).
- **Vendored copy** — the theme files an app keeps for itself after you apply the service.
- **Tracking log** — `THEME-SERVICE.md` written into each themed app: version + decisions + history.
- **Machine-local config** — `~/.claude/theme-service.local.json`: your source pointer, built-ins
  preference, and install/update history. Never committed.

---

*See also:* [README](../README.md) · [USAGE](../USAGE.md) (apply) ·
[CREATING-THEMES](../CREATING-THEMES.md) (create) · [ARCHITECTURE](../ARCHITECTURE.md) (how it fits).
