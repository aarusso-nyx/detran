---
schemaVersion: "1.0.0"
id: "R-0037"
title: "C1 runtime dependency security remediation"
type: "round"
kind: "remediation"
status: "active"
date: "2026-10-19"
authority: "Architect"
goal: "Execute only Owner-approved C1 for BL-0013; preserve closed R-0036, thresholds and all evidence histories; submit separate PR without merge."
declared_by: "Owner approval in current conversation, 2026-10-19: Aprovo o pacote C1. Execute-o em nova rodada e PR separado."
isolation:
  kind: "branch"
  branch: "codex/c1-runtime-dependencies-r0037"
  base_sha: "2df548e0ac5227abb64b66994f675dea7ba36a5a"
waves:
  - id: "W1"
    title: "Bounded dependency resolution"
    roles: ["engineer"]
    type: "implementation"
    lock_scopes: ["package.json", "pnpm-lock.yaml"]
    gates: ["stynx-pin", "frozen-install", "dependency-scope"]
  - id: "W2"
    title: "Validation and independent assessment"
    roles: ["inspector", "auditor"]
    type: "evaluation"
    lock_scopes: ["work/rounds/R-0037/reports"]
    gates: ["backend-tests", "security-scan", "preservation", "evidence-chain"]
gates: ["dependency-scope", "backend-tests", "security-scan", "preservation", "evidence-chain"]
orchestrator_prompt: "prompts/00-orchestrator.md"
plan_path: "plan.md"
---

# R-0037

Canonical round lifecycle record. The frontmatter is schema-authoritative.
