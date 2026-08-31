---
title: DEVAI Constitution binding
sidebar_position: 1
---

# DEVAI Constitution binding

DETRAN binds the immutable Constitution supplied by
`@aarusso-nyx/devai@1.4.5`. The authoritative repository copy is
`.devai/pin/constitution.md`; its version `1.0.0` and SHA-256 digest
`3f0e2ddc45d0f4102eda34776700d8da7a1e56aab30c6ab43cc6ee6dbe972542`
are recorded in `.devai/config/project.json`.

The complete bound text is published as
[DEVAI Constitution 1.0.0](../../.devai/pin/constitution.md). The binding is
refreshed only through the installed package:

```sh
pnpm exec devai init bind --target . --tier tier3 --constitution --as-role architect --write
```

The root `CONSTITUTION.md` is preserved as historical DETRAN genesis evidence.
It contains Constitution 0.3.0 and is not the active governance binding.
