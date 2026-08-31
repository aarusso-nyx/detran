# DETRAN knowledge-base conventions

`detran/docs` is the **business/legal knowledge base** of the DETRAN suite. It contains semantics,
workflows, journeys, use cases, business rules, and the legal corpus that anchors them.

## Layout

```
docs/
├── reference/legal/       # legal corpus — domain-independent (see §Refs)
│   ├── ctb/  contran/  senatran/  detran-am/  other-states/
├── framework/product/shared/ # cross-domain actors and master lifecycles
├── framework/product/domains/<domain>/ # inf | est | ch
│   ├── DOMAIN.md          # domain charter
│   └── <app>/             # teat | rait | boat | pec
│       ├── APP.md         # app charter — ALWAYS the first file written for an app
│       ├── journeys/      # JRN-*  end-to-end narratives (may cross apps)
│       ├── use-cases/     # UC-*   actor-goal specifications
│       ├── workflows/     # WF-*   state machines, deadlines, timers
│       ├── rules/         # RN-*   atomic business rules with legal anchors
│       └── screens/       # IU-*   screen inventory of the app's console(s)
├── framework/product/transversal/ # portal | dashboard
└── meta/knowledge-base/   # templates, session artifacts, research backlog
```

## Artifact types (what exists and why)

| Type             | Prefix              | One file answers                                                                        | Granularity      |
| ---------------- | ------------------- | --------------------------------------------------------------------------------------- | ---------------- |
| App charter      | `APP.md`            | why the app exists, actors, scope in/out, legal anchors                                 | 1 per app        |
| Domain charter   | `DOMAIN.md`         | what the domain owns, national system it mirrors                                        | 1 per domain     |
| Journey          | `JRN-<APP>-nnn`     | how a person experiences an end-to-end outcome                                          | 1 per outcome    |
| Use case         | `UC-<APP>-nnn`      | one actor achieving one goal (pre/post, main+alt flows)                                 | many per app     |
| Workflow         | `WF-<SCOPE>-nnn`    | a state machine: states, transitions, prazos, timers                                    | 1 per lifecycle  |
| Business rule    | `RN-<APP>-nnn`      | one atomic normative constraint, testable                                               | many, small      |
| Screen inventory | `IU-<APP>-nnn`      | the screens one console needs, mapped to states/UCs, plus cross-cutting UI requirements | 1 per console    |
| Legal ref        | `REF-<CORPUS>-<id>` | one statute/resolution/portaria: what it mandates for us                                | 1 per instrument |

Cross-references use ids in brackets: `[REF-CTB-282]`, `[WF-INF-001]`, `[RN-RAIT-003]`.
An id referenced before it exists is a **backlog marker**, not an error — grep for
unresolved ids to find research debt.

## Front-matter (mandatory on every artifact)

```yaml
---
id: UC-RAIT-001
title: Reviewer claims next appeal from the pool
status: stub | draft | reviewed | approved
apps: [rait, portal] # every app the artifact binds
sources: [REF-CTB-282, REF-CONTRAN-918]
updated: 2026-08-24
---
```

`status` is the progressive-growth mechanism:

- **stub** — id + title + one paragraph of intent. Cheap to create; parks a known need.
- **draft** — full content, written from sources, not yet human-reviewed.
- **reviewed** — the owner read it and steered corrections in chat.
- **approved** — binding input for monorepo phases; changes need an explicit chat decision.

## Refs (legal corpus) — `docs/reference/legal/**`

One instrument = one folder entry pair:

- `REF-<CORPUS>-<id>.md` — front-matter (id, official title, órgão, status
  vigente/revogada/alterada, official URL, local pdf filename) + **only the excerpts that
  matter to our apps**, each excerpt tagged with the artigo/inciso and which app/rule it feeds.
- `REF-<CORPUS>-<id>.pdf` (or .html) — the complete original, downloaded, never edited.

`docs/reference/legal/index.md` catalogs every instrument: id · título · vigência · apps affected.
When an instrument is superseded, mark `status: revogada`, add `superseded_by:`, keep the file.

## Working model (parallel + progressive)

1. **Domains evolve independently.** A research/authoring session touches ONE domain (or
   `docs/reference/legal/` or shared semantics). No cross-domain file edits in the same commit → no merge friction,
   parallel sessions safe.
2. **Growth is steered, not one-shot.** `docs/meta/knowledge-base/backlog.md` is the steering queue: any chat
   can append `- [ ] <question or artifact id> — <why>`. A research pass picks items, produces
   stubs→drafts, checks them off with the commit hash.
3. **Chat is the moderator.** Drafts are promoted to `reviewed` only after the owner reads
   them in a steering conversation; disagreements are resolved in chat and the resolution is
   recorded in the artifact under `## Decisões` with a date.
4. **Every claim has a source.** A business statement without a `[REF-…]` anchor is marked
   `(fonte pendente)` and generates a backlog entry. Never silently invent regulation.
5. Commit style: `kb(<area>): <what>` — e.g. `kb(refs): CTB arts. 280-290 excerpts`,
   `kb(inf/rait): WF-RAIT-001 draft`. Work in a dedicated worktree and integrate by PR under the
   repository's required checks; never commit directly to `main`.

## Two rules the corpus check enforces

`pnpm docs:kb:check` fails the corpus on either of the defects found in the
cross-app audit of 2026-08-26. Run it before promoting anything to `approved`.

**1. Brackets mean a KB artifact.** `[RN-TEAT-111]` must resolve to an artifact's
front-matter `id`. Ids of the archived prototype systems (`RN-AIT-*`, `RN-EVD-*`,
`RN-PRO-*`, `RN-ALC-*`, `RN-MED-*`, `RN-SIN-*`, `RN-AUD-*`, `RN-GER-*`, `RN-LGPD-*`) are
provenance, not artifacts — cite them in prose, never in brackets.

_Never cite a rule by a number that has not been written yet._ When a BPO round runs in
parallel with the LEGAL round that will publish the rules, the forward reference must be a
description, not a guessed number — a guessed number does not stay dangling, it silently
becomes a reference to a real but unrelated rule once the catalog fills in. This happened
twice: RAIT (12 references) and TEAT (8), both discovered only in audit.

**2. The workflow owns the state vocabulary.** Every `ALL_CAPS` token in backticks outside
`workflows/` must appear in some `workflows/` file. Rules, use cases, journeys and screen
inventories consume state names; they never coin them. A LEGAL round that finds a state the
machine lacks must get it added to the workflow — see `AGUARDANDO_REMESSA_JARI` in
[WF-RAIT-001], which marks where the 24-month clock starts and had no home before.
