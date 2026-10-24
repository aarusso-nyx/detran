# Capture retention

The original 140 report files are retained byte-for-byte in `raw-source-captures.tar.gz`. Every member hash and size was independently verified. `capture-storage-map.json` records the original logical paths and storage locations.

Five newly published stdout copies have trailing blank lines. Their bytes are retained both as original archive members and as adjacent `.stdout.gz` files; no output was trimmed or rewritten. Paths in earlier immutable capture manifests remain logical captured paths. Resolve the five relocated flat paths through the storage map or archive. All other original flat files remain available. The original acceptance manifest, its native proof binding and the machine proofs/readings are unchanged. External original captures remain untouched.

The final source RC and verification results are retained externally and in the PR/tag checks after the source is frozen. Native overall FAIL, historical limitations and held scopes remain explicit.
