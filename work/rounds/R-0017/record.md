---
schemaVersion: "1.0.0"
id: "R-0017"
title: "Stack local versionada do DETRAN"
type: "round"
kind: "work"
status: "closed"
date: "2026-09-27"
authority: "Architect"
goal: "C-0002 ação 4: stack local isolada, fixtures, smoke das quatro aplicações, runbook e CI manual opcional"
declared_by: "D-1"
closed_by: "D-2"
phase_closure: "PC-0018"
merged_as: "d5afcf9211373238d6eb7b8ad09188a342101a39"
isolation:
  kind: "worktree"
  branch: "orchestra/local-stack"
  base_sha: "220a40202bf4ab17a5ce28b882ad96d60755842f"
waves:
  - id: "CTG-0001"
    title: "Verbatim stack adoption and characterization, then isolated DB, pinned PostGIS, inspectable config and bounded health (PR #133)."
    roles: ["Architect", "Inspector", "Engineer"]
    type: "coupled"
    lock_scopes: ["MOD-stack"]
    gates: ["cross-family-delivery-review", "pnpm-check", "evidence-chain"]
  - id: "CTG-0002"
    title: "Fresh-local-stack seed, six-route SEFAZ mock, fail-closed CH adapters, local-only Portal complaint and four-app smoke (PR #143)."
    roles: ["Architect", "Inspector", "Engineer"]
    type: "coupled"
    lock_scopes: ["MOD-stack"]
    gates: ["cross-family-delivery-review", "pnpm-check", "evidence-chain"]
  - id: "CTG-0003"
    title: "Runbook, disposable env example, workflow_dispatch-only CI smoke and R-0017 record transcription (PR #144)."
    roles: ["Architect", "Engineer"]
    type: "coupled"
    lock_scopes: ["MOD-stack"]
    gates: ["cross-family-delivery-review", "pnpm-check", "evidence-chain"]
gates: ["cross-family-delivery-review", "evidence-gate", "foundation", "senatran-mock", "senatran-mock-tests", "verified-local-rc", "pnpm-check", "checkpoint-b", "evidence-chain"]
orchestrator_prompt: "prompts/00-maestro.md"
plan_path: "plan.md"
---

# R-0017

Canonical round lifecycle record. The frontmatter is schema-authoritative.
