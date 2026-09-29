# R-0022 — autorização do Owner

status: active

GRANTED — representação para o runtime DEVAI 1.5.6 da autorização expressa do Owner registrada
abaixo. Estes marcadores não ampliam o escopo do `plan.md` nem alteram as adendas A1, A-C2-11,
A-C2-12 e A-C2-13.

Papel: Architect (registro no bootstrap pelo maestro). Fonte: prompt de abertura do Owner,
colado na sessão do maestro Opus 5.5 (Claude Code) em **2026-09-29** (America/Sao_Paulo):
"O Owner autoriza a abertura desta rodada com este prompt em 2026-09-29. Registre essa autorização
em `work/rounds/R-0022/AUTHORIZATION.md` no bootstrap."

## Escopo autorizado

- Abrir e executar R-0022 `stynx-sse-tenancy` inteira, conforme `work/rounds/R-0022/plan.md` e
  `work/rounds/R-0022/prompts/00-maestro.md` de `origin/main`, com §Execução OD-C2-005 (branch
  única `orchestra/stynx-sse-tenancy`, ondas paralelas, um PR no fim) e §Adendas A1 (migrações
  integrais de assinatura, outbox e offline-sync recebidas de R-0021) e A-C2-11.
- **Adenda A-C2-13 (Owner, 2026-09-29), que prevalece:** STYNX 1.5.0 final publicado (S-1.5
  encerrada, STYNX #308/#309); R-0021 fechada (PC-0019); pin = maior 1.5.x final publicada no
  bootstrap, exata, pela fonte única `tools/stynx-version.json` (1.5.2 adotada se sair antes da
  onda do pin); conformidade §7 da especificação conferida contra a versão fixada, MUST ausente →
  checkpoint do CTG consumidor (OD-R22-02); R-0020 parada não bloqueia esta rodada; CI,
  `.devai/config` e `record/` são locks partilhados por merge; nunca editar arquivos de PR aberto
  da R-0020; publicar cedo, sem PR (`git push`), a onda do pin e a do SSE Angular.
- Fim da rodada (C-0002 §12): CI local completo; uma delivery-review do diff inteiro; um PR, com
  merge só com CI verde, PASS do reviewer e pin 1.5.x final; publicação (evidência,
  `audit observe`, `round close`, `round seal`) pelo PR de publicação da A-C2-12.

## Limites que permanecem

- Nenhuma escrita, release ou execução no repositório STYNX; nenhuma integração externa real.
- Critérios de aceitação imutáveis; nenhuma dispensa em tenancy/RLS/SSE; nenhum `--force`;
  nenhuma edição de arquivo gerado.
- Reviewer da outra família (`codex`, Sol 6 = `gpt-6-sol`), nível grande, pela ponte
  `tools/orchestra/bridge.sh`; workers da família do maestro (`claude-opus-5-5`,
  `claude-sonnet-5`).
- Bancos descartáveis exclusivos desta rodada; nunca bancos de outra frente.

## Adenda B1 — prompt-review ciclo 1 FAIL tratado como corrigível (Owner, 2026-09-29)

Pergunta do maestro, depois de `reviews/prompt-review-1.json` (Sol 6, FAIL, 17 achados `high`):
tratar o FAIL como corrigível, aplicar as 17 correções e submeter o ciclo 2 restrito a elas, com no
máximo 2 ciclos. Resposta literal do Owner: **"Sim, aplique as 17 correções e submeto o ciclo 2,
restrito a elas, com no máximo 2 ciclos?"** — lida como autorização. Não dispensa PASS: workers só
com PASS; FAIL ou REVIEW no último ciclo → parada e novo relato ao Owner.

## Adenda B2/B3 — hotfix e decisões de ODs (Owner, 2026-09-29)

- **B2:** "Corrija em PR próprio contra main." → PR #159 (hotfix fora da rodada).
- **B3, respostas literais do Owner:** "Item 2. SSE - Aprovo as duas recomendações para OD-R22-04 3
  OD-R22-05." · "15. Ok" · "16. autorizo uma transferência DETRAN idempotente como exceção explícita
  à A1." · "outras: adote as recomendações." A leitura do maestro: "outras" abrange todas as ODs
  OD-R22-01…36 com recomendação apresentada (incluindo OD-R22-02 (a) e OD-R22-13 (a), divergente do
  contrato); ODs sem recomendação continuam pendentes. Transcrição em
  `docs/meta/knowledge-base/open-decisions-rait.md` §C-0002 "R-0022 — decisões do Owner".
- A exceção de OD-R22-16 é única e nominal: não autoriza outro contorno local nem muda a regra de
  consumo de OD-R22-02 para os demais itens.

## Adenda B4 — respostas do Owner de 2026-09-29 (segunda leva)

- **OD-R22-17 e OD-R22-20:** "autorizo a leitura DETRAN somente leitura" — leitura DETRAN somente
  leitura (sob RLS, `security_invoker`) sobre as tabelas publicadas da outbox para estado de entrega,
  ledger, lista e saúde da fila; segunda exceção nominal à A1 item 4, transitória até a 1.5.x.
- **Retry manual da fila RENACH:** "Sim, aceito perder temporariamente o retry manual da fila
  RENACH" — as rotas de retry de operador ficam indisponíveis depois do corte até a 1.5.x.
- **PR #159 (hotfix B2):** "Ok, pode mesclar" — mesclado com CI verde em `c4d5417c`.
- **Issues no STYNX:** "Leve esses pedidos ao STYNX através de github issues no repositório STYNX
  detalhados, seguindo o modelo adotado" — autoriza criar issues em `stynx-nyx/stynx`; não autoriza
  código, branch ou release no STYNX.
- **Nova janela:** "Você está autorizado a abrir uma nova janela quando necessário."
- Pendentes de esclarecimento: OD-R22-08 (matriz proposta), OD-R22-07 (impacto), adenda de critério
  de OD-R22-12, residual OD-P30, resíduos de R-0021.

## Adenda B5 — respostas do Owner de 2026-09-29 (terceira leva)

Respostas literais: "Item 5 - Adotar a denda." · "Item 6 - Manter erros." · "Item 8 - 1.a; 2.b" ·
"Item 1 - (i) checkpoint e pedido à STYNX; (também como github issues em stynx)" ·
"Item 2: OD-R22-07 - APP Grava". Efeitos (transcritos em `open-decisions-rait.md` §C-0002 e em
`plan.md` §Adendas A4):

- **OD-R22-12:** adenda ao critério de aceitação da assinatura adotada (texto em `plan.md` A4).
- **OD-R22-37 (residual OD-P30):** manter 403 `PORTAL.SESSION_TENANT_MISMATCH` e 421
  `PORTAL.TENANT_UNRESOLVED` no caminho anônimo; exceções documentadas a "nunca 401/403".
- **OD-R22-38 (resíduo R-0021, dependências STYNX sem uso):** remover nesta rodada (tarefa nova de
  Engineer depois do pin, com prompt-review).
- **OD-R22-39 (resíduo R-0021, smoke remoto da stack):** encaminhar à R-0020 (sensores), via backlog.
- **OD-R22-40 (LTA clínico × `stynx-cms`, antes OD-R22-08-G):** (i) checkpoint (OD-R22-02) das
  espécies clínicas com LTA e pedido à STYNX, registrado em stynx-nyx/stynx#318 (UPS-SIG-05).
- **OD-R22-07:** o **app** grava em `signed-documents` (escritor único, tenant do contexto,
  verificação antes de gravar).
- Pendente: aprovação da estrutura da matriz de OD-R22-08 (não respondida nesta leva).

## Adenda B6 — conflito com stynx-nyx/stynx#306 e matriz de OD-R22-08 (Owner, 2026-09-29)

Respostas literais: "1. a+b" · "2. Sim, aprovo".

- **OD-R22-41 (conflito #306 × DETRAN ADR-0002 / OD-R22-18):** (a) + (b). (a) O despacho da outbox
  sai do caminho de requisição e roda em job técnico com ator técnico (UPS-JOB publicado em 1.5.0);
  a rota de operador de despacho passa a solicitar o despacho. (b) Emenda estreita à ADR-0002 do
  DETRAN: owner-role admitido **só** para as operações de controle da outbox da plataforma
  (`dispatchEventsDue`, `ackEvent`, `recordUnboundAck`), que não tocam dados de domínio, com tenant
  sempre de contexto confiável (sessão do operador ou HMAC verificado), despacho iniciado por
  operador filtrado ao tenant dele e auditoria. UPS-OBX-06 de stynx-nyx/stynx#316 fica sem objeto.
- **OD-R22-08:** estrutura da matriz de perfis de confiança aprovada (extensão de
  `inf.signature_policy` com revisão/vigência, piso nacional como modelo e recusa — nunca fallback
  —, herança órgão → estado, norma separada do perfil de runtime, fail-closed); valores marcados
  "proposta" validados depois, UF a UF, com `source_ref` e aprovação.

## Adenda B7 — terceira iteração de TASK-0014 (Owner, 2026-09-29)

Resposta literal: "a, autorizo a 3ª iteração". TASK-0014 (caracterização da outbox) recebe uma
terceira iteração, além do `max_iterations` 2, com a leitura ampliada pedida no relatório da
iteração 2, para caracterizar C-08-01, 03, 04, 13 e completar 06, 12 e 16 sobre 1.4.0 antes do pin.
C-08-14/15 seguem pela leitura somente leitura de OD-R22-17 (Adenda B4).

## Adenda B8 — hotfix do escritor clínico e OD-R22-42 (Owner, 2026-09-29)

Resposta literal: "a, hotfix em PR próprio; OD-R22-42 corrigir na TASK-0007".

- **B3 (bloqueio da TASK-0014):** o INSERT em `integration.outbox` de `ReportLifecycleService`
  (`report-lifecycle.service.ts:186` e `persistSignedAddendum`) usa parâmetros sem tipo em
  `jsonb_build_object` e falha no PostgreSQL real → hotfix em PR próprio contra `main` (teste de
  regressão com banco real antes da correção; revisão da outra família; merge com CI verde). Depois,
  a rodada integra `main` e faz a iteração 4 de TASK-0014.
- **OD-R22-42:** `Last-Event-ID` não UUID → 500 com página de pilha nos 4 fluxos SSE: corrigir na
  TASK-0007, com critério C-04 próprio (id malformado tratado como desconhecido, UPS-SSE-04).

## Adenda B9 — política permanente para defeitos de produto achados na rodada (Owner, 2026-09-29)

Resposta literal: "a, hotfix em PR próprio com varredura do repositório e adote sempre essa solução
caso encontre issues similares".

- Telehealth (`ch.billing_item`, parâmetro sem tipo) e demais ocorrências do mesmo padrão: hotfix em PR
  próprio contra `main`, com varredura do repositório.
- **Política permanente desta rodada:** defeito de produto em `main` achado pela caracterização ou pelos
  workers → hotfix em PR próprio contra `main`, com varredura do repositório pelo mesmo padrão, teste de
  regressão vermelho antes da correção (Inspector → Engineer), revisão da outra família e merge com CI
  verde, sem nova consulta ao Owner. Vazamento entre tenants continua sendo parada imediata e relato
  (§7 do prompt do maestro); decisões de produto ou de critério continuam com o Owner.
