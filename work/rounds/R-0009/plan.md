# R-0009 — frente `portal-backend` (WP-P0…P3 do PORTAL: identidade federada, modelo, rotas, projeções e contratos)

**Status:** planejado em 2026-09-14 pelo Architect; aguarda abertura por um maestro Fable 5.1
(prompt em `prompts/00-maestro.md`). Reviewer: GPT-5.6 Terra via `tools/orchestra/bridge.sh codex`.
**Depende de:** `rait-backend` (R-0007) em `main` (delegações de defesa/indicação/pagamento;
`DetranError`; `check-commands.mjs`). Até lá as rotas delegadas devolvem `SERVICE_UNAVAILABLE` com motivo.
**Janelas previstas:** 3.

## Metas

1. **Identidade federada** (WP-P0, ADR-0019 §1): ADR curta "gov.br via Cognito" (número livre
   seguinte; previsto ADR-0024): IdP OIDC gov.br no pool do cidadão; selo → `assurance_level`
   (bronze = simples; **prata ou ouro = avançada**, steering H.50, decisão do Owner contra a PN
   001/2025 — registrar o risco na ADR); qualificada por e-Notariado/ICP; CPF como `sub` de
   negócio; grupo `CIDADAO`; representação como atributo. Configuração do pool em `backend/app`
   (`detran-runtime.ts`, perfis `test`/`local` com IdP simulado); guarda que rejeita claim ausente
   (`PORTAL.ASSURANCE_NOT_VERIFIED`, fail-closed).
2. **Modelo** (WP-P1): `BP-PORTAL-IDENTITY-001` (`subject`, `representation`, `act_level_policy`
   com a matriz do Decreto 10.543 + PN 001/2025 como **dados** com fonte, `entitlement`),
   `BP-PORTAL-REQUESTS-001` (`request` máquina [WF-PORTAL-001] com 13 estados fixos em código —
   OD-P13, `request_draft`, `request_attachment`, `protocol`, `consequence_ack`, `evaluation`),
   `BP-PORTAL-INBOX-001` (`inbox_item`, `acknowledgement_evidence`, `sne_enrollment`,
   `push_subscription`), `BP-PORTAL-CITIZEN-SERVICE-001` (`manifestation` [WF-PORTAL-004],
   `manifestation_extension`, `service_catalog` com 11 campos e check de motivo, `brand_profile`,
   `public_hostname` — os dois últimos sem RLS por desenho, listados na exceção de `verify:rls-ddl`);
   **reconciliar com `backend/domains/portal/complaints`** (`BP-PORTAL-COMPLAINTS-001`, DDL 60):
   a TASK-0002 decide absorver em `citizen-service` ou manter, sem duplicar a manifestação. DDL
   `61-portal-identity.sql`, `62-portal-requests.sql`, `63-portal-inbox.sql`, `64-portal-citizen-service.sql`.
   Projeções (ADR-0020): `portal.infraction_view`, `portal.process_timeline`, `portal.points_view`,
   `portal.crash_view` (BOAT; projetor real em R-0010), `portal.exam_view` (PEC). Timers `owner='portal'`
   (`T-PROTOCOLO`, `T-OUV-RESPOSTA` 30+30, `T-OUV-INFO` 20+20, `T-AVAL-CONVITE`, `T-SNE-CIENCIA` 30,
   `T-LGPD-ACESSO` parâmetro `privacy.public_regime_days` `source_pending`). Fixtures: um cidadão por
   nível, uma representação, um pedido por estado, uma manifestação por estado, catálogo 9/2/4.
3. **Rotas** (WP-P2, `portal-route-contract.md` §2–§10): controladores `/v1/portal/*`; serviço de
   delegação em uma transação (protocolo → comando do domínio dono → `EM_ANDAMENTO_NO_ORGAO`;
   falha após protocolo vira pendência interna); projetores das cinco projeções por eventos
   (idempotentes em `event.id`); evidência de ciência SNE (`NOTIFICACAO_CIENCIA`); adesão/cancelamento
   SNE via `inf/notification`; leituras nacionais cacheadas com `cachedAt` (TTL 15 min, H.54);
   SSE `/v1/portal/stream`; regras `portal:*` para `CIDADAO` em `policy.ts`; flags
   `portal.card_payment=off` (DT-031) e desconto 40 % (H.53).
4. **Contratos** (WP-P3): `docs/framework/contracts/BP-PORTAL-*.commands.openapi.json` com corpos
   por `serviceKey` (§5.1), 4xx do `portal-error-catalog.md`, `Idempotency-Key` determinística
   documentada, exemplos com fixtures; `docs/framework/schemas/portal-request-draft.schema.json` por ato.
5. Documentação: `portal-build-pack.md` §WP-P0…P3 executados; ADR-0019 "Implementação: PR #n";
   `portal-route-contract.md` §11 conferido; backlog.

## Tarefas

| Tarefa    | Papel        | Perfil              | Modelo/esforço | Lock                                                           | Depende de           | Entrega                                                                                                                                                |
| --------- | ------------ | ------------------- | -------------- | -------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TASK-0001 | Architect    | architect-blueprint | Opus / alto    | `MOD-adr`, `MOD-app-runtime-auth`                              | —                    | ADR gov.br via Cognito; contrato da guarda; matriz selo → nível; critérios                                                                             |
| TASK-0002 | Architect    | architect-blueprint | Opus / alto    | `MOD-bp-portal-*`, `MOD-ddl-61-64`, `MOD-ddl-14`               | TASK-0001            | quatro blueprints + projeções + timers `owner='portal'`; decisão sobre `portal/complaints`; critérios                                                  |
| TASK-0003 | Inspector    | inspector-tests     | Sonnet / médio | `MOD-portal-tests`                                             | TASK-0002            | testes: guarda fail-closed (e2e com IdP simulado), matriz de nível por ato, máquina de 13 estados, RLS, seeds                                          |
| TASK-0004 | Engineer     | engineer-backend    | Sonnet / médio | `MOD-portal-modules`, `MOD-app-module`, `MOD-app-runtime-auth` | TASK-0003            | módulos gerados, pool/guarda, fixtures; testes verdes                                                                                                  |
| TASK-0005 | Inspector    | inspector-tests     | Opus / alto    | `MOD-portal-routes-tests`                                      | TASK-0002            | testes de rotas: vínculo (404), idempotência com corpo diferente, protocolo antes de validação, replay das projeções, `SERVICE_UNAVAILABLE` com motivo |
| TASK-0006 | Engineer     | engineer-backend    | Opus / médio   | `MOD-portal-handwritten`, `MOD-shared-policy`                  | TASK-0004, TASK-0005 | controladores, delegação, projetores, SNE, cache, SSE, regras `portal:*`; testes verdes                                                                |
| TASK-0007 | Engineer     | engineer-backend    | Sonnet / baixo | `MOD-contracts-commands`, `MOD-schemas`                        | TASK-0006            | contratos de comando + schema de rascunho; `contracts:check`/`contracts:clients` verdes                                                                |
| TASK-0008 | Owner deleg. | transcriber-docs    | Sonnet / baixo | `MOD-docs`                                                     | TASK-0007            | build pack, ADR-0019, backlog                                                                                                                          |

CTG-0001 = 0001…0004 (identidade + modelo); CTG-0002 = 0005…0007 (rotas + contratos). Um PR por CTG.

## Critérios de aceitação (comandos → resultado)

- `pnpm blueprints:check`, `pnpm contracts:check`, `pnpm contracts:clients` → OK.
- `pnpm verify:rls-ddl` → OK (exceções `brand_profile`/`public_hostname` declaradas no verificador,
  nunca removendo a verificação das demais); `pnpm backend:rls-smoke` → OK.
- `DB_NAME=detran_r9 DB_PASSWORD=postgres bash backend/database/apply.sh --full` + `seed.sh` duas vezes → OK.
- `pnpm backend:test:e2e` → login com IdP simulado e `PORTAL.ASSURANCE_NOT_VERIFIED` fail-closed verdes.
- `pnpm --filter @detran/shared test` → `policy.spec.ts` cobre `portal:*`; `policy-routes.spec.ts` verde.
- `pnpm backend:test:ci`, `pnpm check` → verdes; `node tools/docs/kb/check.mjs` → 521/446.

## Mapa entregável → definições

| Entregável | Definição                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| identidade | ADR-0019 §1; [WF-PORTAL-002]; steering H.49/H.50/H.51; [REF-DETRANAM-PORTARIA-NORMATIVA-001-2025]; OD-P01/P02 |
| modelo     | `portal-build-pack.md` §WP-P1; [WF-PORTAL-001…004]; `portal-route-contract.md` §11 (entidades da origem)      |
| rotas      | `portal-route-contract.md` §2–§10; `portal-error-catalog.md`; ADR-0016/0017/0018; comandos do RAIT (R-0007)   |
| projeções  | ADR-0020; `dashboard-route-contract.md` §6 (mesmo padrão `*.projection.ts`)                                   |
| parâmetros | `parameter-catalogue.md` (`portal.*`, `privacy.public_regime_days`, `collection.discount_40_outside_sne`)     |
| payloads   | `portal-route-contract.md` §5.1; `rait-build-pack.md` §0                                                      |

## Riscos

- `portal/complaints` já existe (DDL 60, `BP-PORTAL-COMPLAINTS-001`): decidir na TASK-0002; nunca
  duas tabelas para a mesma manifestação.
- Federação gov.br real depende de credenciais institucionais: nesta frente só IdP simulado nos
  perfis `test`/`local`; a homologação é R-0014 (WP-P6).
- `policy.ts` lock com `boat-backend` (R-0010): blocos `portal:*` × `est:*`; rebase da segunda.

## Bloqueios

(nenhum)

## Retomada

(vazio)

## Leitura

(preenchido pelo maestro)
