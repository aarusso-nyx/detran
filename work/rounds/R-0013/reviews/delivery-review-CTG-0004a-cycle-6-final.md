# Delivery review — CTG-0004a / ciclo 6 final

## Veredito

**FAIL** — três `high` e uma regressão `medium`.

Digest `ac6bb9d2…1b235f`, `29/29 PASS` e diff-check foram confirmados pelo REVIEWER somente leitura.

- F001: recuperação bloqueada perde principal/tenant e não alcança `/device-blocked` com guardas reais.
- F004: consumidor exige contexto não persistido pelo produtor; draft preexistente impede finalização.
- F009: sensores fabricam contexto blocked e queue enriquecida, evitando os fluxos reais.
- F006: guard reabriu decisão própria pre-shift, contrariando o serviço decisor único.

F008 foi fechado; F002/F003/F005/F007 permanecem aceitos.
