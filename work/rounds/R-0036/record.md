---
schemaVersion: "1.0.0"
id: "R-0036"
title: "Evaluate all 43 applicable scorecard cells"
type: "round"
kind: "evaluation"
status: "active"
date: "2026-10-18"
authority: "Architect"
goal: "User-approved scorecard assessment and existing sensor enablement, tracked by BL-0001."
declared_by: "user-approved-plan-20261018"
isolation:
  kind: "branch"
  branch: "codex/scorecard-evaluation-20261018"
  base_sha: "3ec14d3a0e6b274dc367157bc4958f81750c5dc8"
waves:
  - id: "W1"
    title: "Configuration and population"
    roles: ["architect"]
    type: "planning"
    lock_scopes: ["law/policy/scorecard-sensor-inputs.json", "work/rounds/R-0036"]
    gates: ["sensor-inputs-schema"]
  - id: "W2"
    title: "Runtime and sensor evidence"
    roles: ["engineer", "inspector", "auditor"]
    type: "evaluation"
    lock_scopes: [".devai/local/rounds/R-0036", "record/proofs"]
    gates: ["43-cell-register", "evidence-chain"]
gates: ["43-cell-register", "evidence-chain"]
orchestrator_prompt: "work/rounds/R-0036/prompts/00-orchestrator.md"
plan_path: "work/rounds/R-0036/plan.md"
---

# R-0036

Canonical round lifecycle record. The frontmatter is schema-authoritative.
