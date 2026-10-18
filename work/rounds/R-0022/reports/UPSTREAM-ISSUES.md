# R-0022 — pedidos de 1.5.x ao STYNX em GitHub issues

Papel: Architect. Autorização do Owner (2026-09-29, `AUTHORIZATION.md` Adenda B4): "Leve esses pedidos
ao STYNX através de github issues no repositório STYNX detalhados, seguindo o modelo adotado". Modelo:
índice #289 e issues de área #305/#306/#307 de R-0021 (`work/rounds/R-0021/reports/UPSTREAM-ISSUES.md`).
Nenhum código, branch ou release do STYNX foi tocado.

| Issue | Conteúdo | IDs |
| --- | --- | --- |
| [#319](https://github.com/stynx-nyx/stynx/issues/319) | Índice: lacunas da 1.5.0 final e efeito em cada CTG de R-0022 | — |
| [#316](https://github.com/stynx-nyx/stynx/issues/316) | Outbox: corte de tabela customizada, leitura de entrega/ledger/lista/saúde, retry de operador, despacho/ACK sem owner no caminho de requisição (via adicional à decisão da #306), roteamento, migração separável, contrato de V-01…V-06 | UPS-OBX-03…09 |
| [#317](https://github.com/stynx-nyx/stynx/issues/317) | Offline-sync: D-01…D-09 (reserva idempotente, `pending`, `manual_review`, campos de envelope, contexto do applier, `payload_hash` configurável, listagens), migração separável, contrato de V-01…V-15 | UPS-OFS-05…14 |
| [#318](https://github.com/stynx-nyx/stynx/issues/318) | Assinatura: LTA/PAdES-B-LTA no verificador `stynx-cms`, QUALIFIED declarativo por OIDs, vários perfis por tenant/UF/espécie num módulo | UPS-SIG-05…07 |

Rascunhos por agente Architect (Opus 5.5) a partir de `contracts/CTG-0006/0008/0009.md`, dos `.d.ts`/`.js`
publicados de 1.5.0 e das decisões do Owner; revisão e publicação pelo maestro. Corpos publicados
copiados em `reports/upstream-issues/`. Pontos abertos declarados nas issues: resultados de V-nn
dependem de TASK-0005; `usage_mode` (UPS-OFS-12) depende da leitura A-3; valores normativos de
OD-R22-08 pendentes.

## Adenda B12

Autorização do Owner (2026-09-29, `AUTHORIZATION.md` Adenda B12): OD-R22-43 (b) e OD-R22-44 (a) —
pedido de papel SQL de aplicação configurável e de destino por `entity` na outbox; OD-R22-46 (a) —
pedido consolidado do cliente SSE Angular. Fonte: spec C-0002 §8.2 (V-02, V-07), `contracts/CTG-0005.md`
e `contracts/CTG-0008.md`, com o `.js`/`.mjs` publicado de 1.5.0 lido nos pontos citados. Rascunhos
por agente Architect; revisão e publicação pelo maestro.

| Issue       | Conteúdo                                                                                                                                                              | IDs                    | Corpo publicado                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------- |
| [#320](https://github.com/stynx-nyx/stynx/issues/320)  | Outbox: papel SQL de aplicação configurável (literal `stynx_app` em `outbox` e `data`, políticas 0021) e destino por `entity` (evento sem destino não vira entrega nem bloqueia o agregado); complementa UPS-OBX-07/08 da #316 | UPS-OBX-10…11          | `upstream-issues/stynx-320.md` |
| [#321](https://github.com/stynx-nyx/stynx/issues/321)  | Cliente SSE Angular: reabertura ao entrar em _polling_ configurável, fecho pelo servidor como fim de fluxo, comentário como atividade de `live`, `resync$`, último erro e atraso lido do corpo | UPS-NGSSE-11…15        | `upstream-issues/stynx-321.md`    |
