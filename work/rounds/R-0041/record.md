---
schemaVersion: "1.0.0"
id: "R-0041"
title: "C5-C8 security specification and governance controls"
type: "round"
kind: "remediation"
status: "active"
date: "2026-10-19"
authority: "Architect"
goal: "Owner-authorized C2-C8 implementation; truthful measurement, no threshold relaxation or rewritten history."
declared_by: "D-1"
isolation:
  kind: "branch"
  branch: "codex/c5-c8-governance"
  base_sha: "92be0db44f9cc111ec9369f2fb81c5f6bd1efa1c"
waves:
  - id: "W1"
    title: "Bounded dependency resolution"
    roles: ["architect"]
    type: "implementation"
    lock_scopes: ["law/invariants", "law/trace.json", "law/constitution.md", ".github/workflows/ci.yml"]
    gates: ["source-trace"]
  - id: "W2"
    title: "Validation and independent assessment"
    roles: ["inspector", "auditor"]
    type: "evaluation"
    lock_scopes: ["work/rounds/R-0041/reports"]
    gates: ["no-fabrication", "evidence-chain"]
gates: ["source-trace", "no-fabrication", "evidence-chain"]
orchestrator_prompt: "prompts/00-orchestrator.md"
plan_path: "plan.md"
---

# R-0041

Canonical round lifecycle record. The frontmatter is schema-authoritative.
