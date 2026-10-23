---
schemaVersion: "1.0.0"
id: "R-0043"
title: "E2E mock fixture and workflow remediation"
type: "round"
kind: "remediation"
status: "active"
date: "2026-10-23"
authority: "Architect"
goal: "Owner-authorized separate scorecard-e2e-repair package; preserve assertions, thresholds, both proof histories, closed rounds, installed DEVAI2.6.3 and C6 security hold."
declared_by: "D-1"
isolation:
  kind: "branch"
  branch: "codex/scorecard-e2e-repair"
  base_sha: "a97e6def6cc4b80d65c5ab0ee9579241f0b33446"
waves:
  - id: "W1"
    title: "Reproduce and implement the bounded correction"
    roles: ["engineer", "inspector"]
    type: "implementation"
    lock_scopes: ["senatran-mock/tests", "senatran-mock/domain", "senatran-mock/database", "tools/devai/verify-proof-anchors.mjs", "tools/devai/tests/verify-proof-anchors.test.mjs", "docs/meta/adr/ADR-0059-official-test-proof-anchor-compatibility.md"]
    gates: ["assertions-preserved", "thresholds-preserved", "C6-held"]
  - id: "W2"
    title: "Validate and retain official evidence"
    roles: ["architect", "inspector", "auditor"]
    type: "evaluation"
    lock_scopes: ["work/rounds/R-0043/reports"]
    gates: ["exact-scope", "evidence-chain", "historical-bytes-preserved"]
gates: ["assertions-preserved", "thresholds-preserved", "C6-held", "evidence-chain"]
orchestrator_prompt: "prompts/00-orchestrator.md"
plan_path: "plan.md"
---

# R-0043

Canonical round lifecycle record. The frontmatter is schema-authoritative.
