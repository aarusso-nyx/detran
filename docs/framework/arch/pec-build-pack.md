---
id: ARCH-PEC-BUILD-PACK
title: Pacote de construção PEC — contratos, fixtures e consoles
status: draft
apps: [pec, portal]
updated: 2026-09-29
---

# Pacote de construção PEC

Índice canônico da R-0031, conforme ADR-0034, [IU-PEC-001] e
`work/rounds/R-0031/plan.md`. A autorização de 2026-09-29 (A-C2-13)
limita esta sessão às ondas O1–O8 sobre `origin/main`. O manual PEC dos
consoles e a superfície C são de R-0032. Os artefatos de produto em
`docs/framework/product/` prevalecem sobre este índice.

## WPs

| WP / ondas                  | Entrega                                                                                                                                                                                 | Verificação de fechamento                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| WP-1 / O1–O3, CTG-0001      | Manifesto das 19 telas A/B, 82 operações manuscritas existentes em contratos `BP-CH-*.commands.openapi.json`, catálogo `PEC.*`, caracterização e checker bidirecional, clientes gerados | `pnpm contracts:check`, `pnpm contracts:test`; publicar branch cedo para R-0032 |
| WP-2 / O4–O6, CTG-0002      | Personas e fixtures sintéticas, integração Postgres/RLS dos 17 módulos `ch`, tiers de CI                                                                                                | Seed duas vezes, `pnpm backend:test:integration` e testes de cada pacote        |
| WP-3 / O5–O8, CTG-0003      | Arquitetura das 19 telas, fichas `IU-PEC-C/R`, i18n `pec.`, parâmetros verificados sem valor inventado                                                                                  | Gates de produto, parâmetros e formatação indicados por tarefa                  |
| WP-4 / retomada após R-0024 | Consoles A e B em `apps/pec/web`, slot local e manifesto de disponibilidade                                                                                                             | Gates próprios de O9–O14; fora da autorização desta sessão                      |

Todo comando existente fica ligado a `x-blueprint` e ao controlador de
origem. Os 17 OpenAPI CRUDs gerados são preservados e só o gerador oficial
pode modificá-los. `route-manifest.md` separa as operações `ch` consumidas
por R-0032. Nenhum cliente chama RENACH: o backend usa
`packages/senatran-adapter`. Captura biométrica passa por porta; a
implementação de homologação é visivelmente rotulada e restrita ao perfil.
Assinatura sem provedor falha fechada. Todo núcleo clínico é sensível
(RN-PEC-150/151).

Nos contratos de composição em `backend/app/src/pec-*.controller.ts`,
`x-blueprint` identifica o agrupamento de versionamento existente, não
atribui a implementação ao módulo gerado. `x-source-controller` aponta
o controlador real. Ações de callback RENACH/toxicologia são exclusivas do
ator de integração autenticado, nunca chamadas pelo navegador.

## Superfície C

P-01…P-07 ficam no Portal sob o plano completo de
`work/rounds/R-0032/plan.md` (OD-PW-001). R-0031 entrega contratos e
fixtures para esse consumidor. A ponte `CIDADAO`→`CANDIDATO`, a ciência
do resultado, os direitos do titular e as rotas próprias do Portal são
decisões/implementações de R-0032. O titular lê o próprio dossiê sem
máscara; `SUPORTE` vê dados mascarados (RN-PEC-153). Nenhuma tela permite
escolher clínica/perito: DT-021 adotou P2, região/data e sorteio no servidor.
`CONDICIONADO` e `PENDENTE` não são resultados expostos ao candidato;
as taxonomias médica e psicológica permanecem distintas.

## Questões abertas

| ID        | Estado / decisão                                                                          | Padrão até decisão ou consequência                                                                                                                                                         |
| --------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| OD-PW-001 | Decidida pelo Owner em 2026-09-26: P-01…P-07 em R-0032                                    | Este pacote fornece apenas contratos/fixtures; OD-R32-001 decide identidade                                                                                                                |
| OD-PW-002 | Pendente: alcance do bloqueio de ADR-0034 §5 após DT-021/022/023 respondidas com resíduos | P-01 forma final, R-07, P-07 e rótulos residuais de C-12 em `bloqueado_por_decisao`, com id DT e resíduo; Anexo XV e aceitação RENACH `source_pending`                                     |
| OD-PW-003 | Pendente: stream para C-01/C-11                                                           | Polling do padrão, sem stream novo                                                                                                                                                         |
| OD-PW-004 | Pendente: namespace i18n `pec.`                                                           | Proposta apenas para i18n; nenhuma chave de parâmetro `pec.*` sem autorização                                                                                                              |
| OD-PW-005 | Pendente: R-05 fora dos UC atuais                                                         | Ler e usar comandos existentes de `clinical-network`; ação sem UC `bloqueado_por_decisao`                                                                                                  |
| OD-PW-006 | Decidida pelo Owner em 2026-09-29 (A-R31-01)                                              | Inspector TASK-0015 atualiza primeiro C-01-09 e restringe o regex em `tools/stack/revision.test.mjs` ao nome do slot; Engineer TASK-0017 acrescenta o slot PEC depois, sem alterar o teste |
| OD-PW-007 | Decidida pelo Owner em 2026-09-29                                                         | Diferir envelopes `PEC.*` até caracterização HTTP viável; contratos, checker e clientes já publicados preservam o comportamento atual. |

## Bloqueios e limites

- C-11 não tem consulta HTTP de ACK/erro montada. `transmission:read`
  existe na política, mas os controladores expõem apenas despacho e
  callbacks; nenhuma rota é inventada por este pacote.
- C-07 cita Médico/Psicólogo no inventário, mas a política atual concede
  `feedback-schedule/complete` apenas a Psicólogo. Não ampliar o papel
  por suposição.
- R-06 cita DPO no inventário; conferir o acesso efetivo a eventos de
  auditoria antes da tela, sem alargar `policy.ts` nesta sessão.
- C-11 cita Admin Clínica no inventário; `ch:transmission:read/dispatch`
  não lhe é concedido hoje. Não ampliar a política por inferência.
- Os adaptadores de assinatura em `clinical-reports` e `juntas` são
  fronteira de R-0022. Qualquer erro de catálogo que exija mudá-los fica
  bloqueado para depois da migração.
- Eliminação de prontuário permanece desabilitada até prova PAdES-LTA
  (PEC-RETENTION-001). Prazos, códigos e estados sem fonte são
  `source_pending`.
