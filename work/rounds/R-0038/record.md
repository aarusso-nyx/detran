---
schemaVersion: "1.0.0"
id: "R-0038"
title: "C2 dependency tooling and Angular security remediation"
type: "round"
kind: "remediation"
status: "closed"
date: "2026-10-19"
authority: "Architect"
goal: "Owner-approved C2-C8 campaign; this round only C2. Preserve R0036/R0037 histories and thresholds."
declared_by: "D-1"
closed_by: "D-2"
phase_closure: "PC-0024"
merged_as: "11eea2d7309a958d14d536ea7ced46124dfeed2e"
isolation:
  kind: "branch"
  branch: "codex/c2-c8-campaign"
  base_sha: "92be0db44f9cc111ec9369f2fb81c5f6bd1efa1c"
waves:
  - id: "W1"
    title: "C2 dependency resolution"
    roles: ["engineer"]
    type: "implementation"
    lock_scopes: ["package.json", "pnpm-lock.yaml", "apps", "packages/ui/package.json"]
    gates: ["stynx-pin", "frozen-install", "dependency-scope"]
  - id: "W2"
    title: "Validation and independent assessment"
    roles: ["inspector", "auditor"]
    type: "evaluation"
    lock_scopes: ["work/rounds/R-0038/reports"]
    gates: ["backend-tests", "security-scan", "preservation", "evidence-chain"]
gates: ["dependency-scope", "backend-tests", "security-scan", "preservation", "evidence-chain"]
orchestrator_prompt: "prompts/00-orchestrator.md"
plan_path: "plan.md"
---

# R-0038

Canonical round lifecycle record. The frontmatter is schema-authoritative.
