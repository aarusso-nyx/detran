---
schemaVersion: "1.0.0"
id: "R-0045"
title: "scorecard-lint-repair"
type: "round"
kind: "remediation"
status: "active"
date: "2026-10-23"
authority: "Architect"
goal: "Owner-authorized scorecard-lint-repair package; preserve assertions, thresholds, both proof histories, closed rounds, DEVAI2.6.3 and C6 hold."
declared_by: "D-1"
isolation:
  kind: "branch"
  branch: "codex/scorecard-lint-repair"
  base_sha: "a97e6def6cc4b80d65c5ab0ee9579241f0b33446"
waves:
  - id: "W1"
    title: "Reproduce and implement the bounded correction"
    roles: ["architect", "engineer", "inspector"]
    type: "implementation"
    lock_scopes: ["backend", "apps", "packages", "senatran-mock", "tools", "tools/blueprints/generate.mjs", "law/security/authorization.json", "law/security/pii-registry.json"]
    gates: ["assertions-preserved", "thresholds-preserved", "C6-held"]
  - id: "W2"
    title: "Validate and retain official evidence"
    roles: ["architect", "inspector", "auditor"]
    type: "evaluation"
    lock_scopes: ["work/rounds/R-0045/reports"]
    gates: ["exact-scope", "evidence-chain", "historical-bytes-preserved"]
gates: ["assertions-preserved", "thresholds-preserved", "C6-held", "evidence-chain"]
orchestrator_prompt: "prompts/00-orchestrator.md"
plan_path: "plan.md"
---

# R-0045

Canonical round lifecycle record. The frontmatter is schema-authoritative.
