---
id: ADR-0058
title: Preserve compiler metadata and runtime names in scorecard collection
type: adr
status: active
date: '2026-10-22'
authority: Architect
supersedes: []
superseded_by: null
provenance:
  [
    'work/rounds/R-0042/decisions.md#d-1--separate-measurement-package',
    'ADR-0050',
  ]
affected_rules:
  - 'tests/config/coverage-support.mjs'
  - 'tests/config/local.coverage.config.ts'
---

# ADR-0058: Preserve compiler fidelity during scorecard collection

## Status

Accepted under the express R-0042 measurement request; no new product or C6 authority.

## Context

The 0e26c795 evaluation retained seven observation gaps. Aggregate unit collection omitted constructor metadata in several Nest packages and Vite SSR renamed compiler-emitted nested class expressions. Existing tests inspect these names and metadata. Targeted diagnostics reproduced failures without changing product source or assertions; compiler-fidelity collection made the same tests pass. A passing subset is not a complete measurement.

## Decision

At the aggregate scorecard collector boundary, reuse the existing ordinary Nest metadata compiler with its source admission and compiler flags. Apply Vite's existing esbuild name-preserving transformation to emitted JavaScript, composing the original TypeScript map before SSR scope rewriting. Apply the same name-preserving map composition to existing Angular compiler output. This changes only measurement configuration.

Preserve complete workspace/source censuses, original package assertions, exclusions and threshold policies, partial-run refusal, report digest/candidate binding and failed-run refusal. Run unchanged integration/E2E populations before considering any environmental remediation. No deadline or performance target is relaxed.

## Consequences and limits

Genuine full execution and correctly bound coverage remain required. Existing product defects, if measured, remain separate backlog work. Static JSON-alias admission requires an independent provider repair and published adoption; it is not solved by changing package roots or hiding tests here. No native C6 producer, custody protocol, invariant binding, product behavior or historical evidence is changed. Both prior evaluation attempts and all closed rounds remain preserved.
