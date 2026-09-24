# TASK-0009 — relatório corretivo da iteração 3

Papel: Engineer.

F-001…F-006 e F-009 foram implementados contra os sensores finais do Inspector. Os comandos agora
validam payloads, aplicam os bindings A5 dentro de transações tenant-scoped, persistem efeitos e
outbox atomicamente, protegem concorrência por versão/ETag e implementam idempotência durável.

## Resultado focal

- unit: 7/7.
- integration: 611/611.
- e2e domínio: 10/10.
- HTTP: 14/14.
- shared: 407/407; contracts: 46/46; decorators: 966.
- onze hashes Inspector preservados após a implementação.

O ETag de readiness é o bootstrap recuperável do challenge; literal `1` é recusado. A outbox usa
namespace de comando e o registro de idempotência conserva a chave bruta. Os cinco CRUD reads
gerados são restritos a `technical-admin` tenant-scoped; `agency-admin` permanece apenas nos
commands A5 explicitamente autorizados. Ports criptográficos fixture existem somente em
`test|local-sandbox`; produção continua fail-closed enquanto a integração real está `source_pending`.

## Gates do maestro

- `pnpm backend:test:ci`: PASS, exit 0, incluindo provisioning nos três tiers e upgrade 18/18.
- `pnpm check`: PASS, exit 0.
- `pnpm devai:doctor`: PASS.
- evidence verify: PASS, head `eae4e44dd145eea6c970dfc0b39b91e48751e6321a472ac8f89dd744b5b11c72`.
- composições TASK-0007…0009 e hashes congelados: PASS.
- append-only final: SELECT/INSERT true; UPDATE/DELETE false em receipt e revocation.
- `git diff --check`: PASS.
