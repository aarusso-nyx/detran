# ADR-0040: Documentation dependency audit remediation

## Status

Accepted under the Owner instruction of 2026-10-08 to fix failed CI on PR #179.

## Decision

Keep Docusaurus 3.10.2 and the existing moderate npm audit threshold. Pin published patched transitive versions for compression, http-cache-semantics, postcss-selector-parser, proxy-addr, shell-quote, source-map-js and tinypool in the documentation site's npm overrides. Regenerate its independent npm lockfile; do not change the runtime workspace lockfile or CI gating policy.

The braces advisory [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) affects every published release through 3.0.3, with no patched npm release available at verification. Vendor the MIT-licensed 3.0.3 published package surface as the local patch 3.0.4-detran.1. Remove upstream development dependencies and scripts from the local install manifest. Add non-disableable parser stack and recursive AST walker bounds of 128; preserve ordinary brace/range behavior and protect direct AST inputs as well as malformed/unclosed patterns. Record upstream tarball provenance and installed-file digests in the vendor directory.

The mandatory documentation security command checks installed patch identity and integrity and exercises compatibility and adversarial nesting before running the unchanged npm audit. A local version label or omitted registry advisory alone is insufficient evidence of remediation. Replace the fork when a reviewed upstream release provides equivalent bounds.

## Validation

Require a clean npm ci, the documentation security gate, typecheck, production build and link checks, and repository formatting/state-index checks. The exact updated PR candidate must pass all protected CI checks before integration. This repair does not authorize merge or deployment.
