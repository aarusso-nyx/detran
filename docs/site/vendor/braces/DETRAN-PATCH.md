# DETRAN braces depth-limit patch

Based on the published braces 3.0.3 tarball, SHA-256 `1cd18e862c8640b4568b1425a7df4ee030ff201d45b2da8f9f222d2987494ffc` and npm integrity `sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==`. The MIT license and original package surface are retained.

[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) has no published patched version on 2026-10-08. Local version `3.0.4-detran.1` is a DETRAN patch, not an upstream release. Parser stack pushes reject nesting beyond 128 stack entries; compile, expand and stringify reject AST recursion deeper than 128 before visiting children. These guards also protect direct AST inputs and internal stringify calls for malformed/unclosed patterns. The limit is fixed and cannot be disabled by caller options.

`docs/site/scripts/check-braces-patch.mjs` verifies the installed identity and artifact digests, ordinary glob/range behavior, deep braces/parentheses/unclosed patterns, and direct AST input across all walkers. It is mandatory in `security:check`, before the unchanged moderate npm audit threshold. Remove this fork when an upstream release provides equivalent reviewed bounds.
