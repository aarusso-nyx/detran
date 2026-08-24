# tools

Repo-local engineering tooling (not shipped, not a runtime dependency of any app):

- Phase 2 (W2.5): teat's blueprint generators, made **regenerable-only** — a CI drift
  check compares generated files to blueprint output; generated files are never
  hand-edited.
- Verification scripts as gates accrete (boundary checks, decorator checks, OpenAPI
  drift), unless a script belongs to a specific workspace package.

Keep entries small and single-purpose; anything platform-generic belongs in stynx or
devai, not here.
