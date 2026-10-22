---
schemaVersion: "1.0.0"
id: "R-0042"
title: "Seven scorecard measurement gaps"
type: "round"
kind: "remediation"
status: "active"
date: "2026-10-22"
authority: "Architect"
goal: "Resolve BL-0024 measurement gaps only; preserve thresholds, proof histories, closed rounds and C6 security hold."
declared_by: "D-1"
isolation:
  kind: "branch"
  branch: "codex/scorecard-seven-measurement-gaps"
  base_sha: "4fbca6ce18fe16dea98a3af356e0143479b4c190"
waves:
  - id: "W1"
    title: "Collector fidelity and existing complete suites"
    roles: ["architect", "inspector", "engineer"]
    type: "implementation"
    lock_scopes: ["tests/config", "tests/coverage-support.test.mjs"]
    gates: ["unchanged-product", "unchanged-assertions-thresholds", "C6-held"]
  - id: "W2"
    title: "Upstream read-only population admission repair"
    roles: ["architect", "inspector"]
    type: "implementation"
    lock_scopes: ["work/rounds/R-0042/reports"]
    gates: ["independent-review", "strict-native-census-preserved", "published-provider-required"]
  - id: "W3"
    title: "Fresh official measurements and proof custody"
    roles: ["auditor", "inspector"]
    type: "evaluation"
    lock_scopes: ["work/rounds/R-0042/reports"]
    gates: ["exact-frozen-source", "immediate-recording", "evidence-chain", "43-cell-reconciliation"]
gates: ["unchanged-product", "unchanged-assertions-thresholds", "C6-held", "evidence-chain"]
orchestrator_prompt: "prompts/00-orchestrator.md"
plan_path: "plan.md"
---

# R-0042

Canonical round lifecycle record. The frontmatter is schema-authoritative.
