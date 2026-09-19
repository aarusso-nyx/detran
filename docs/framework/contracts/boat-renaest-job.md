---
id: CONTRACT-BOAT-RENAEST-JOB
title: Contrato de execução do job BOAT RENAEST
status: draft
apps: [boat]
updated: 2026-09-16
---

# Contrato de execução de `T-BOAT-TRANSM`

## 1. Finalidade e decisão do Owner

`T-BOAT-TRANSM` é o executor operacional mensal, de `owner='sinistro'`, das
transmissões BOAT pendentes. Ele invoca somente
`BoatRenaestTransmissionService.runOnce()` para um tenant por vez. O serviço já
faz o claim de `integration.outbox` com `SKIP LOCKED`, exige o parâmetro
`est.renaest.transmit_period` e usa exclusivamente `RenaestPort`.

O Owner aprovou OD-B14/OD-B15 nestes limites: conta técnica auditável por
tenant, descoberta restrita de tenants e vínculos ativos e execução no dia 1
às 12h no fuso de `auth.tenants.timezone`. Uma chamada manual a `runOnce` não
satisfaz C-2-08.

Este contrato não escolhe `layout_version` nacional. A proposta `mock` continua
`source_pending` sob OD-B08/DT-061 e permanece confinada ao adapter/mock.

## 2. Superfícies e autoridade

| Superfície                       | Responsabilidade permitida                                                                                 | Proibições                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Descoberta administrativa        | Produz somente `{ tenantId, actorId, timezone }` a partir de `auth.tenants` e da identidade técnica ativa. | Não lê/escreve `est.*` ou `integration.*`; não chama `RenaestPort`; não cria tenant fictício. |
| Orquestrador no único deployable | Calcula a âncora, descobre alvo elegível, liga o contexto e chama uma vez `runOnce`.                       | Não substitui a outbox, não chama o sistema nacional e não executa domínio sem RLS.           |
| Processamento de domínio         | `runOnce` seleciona, reclama e altera apenas as linhas daquele tenant em `integration.outbox` e `est.*`.   | Não usa owner-role, varredura intertenant ou `withSystemContext` como atalho de RLS.          |

`auth.tenants` é a fonte canônica. Um alvo é elegível somente quando
`state = 'active'` e `is_active = true`, a conta técnica em
`jobs.boat_renaest_identity` está ativa e o vínculo da conta em
`auth.memberships` também está ativo para o mesmo tenant. A única enumeração
permitida é `jobs.discover_active_boat_renaest_tenants()`, que retorna somente
`tenant_id`, `actor_id` e `timezone`.

A função tem privilégio administrativo apenas para a leitura mínima de
`auth.*` e `jobs.*`. Ela não possui nem concede acesso a `est.*` ou
`integration.*`. O DDL não semeia conta, ator ou tenant de produção.

## 3. Identidade, provisionamento e `RequestContext`

Antes de cada chamada, o orquestrador obtém um `actorId` técnico auditável e
associado ao mesmo `tenantId` da descoberta. O Engineer monta estas portas:

```ts
interface BoatRenaestTenantDiscovery {
  listEligible(): Promise<readonly BoatRenaestExecutionTarget[]>;
}

interface BoatRenaestExecutionTarget {
  tenantId: string;
  actorId: string;
  timezone: string;
}

interface BoatRenaestScheduler {
  runDue(now: Date): Promise<void>;
}
```

Para cada alvo devido, a chamada é conceitualmente:

```ts
requestContextMutator.runWithRequestContext(
  { requestId, tenantId, actorId, startedAt },
  () => boatRenaestTransmissionService.runOnce(),
);
```

O orquestrador confere que o contexto ativo contém exatamente o par
`tenantId`/`actorId` descoberto antes de chamar o serviço. A transação aberta
por `withTenantContext` deve usar `role_app_backend` e RLS. Ausência,
divergência, revogação ou expiração da identidade encerra o alvo antes de
qualquer consulta a `est.*` ou `integration.outbox`.

O provisionamento e a revogação passam exclusivamente por
`jobs.provision_boat_renaest_identity()` e
`jobs.revoke_boat_renaest_identity()`. Ambas exigem vínculo ativo do
administrador e da conta técnica no tenant, e gravam a trilha imutável
`jobs.boat_renaest_identity_event`. O DDL recusa DML direto do papel da
aplicação sobre a identidade e seus eventos. Ele também não concede `EXECUTE`
dessas funções a `role_app_backend`: vínculo ativo não é prova de autorização
administrativa, e as fontes não oferecem um ator administrativo confiável no
banco ou no `RequestContext` para autenticar os parâmetros recebidos.

Telemetria estruturada inclui `requestId`, `tenantId`, `actorId`, resultado e
falha. A execução mensal é evidenciada por `jobs.boat_renaest_execution`; a
evidência de domínio continua nos `delivery_attempt`, `integration.outbox`,
submissão RENAEST e eventos duráveis sob o contexto do tenant.

## 4. Calendário, DST, recuperação e idempotência

O calendário é o primeiro dia de cada mês, às `12:00:00`, no fuso IANA de
`auth.tenants.timezone`. Ele aceita somente o valor vigente
`est.renaest.transmit_period=monthly`. Fuso ausente/inválido, parâmetro ausente
ou valor diferente de `monthly` desabilita o alvo e registra a causa; não há
fallback.

A conversão da âncora civil para instante é determinística: se `12:00` for
ambíguo por DST, usa a ocorrência posterior; se inexistente, usa o primeiro
instante válido após a lacuna. O orquestrador programa um único disparo para a
próxima âncora e o recalcula após cada conclusão ou reinicialização; não usa
cron nem intervalo de polling. Após reinicialização, uma âncora do mês corrente
já passada é recuperada uma vez se não houver conclusão registrada.

O ledger possui chave única `(tenant_id, calendar_month)` e claim transacional.
Somente o primeiro processo marca a execução como `processing`; uma execução
`completed` nunca é reaberta. Recuperação de queda disputa o mesmo claim. A
proteção de cada item nacional permanece composta por `SKIP LOCKED`, transição
da outbox, `idempotency_key`, `delivery_attempt` e transições condicionais do
BOAT. O orquestrador não cria fila paralela nem retry próprio: a outbox mantém
os códigos BOAT e a disponibilidade para reprocessamento.

Falha de descoberta, identidade, contexto, parâmetro ou porta RENAEST encerra
apenas aquele alvo, é registrada no ledger e não muda `FECHADO`, `INTEGRADO` ou
o espelho por conta própria.

## 5. Limite com `@stynx-nyx/jobs`

A implementação lida do pacote STYNX não é uma composição admissível para o
handler BOAT. `JobsRepository.materialize()` cria a linha de job sem propagar
`schedules.created_by` para `jobs.jobs.actor_id`; `executeHandler()` só liga
`withRequestContext` quando `job.actorId` existe. A schedule materializada
chega, portanto, sem a identidade exigida por §3. O repositório e worker também
envolvem claim, execução e atualização em `withSystemContext`/transações
owner-role, e as fontes permitidas não provam que isso restaure a conexão de
aplicação para SQL de domínio.

STYNX jobs pode servir apenas como substrato de controle `jobs.*` após revisão
específica. Ele não pode chamar `runOnce` até publicar e testar a propagação de
`tenantId`/`actorId` e provar que o handler abre `est.*` e
`integration.outbox` como `role_app_backend` com RLS. Até essa prova, o
Engineer monta o orquestrador dedicado no `AppModule`, não um handler de
`StynxJobsModule`.

O DDL `75-boat-renaest-job.sql` cria o substrato próprio `jobs`: identidade
técnica auditável, descoberta restrita, ledger e RLS forçado. O único privilégio
administrativo é interno às funções de controle; processamento de domínio é
sempre `role_app_backend` sob RLS.

## 6. Testes exigidos ao Inspector

1. Descoberta devolve apenas tenants `active`/`is_active` com identidade e
   vínculo ativos; tenant suspenso, revogado ou sem identidade não chama
   `runOnce`.
2. Provisionamento/revogação exige vínculos ativos e grava evento auditável;
   DML direto de identidade e eventos pelo papel da aplicação falha.
3. A âncora ocorre no dia 1 às 12h no fuso do tenant, inclusive nos casos DST
   definidos em §4; parâmetro inválido não consulta a outbox.
4. Para dois tenants, cada chamada recebe o par de contexto correto; consultas
   e mutações em `est.*`/`integration.outbox` não atravessam RLS.
5. Reinicialização e concorrência disputam atomicamente o ledger mensal;
   `SKIP LOCKED`, idempotency key e recibo preservam uma única conclusão.
6. Receipt com protocolo mantém C-2-05; indisponibilidade e rejeição mantêm
   C-2-06 e o retry da outbox.
7. O bootstrap do deployable registra o orquestrador; `runOnce` isolado não é
   prova de job operacional.
8. Um handler STYNX sem `actorId`, ou cujo SQL de domínio corra como owner,
   falha. Uma adaptação futura prova papel efetivo e RLS, não apenas contexto em
   memória.

## 7. Decisões e bloqueio remanescente

| Decisão                                     | Limite aprovado                                                                                                               | Estado                                                                                                            |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| OD-B14 — descoberta e identidade por tenant | Conta técnica por tenant, provisionamento/revogação auditáveis, descoberta mínima de tenants e vínculos ativos.               | Aprovada pelo Owner; DDL 75 materializa o controle, mas não o expõe sem porta autorizada.                         |
| OD-B15 — âncora mensal                      | Dia 1 às 12h no fuso `auth.tenants.timezone`; regra DST em §4.                                                                | Aprovada pelo Owner; disparo único recalculado.                                                                   |
| Prova de adaptação STYNX jobs               | Propagação de identidade para schedule materializada e separação comprovada entre controle `jobs.*` e SQL de domínio app/RLS. | Bloqueio remanescente: `StynxJobsModule` não dispara BOAT.                                                        |
| Autorização da porta administrativa         | Papel autorizado e fonte confiável do ator administrativo no banco/request context.                                           | Bloqueio remanescente: nenhuma função `SECURITY DEFINER` recebe `EXECUTE`; membership ativa sozinha não autoriza. |

O Engineer monta a porta administrativa, orquestrador dedicado e registro no
`AppModule` somente após a definição dessa porta autorizada. Nenhuma conta
técnica real é criada por esta tarefa.
