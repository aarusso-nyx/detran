# Worker-team playbook — multidisciplinary context round for an app/module

Reusable prompt kit to run a **four-specialist context round** (researcher → legal + BPO + UX) that
builds or extends the business/legal context stack of ONE app/module of this knowledge base.
Proven em 6 rodadas: RAIT, TEAT, BOAT, PEC, PORTAL, DASHBOARD (greenfield e confirm-extend). Para apps transversais, use UM pesquisador compartilhado e dê direito de escrita em `docs/reference/legal/` a apenas UM especialista legal por rodada. Paste the **Orchestrator brief** into a
fresh session, fill the `{{PARAMS}}`, and it drives everything else.

---

## Orchestrator brief (paste this into the new session)

You are the ORCHESTRATOR of a four-specialist context round in the governed `detran` repository
(read `docs/meta/knowledge-base/conventions.md` first — artifact types
APP/JRN/UC/WF/RN/REF, front-matter, status ladder stub→draft→reviewed→approved).

**Parameters**

- `{{APP}}` = app/module name (e.g. boat, pec, portal, dashboard)
- `{{APP_DIR}}` = its canonical KB dir (e.g. `docs/framework/product/domains/est/boat`,
  `docs/framework/product/domains/ch/pec`, `docs/framework/product/transversal/portal`)
- `{{MODE}}` = `greenfield` (thin/no base) or `confirm-extend` (audit + extend existing artifacts)
- `{{FOCUS}}` = one sentence on the round's business goal
- `{{SEED_GAPS}}` = paste the app's open items from
  `docs/meta/knowledge-base/backlog.md` + `{{APP_DIR}}/_intake/*`

**Sequencing (never parallel-start the trio before the researcher finishes)**

1. Spawn the RESEARCHER (Sonnet-tier). Wait for completion. Commit its output:
   `kb(refs): {{APP}} research round — <finds>`.
2. Spawn LEGAL (Opus-tier — precision-critical), BPO (Sonnet), UX (Sonnet) **in parallel**.
3. Commit each specialist's output as it lands, one commit per area:
   `kb({{APP_DIR}}/legal|bpo|ux): <summary>`.
4. MERGE PASS (yours, not an agent's): read every `_intake/*` produced; fold glossary/actor
   proposals into `docs/framework/product/shared/` (you own those files), append distilled
   owner-decisions and research debt to `docs/meta/knowledge-base/backlog.md`; apply any
   cross-boundary corrections a specialist flagged
   (e.g. a revoked citation in another area's file). Final commit + a round summary to the user
   listing: inventory, top legal risks, owner decisions required.

**Iron rules (these made the pattern work — do not relax)**

- Each agent gets an explicit READ list and a strict WRITE boundary (disjoint dirs); agents never
  run git; only you commit.
- Forward references to not-yet-written ids (`[RN-{{APP}}-1xx]`, `[WF-…]`) are sanctioned backlog
  markers — parallel specialists rely on them.
- Every legal claim is verbatim-anchored to a `[REF-…]` or marked `(fonte pendente)` — inventing
  regulation is the one unforgivable failure.
- Primary sources only from official domains (gov.br, in.gov.br, planalto, órgão sites); blogs and
  aggregators are finding aids only. Keep the ORIGINAL (pdf/html) beside every excerpt `.md`.
- In `confirm-extend` mode the researcher must deliver a CONFIRM / CONTRADICT / EXTEND map against
  every existing artifact, and specialists revise in place (keep ids, add a revision note) instead
  of duplicating.
- KB content in Portuguese; agent reports may be in English.

---

## Prompt skeleton 1 — RESEARCHER (Sonnet)

> You are the CRAWLER/RESEARCHER of a four-specialist team building the context stack for
> `{{APP}}` ({{FOCUS}}). Boundaries: write ONLY under `docs/reference/legal/**` and ONE dossier at
> `{{APP_DIR}}/_intake/research-dossier.md`. No git. Read first:
> `docs/meta/knowledge-base/conventions.md`, `docs/reference/legal/index.md`,
> the existing `{{APP_DIR}}/**` base, and these open gaps: {{SEED_GAPS}}.
> Targets (priority order): [derive 5-8 concrete targets from the gaps — for each: the national
> instrument to identify+download (CTB articles verbatim, CONTRAN resolutions verifying vigência
> against the 2022 consolidation wave, SENATRAN portarias implementing "regulamentação
> específica"), the DETRAN-AM local instruments (legisla.am.gov.br, diário oficial), and 1-2
> other-state models for internal process]. Download originals (curl) as REF-<CORPUS>-<id>.pdf
> into the right subdir; blocked sites → WebFetch extract flagged non-original; record every URL
> and every negative ("não localizado publicamente").
> Dossier: per-target findings + verbatim key passages + vigência confidence + gaps; in
> confirm-extend mode a CONFIRM/CONTRADICT/EXTEND map per existing artifact; end with handoff
> sections for LEGAL / BPO / UX. Final message: downloads inventory + 5 most consequential findings.

## Prompt skeleton 2 — LEGAL (Opus)

> You are the LEGAL TRAFFIC SPECIALIST… Read: CONVENTIONS + templates/RN + the dossier + every
> REF it cites + existing `{{APP_DIR}}/rules/*`. Write boundaries: `{{APP_DIR}}/rules/RN-{{APP}}-101..1NN`
> (legal series; audit/correct the 0xx series in place where sources upgraded), refinements to
> `docs/reference/legal/**/REF-*.md` you can make more precise (never touch originals),
> `docs/reference/legal/index.md` rows,
> `{{APP_DIR}}/_intake/legal-assessment.md`. Rule set: [enumerate the domains of law the round
> must cover — prazos/competências/procedures/evidentiary preconditions]. Every rule
> verbatim-anchored; ambiguity goes under "Controvérsia/risco", never resolved by invention.
> legal-assessment.md ends with a prioritized human-lawyer validation list.
> Final message: inventory + audit results + top 5 legal risks.

## Prompt skeleton 3 — BPO (Sonnet)

> You are the BPO SPECIALIST… Read: CONVENTIONS + templates/WF,UC + dossier (BPO handoff) + the
> REFs + existing `{{APP_DIR}}/{workflows,use-cases,APP.md}` + exemplars
> `inf/rait/workflows/WF-RAIT-001..003` (quality bar). Write boundaries:
> `{{APP_DIR}}/workflows/**` (revise in place + new WFs), `{{APP_DIR}}/use-cases/**`,
> `{{APP_DIR}}/APP.md` (process sections), `{{APP_DIR}}/_intake/bpo-notes.md`.
> Mandates: mermaid state machines with transition/actor tables; EVERY timer legally cited;
> legal deadline vs operational SLA kept separate; escalation ladders where a legal ceiling
> extinguishes rights; KPIs; capacity asks for the owner. Forward-reference the parallel legal
> series. Final message: inventory + state/timer counts + top 5 process decisions.

## Prompt skeleton 4 — UX (Sonnet)

> You are the UX SPECIALIST… Read: CONVENTIONS + templates/JRN + dossier (UX handoff) + REFs +
> existing journeys + exemplars `inf/rait/journeys/*` and the ux-notes format. Write boundaries:
> `{{APP_DIR}}/journeys/**` (+ `docs/framework/product/transversal/portal/**` ONLY if the round's scope includes the
> citizen side), `{{APP_DIR}}/_intake/ux-notes.md`. Mandates: journeys grounded in the real
> operating context (field/clinic/office conditions); screen inventory mapped to UC/WF ids;
> plain-language state map (internal state → user-facing label); form fields derived from the
> legal minimums, never asking documents the órgão already has; accessibility (gov.br/WCAG);
> anti-patterns from current practice named and countered.
> Final message: inventory + screen deltas + top 5 UX decisions.

---

## Round history (update after each round)

| Round      | App       | Mode           | Commits          | Notes                                                                                                                                                                                      |
| ---------- | --------- | -------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-08-24 | rait      | greenfield     | d2dad39..ad4d149 | 4 extinction clocks; regimento JARI-AM missing                                                                                                                                             |
| 2026-08-24 | teat      | confirm-extend | 76fb5b4..c45c6fc | SENATRAN 997/2022 (sessão exclusiva); Res 1025/2026 guarda monitorada; bodycam 003/2026; 43 RNs; 2 correções materiais na base                                                             |
| 2026-08-24 | boat      | confirm-extend | 1a6f426..a2be7a4 | RENAEST chain fechada (Res 808/2020); LGPD capturada como REF; retention-forever corrigida; 176-178 capture estruturada; parceiros facultativos confirmados                                |
| 2026-08-24 | pec       | confirm-extend | bb78993..        | Res 927 (juntas 3 instâncias+prazos); 5 CONTRADICTs (1 auto-achado: validade 10/5/3); CFM 1.636 distribuição imparcial; retenção 20 anos; Lei 15.428/2026 preço IPCA                       |
| 2026-08-24 | portal    | confirm-extend | 39c2c12..31973f0 | matriz ato→nível de assinatura (defesa/recurso = avançada); Decreto 10.543 é federal (falta ato estadual); ouvidoria excluída; uso único já tinha lei própria (CTB 285 §4º); 12x era falso |
| 2026-08-24 | dashboard | greenfield     | 39c2c12..896d88d | camada derivada × própria; 13 deveres periódicos (só 4-5 com data exata); reidentificação em municípios pequenos (risco ALTO); 42 indicadores tipados; visão-360º fora de escopo           |
