# DEVAI security patch provenance

This is a locally vendored copy of `braces` for the DEVAI documentation site.
Upstream `3.0.3` is the base (`74b2db2938fad48a2ea54a9c8bf27a37a62c350d`, the
latest published release, 2024-05-21; registry integrity
`sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==`).

It adds a nesting-depth guard for CVE-2026-93687 / GHSA-vfj7-8cjw-p6xm (stack
exhaustion through deeply nested brace patterns). Upstream disputes the advisory
and has not published a fixed release (micromatch/braces#70, #73, #85); the fix
here mirrors the parser guard proposed in micromatch/braces#89:

- `lib/constants.js` — `MAX_DEPTH: 100`, alongside the existing `MAX_LENGTH`.
- `lib/parse.js` — resolve `options.maxDepth` (clamped to `MAX_DEPTH`) and throw
  a controlled `SyntaxError` when an opening `{` exceeds it, so the recursive
  `compile`/`expand`/`stringify` walkers never see an unbounded tree.

Only the published package surface (`index.js`, `lib`, README and MIT license)
is vendored, plus this note. The local version is `3.0.3-devai.1`; it must be
removed once upstream publishes a release with a depth guard or the advisory is
withdrawn from the GitHub Advisory Database.
