# S2 Engineer — pure risk and four-key parser

Engineer, Constitution Article7. Runtime descends from the independent RED
checkpoint27d6ef7d. Only rait-risk.ts, its public index and parser.mjs changed;
no test, contract, source policy, generation, DDL or database change.

The pure evaluator validates one operation instant/civil day/timezone, exactly four
unique explicit applicability records, complete source-backed ordered clock stages,
valid civil dates and matching final ceilings. It chooses the reached stage and
canonical worst flag, retains explicit all-NA null, copies source versions without
interpreting opaque encoding, and does not mutate inputs or read the wall clock.
Threshold dates remain resolved inputs, with no new elapsed-age deadline engine.
The parser validates exact frozen A/B/C/D schemas and literals only at their exact
four keys. Every unrelated key and legal-bases parser retains its prior behavior.

Validation: all112 deadlines unit tests PASS (89new risk +23existing); deadlines
typecheck and three-file formatting PASS. Parameter suite69PASS/1FAIL/0skip;
all31 newly behavioral RED S2-R2 cases now PASS. The remaining failure is the
legacy legal-bases preservation fixture at generator.test.mjs:262, which injects
rait.ladder.B as the forbidden text50/75/90%. Rejecting it is required by S2-R2.
The parent/Inspector received a source-backed correction recommendation; Engineer
has not edited tests or added a permissive runtime exception. Full parameter
GREEN is explicitly not claimed. See JSON and preserved sanitized execution logs.

No DB/full backend/root gates were run in this narrowly authorized task. No
production source qualification, S2 completion, readiness or merge claim follows.
