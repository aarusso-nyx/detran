# S2-R2 — four-key typed ladder parsing

Role: Owner decision recorded by Architect under the temporary delegated Owner
window; Inspector owns RED/GREEN, Engineer owns parser implementation.

Decision: adopt the recommended minimal extension to tools/parameters/parser.mjs.
Its existing jsonDefault returns generic JSON text as a string; only the unrelated
legal-bases key has typed parsing. Thus the approved four ladder objects would be
JSONB strings and fail the already-approved executable provider contract.

Authorize one additional Engineer path: tools/parameters/parser.mjs, solely for
exact keys rait.ladder.A, rait.ladder.B, rait.ladder.C, rait.ladder.D. Parse valid
JSON objects and validate the exact approved ladder schema frozen by Architect;
reject malformed/unexpected shape, invalid clock identity and unsupported values.
Keep every other key's parsing behavior and all existing legal-bases validation.
No generic JSON behavior change, generator redesign, dependencies or new outputs.

Inspector already owns tools/parameters/tests/generator.test.mjs and
allowlist-rait.test.mjs: first prove typed-object failure against unchanged parser,
then verify all four keys and rejection cases plus unrelated-default equivalence.
Engineer descends from that RED checkpoint. Generated parameter outputs remain the
original closed S2 inventory; status/provenance and old operational versions remain
preserved. This extension does not promote proposed A/C to executable production
sources or authorize seed/reset against any preserved database.

Basis: direct inspection of jsonDefault/parseCatalogue and complete caller trace;
Architect preflight identified an implementation prerequisite, not a new legal rule.
Stop if the four-key validator needs an unsourced schema or another unowned path.
