---
schemaVersion: "1.0.0"
id: "R-0018"
title: "C-0002 action 3: ADR numbering policy and renumbering (ADR-0035…0038), ADR and state indexes with the verify:state-index gate, state documents and model ladder (Sol 6 / Opus 5.5), versioned worker reports, and 52 new plus 12 refreshed READMEs"
type: "round"
kind: "work"
status: "closed"
date: "2026-09-27"
authority: "Architect"
goal: "C-0002 ação 3: racionalizar a numeração e os índices de ADR e estado, corrigir documentos de estado e versionar os READMEs e relatórios da rodada"
declared_by: "D-1"
closed_by: "D-2"
phase_closure: "PC-0020"
merged_as: "4bd1d553478e1eb831353d30dd6769183c2b3990"
isolation:
  kind: "worktree"
  branch: "orchestra/index-state"
  base_sha: "220a40202bf4ab17a5ce28b882ad96d60755842f"
waves:
  - id: "CTG-0001"
    title: "Política e renumeração de ADRs, índices coerentes e gate verify:state-index (PR #128)."
    roles: ["Architect", "Inspector", "Engineer", "Auditor"]
    type: "coupled"
    lock_scopes: ["MOD-adr-index", "MOD-state-index"]
    gates: ["cross-family-delivery-review", "github-ci", "pnpm-check", "evidence-chain"]
  - id: "CTG-0002"
    title: "Documentos de estado, escada de modelos e relatórios versionados (PR #129)."
    roles: ["Architect", "Engineer", "Auditor"]
    type: "coupled"
    lock_scopes: ["MOD-state-docs", "MOD-orchestra-method"]
    gates: ["cross-family-delivery-review", "github-ci", "pnpm-check", "evidence-chain"]
  - id: "CTG-0003"
    title: "52 READMEs novos e 12 atualizados, com fechamento da ação 3 (PR #130)."
    roles: ["Architect", "Auditor"]
    type: "coupled"
    lock_scopes: ["MOD-docs"]
    gates: ["cross-family-delivery-review", "github-ci", "pnpm-check", "evidence-chain"]
gates: ["cross-family-delivery-review", "github-ci", "pnpm-check", "docs", "evidence-chain"]
orchestrator_prompt: "prompts/00-maestro.md"
plan_path: "plan.md"
---

# R-0018

Registro canônico da rodada. O frontmatter identifica o fechamento corretivo PC-0020; PC-0015 e seu `fail` histórico permanecem preservados.
