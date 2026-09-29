# Cédula 09 — PEC web: namespace i18n

## OD-PW-004 — namespace `pec.`

**Pergunta:** o namespace `pec.` pode ser aceito exclusivamente no catálogo de
i18n do console PEC?

**Decisão do Owner (2026-09-29):** **sim, autorizada formalmente**. O
namespace é limitado a `pec.screens`, `pec.forms`, `pec.states`, `pec.errors`
e `pec.legal`, todos no catálogo de i18n. A decisão não cria uma superfície de
parâmetros, não autoriza chave `pec.*` em `ops.parameter` e não altera a
allowlist de chaves de nenhum heading do catálogo.

**Efeito:** o verificador aceita esses namespaces i18n e continua rejeitando
literais `pec.*` fora deles ou usados como chave de parâmetro.
