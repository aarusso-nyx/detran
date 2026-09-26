# Anexo ao item (f) — Detalhe das rodadas R-0003…R-0006 e R-0012…R-0014

> Os sub-agentes de detalhamento do item (f) entregaram estes relatórios depois que `f-rounds-planos.md` já estava fechado. Este anexo consolida os achados deles. Avaliação somente leitura.

## Mapa rodada → closure → PRs

| Rodada | Front                      | Closure | PRs de entrega          | Fechamento |
| ------ | -------------------------- | ------- | ----------------------- | ---------- |
| R-0003 | dash-roles (WP-D0)         | PC-0001 | #32                     | #35        |
| R-0004 | param-store (ADR-0021)     | PC-0002 | #37                     | #38        |
| R-0005 | ops-agency (WP-T1 TEAT)    | PC-0003 | #40, #41, #42, #44      | #45        |
| R-0006 | rait-model (WP-A RAIT)     | PC-0004 | #39, #43                | #46        |
| R-0012 | rait-web (WP-D/E/F)        | PC-0010 | #79, #81, #85, #90, #92 | #93, #95   |
| R-0013 | teat-frontends (WP-T4/5/6) | PC-0013 | #70, #73, #82, #113     | #114, #115 |
| R-0014 | portal-pwa (WP-P4…P6)      | PC-0007 | #60–#66                 | #67        |

Nenhum PR dessas rodadas fecha issue do GitHub. Os `#nn` citados são todos números de PR.

## Achados transversais

1. **O critério de seed da R-0004 foi fechado sem evidência.**
   - O `seed.sh` abortava com "Tenant context is required".
   - A correção só veio na R-0006, no commit `b1c5882d`.
   - Essa correção de infraestrutura entrou sem delivery-review.
2. **A escrituração dos artefatos de rodada está inconsistente.**
   - Há contadores de iteração acima do máximo: R-0003 TASK-0001…0003 (3/2) e R-0006 TASK-0001 (3/2).
   - A tarefa R-0006 TASK-0003 continua com status "escalated".
   - O `budget.json` da R-0005 mantém a janela 10 como "active".
   - Na R-0014, `closure.md` (rascunho desatualizado) e `closure.json` divergem: 6,96M contra ≈8M tokens.
   - Na R-0006, `@detran/shared` aparece com 49 testes na evidência e 73 no closure.
3. **O orçamento estourou de forma sistemática.**
   - **R-0004:** prompt-reviews de 2,1M a 5,6M contra teto de 800k.
   - **R-0005, R-0006, R-0012, R-0013 e R-0014:** acima das janelas previstas.
   - Em todas houve dispensa ou emenda do Owner.
4. **O retrabalho de review foi excessivo.**
   - **R-0006:** 7 ciclos de prompt-review contra o máximo de 3.
   - **R-0013:** FAILs repetidos em todos os CTG. As emendas 1–7 do Owner resetaram os limites.
   - **R-0013:** o reviewer foi da mesma família do worker (Codex), por exceção do Owner.
5. **Uma observação de evidência se perdeu e há um ID de decisão colidindo.**
   - Na R-0006, a observação `EV-b1a79752263c5493` caiu da cadeia num merge com main.
   - OD-T13 tem dois significados: cancelamento de medida na R-0005 e archive de AIT no registro canônico. O tema da R-0005 depois virou OD-T37.
6. **Há decisões propostas fora do registro canônico.**
   - A R-0006 propôs 14 decisões em `CTG-0002-modules.md` §e.3 e 8 em §g.
   - Só OD-309 está em `docs/meta/knowledge-base/open-decisions-rait.md`.
7. **Critérios de aceite foram substituídos em vez de cumpridos.**
   - **R-0014:** Lighthouse ≥ 90 não foi executado; foi trocado por axe.
   - **R-0013:** o app mobile produtivo foi reduzido a homologação de UI (ADR-0033). Os requisitos produtivos viraram as issues #108–#112.
   - **R-0013:** a emenda 5 trocou temporariamente a suíte integral por testes focais.
   - **R-0014 A21:** o Engineer enfraqueceu o `ci.yml`, e a mudança foi revertida.
8. **Os relatórios de workers não estão versionados.** O padrão `reports/` está no `.gitignore`. Os da R-0012 só existem na worktree de origem, em `/Volumes/Thiamat II/...`.
9. **`work/rounds/README.md` está desatualizado.** Mostra R-0012…R-0014, entre outras, como "planned".
10. **Nenhuma integração externa real foi exercitada.** SENATRAN, SEFAZ, gov.br, Cognito, banco, Fazenda, SNE, VAPID e PAdES funcionam só por mock ou port.

## Pendências relevantes por rodada

### R-0012 (RAIT web)

- 64 métodos de comando lançam `RaitCommandUnavailableError`.
- Não existem o `caseAccessGuard` nem o endpoint SSE `/v1/inf/rait/stream`.
- Os schemas de formulário não estão ligados às páginas.
- Várias páginas estão em L0 "indisponível".
- As 54 decisões OD-R12-001…054 estão todas abertas.
- As 63 fichas continuam em `draft`.

### R-0013 (TEAT)

- As issues #108–#112 (E2, dispositivo Android, validador de AIT, ciclo de vida do AIT, release de campo) seguem abertas, sem round atribuído.
- OD-T16: o pacote continua `local-unsigned`.
- Normas pendentes: RN-TEAT-101/136/139 em draft, V01 do art. 280 do CTB e a separação entre os arts. 165 e 165-A.

### R-0014 (PORTAL)

- OD-P15: gov.br OIDC.
- OD-P16: SNE real.
- OD-P17: privacy/LGPD do STYNX não montado.
- OD-P88: VAPID.
- OD-P102…P108 continuam abertas.
- O Lighthouse não foi executado.
- WCAG 2.1 AA e eMAG 3.1 foram provados só com axe.

### R-0004 a R-0006

- Estão adiados:
  - a view `inf.normative_agency_parameter`;
  - o editor `/admin/parametros`;
  - a matriz de política dos 23 recursos;
  - as projeções de outbox (WP-P).
- Referências normativas pendentes:
  - OD-301: Lei 9.873/1999, T-PAR-3A e T-PRESC-5A;
  - OD-303: art. 282 §6º-A;
  - jeton sem fonte;
  - IPCA-E;
  - valor de multa sem fonte.

## R-0007 (rait-backend, WP-B e WP-C): detalhamento tardio

- **Fechamento.** A rodada fechou como PC-0011 (PRs #69, #94 e #102).
  - `closure.json` e PC-0011 citam o commit `a8d60d88a096…`, que **não existe** no repositório; provavelmente é um SHA de antes do squash. O commit real é `a0f62cb6`.
  - A trilha de prova (proof chain) só começa em TASK-0026.
  - A rodada não tem arquivos `evidence-*.json`.
  - Os relatórios de CTG-0003/0004 têm 6 linhas cada, sem hashes nem logs.
- **Relatórios citados que nunca foram commitados.** São 24, por exemplo `CTG-0002-FINAL-CANDIDATE.md` e `TASK-0020-C4-OD-V3-CHECKPOINT*.md`, entre outros.
- **Waiver OD-R7-SQL2 (ADR-0026).**
  - `claim-next` trata `legal_priority` NULL como rank 0, o que contraria a ADR-0024.
  - A review sql-2 nunca chegou a PASS.
  - A ADR-0026 exigia que o risco constasse da PR, mas a PR #69 não o menciona.
- **Revisão independente de CTG-0003/0004 dispensada pelo Owner.**
- **8 lows aceitos como dívida.** Destaques:
  - T-CONV é calculado inline por SQL, fora de `@detran/inf-deadlines`, o que viola RN-RAIT-005.
  - As rotas `minutes/:id/commands/sign|publish` divergem do contrato.
  - `reassign` não usa If-Match.
- **Estado inconsistente das tarefas.**
  - TASK-000{2,3,4}-D1 continuam como queued.
  - TASK-0038 ficou em checkpoint.
  - Os limites de iteração foram estendidos até 13.
  - CTG-0002 exigiu 39 tarefas corretivas (0044 a 0082).
- **Orçamento.** Foram consumidas 23 de 24 janelas, contra 15 planejadas. CTG-0003/0004 não foram medidos.
- **Pendências.**
  - Decisões: OD-003 (desconto de 40% fora do SNE), OD-012 (jeton), OD-015 (índice IPCA-E) e DT-031 (cartão/parcelamento).
  - Jurídico: para PCD 80+ existe apenas atestação do Owner, sem parecer jurídico independente.
  - Homologações: PAdES/TSA real, banco real, SENATRAN real e a lista nominal das 55 autoridades.
  - Issues de handoff ainda abertas: #96 (OD-D17) e #97 (OD-D33).
- `work/rounds/README.md` ainda mostra R-0007 como "planned".

## R-0008 a R-0011: detalhamento tardio

Achados comuns às quatro rodadas:

- Todas estão fechadas, mas `work/rounds/README.md` ainda as mostra como "planned".
- Os relatórios de worker (`reports/`) são citados como evidência, mas não estão versionados. A exceção é a R-0010, cujos relatórios foram adicionados com `git add --force`.
- Nenhuma issue do GitHub é referenciada.
- O orçamento estourou as janelas previstas em todas as quatro.

### R-0008: teat-backend (PC-0005, PRs #47–#52)

- **Execução:** o maestro continuou após o prompt-review-2 dar FAIL, o que é um desvio consciente de §5. O consumo foi de ~4,0M tokens, contra janela de 700k.
- **Fora do gate:** `SpeedModule` ficou atrás de uma flag e sem contrato (OD-T66). `integration.item.changed` não tem produtor (OD-T73).
- **Divergências adiadas:** status HTTP diferentes do contrato (OD-T70) e enums de sync incompletos (OD-T72).
- **Decisões de Owner:** as ~30 ODs abertas em §F (OD-T13…T73) seguem pendentes. OD-T16 tem as chaves de produção pendentes. OD-T18 depende do claim `decision_body` no IdP real.
- **Pendências normativas:** Anexo I da Res. 432, rol do art. 269 do CTB, retenção de bodycam (DT-049) e Res. 1.025/2026.

### R-0009: portal-backend (PC-0006, PRs #54, #56, #57)

- **Delegações indisponíveis:** defesa, recursos, indicação, pagamento e junta médica respondem `PORTAL.SERVICE_UNAVAILABLE`. Isso continua assim em `main` (`backend/app/src/portal-delegation.providers.ts:5-6,113`), com `it.todo` em `portal-requests.e2e.spec.ts:776,868`.
- **Processo:** a execução seguiu após 2 prompt-reviews com FAIL. Houve correções fora do lock.
- **Decisões de Owner:** OD-P14…P46 seguem pendentes, entre elas OD-P23, sobre `cpf_hash` reversível.
- **Homologações pendentes:** gov.br OIDC (OD-P15/P25), SNE (OD-P16), `@stynx-nyx/privacy` não montado (OD-P17) e anexos assinados (OD-P42).

### R-0010: boat-backend (PC-0008, PRs #55, #71, #72)

- **Escopo:** foram 22 tarefas, o dobro das 11 do plano, e cerca de 26 prompt-reviews. Vários foram rejeitados por JSON inválido.
- **Revisão de entrega incompleta no CTG-0002:** a delivery-review cobriu só a tríade documental. Comandos, projeções, job e contratos ficaram sem revisão de entrega.
- **Não entregue:** a rota cidadã `subject-request` não foi exposta. O BAT oficial também não saiu: há só relatório preliminar, sem assinatura nem TSA. P-09 permanece `blocked`.
- **Documentação contraditória:** `boat-build-pack.md:60-73` ainda chama o WP-B2 de parcial, o que contradiz o closure.
- **Homologação pendente:** RENAEST real.
- **Decisões de Owner:** OD-B01 (hipótese legal para dado de saúde), OD-B02 (retenção), OD-B08 (manuais RENAEST) e H.42 (catálogos).

### R-0011: dashboard-backend (PC-0009, PRs #83, #87, #88)

- **Integração adiada:** a Emenda 2 abriu o CTG-0002 sem esperar a R-0007. A integração com o motor de prazos ficou para depois (OD-D28).
- **Indicadores desconectados:** sem produtor de eventos RAIT (OD-D17), IND-DASH-101…105 estão desconectados; no bloco A, só 2 de 11 indicadores estão conectados.
- **Gate de fronteiras:** fica fora dele `backend/app/src` (OD-D16), e persiste a leitura `ops/field` → `inf` (OD-D15).
- **Pendências de implementação:** OD-D58 continua `todo`. Faltam as rotas de `reject` e `DELETE` de exportação (OD-D36).
- **Decisões de Owner:** OD-D76 (atalho `'*'` de admin), OD-D17…D57 e OD-D55 (com LEGAL).
- **Pendências normativas:** CONTRAN 918, arts. 26–27 e 29 p.ú.; IND-20x sem prazo após a Lei 14.599/2023.
