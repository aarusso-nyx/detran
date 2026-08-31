---
id: RAIT-BPO-NOTES
title: Notas do especialista BPO — processo interno RAIT (rodada 2026-08-24)
status: draft
apps: [rait, portal, dashboard]
sources: [WF-RAIT-001, WF-RAIT-002, WF-RAIT-003]
updated: 2026-08-24
---

# Notas do BPO — processo interno RAIT

Produzido pelo especialista BPO ao desenhar [WF-RAIT-001], [WF-RAIT-002], [WF-RAIT-003] e os
12 casos de uso do domínio. Registra: (1) propostas de atualização em arquivos fora da minha
fronteira de escrita (`shared/`); (2) decisões que precisam do Owner em conversa de
steering; (3) premissas do modelo de capacidade; (4) lista de métricas para o dashboard.

## 1. Propostas de atualização em `shared/workflows/WF-INF-001.md`

Não editado diretamente (fora da fronteira de escrita do BPO — arquivo é `shared/`, mantido
por convenção entre domínios). Duas propostas para quem tiver a caneta nesse arquivo:

1. **Anotar o achado do art.289-A** na seção "Decisões de modelagem pendentes" de
   `WF-INF-001.md` — hoje o arquivo já lista "(fonte pendente) prazos de JULGAMENTO pelas
   instâncias (JARI/CETRAN) — CTB art. 285 §3º / art. 289" como pendência; essa pendência está
   **resolvida** pelo corpus mais recente (`refs/ctb/REF-CTB-extracts-raw.md`): o prazo é de
   24 meses (art.285 §6º / art.289 _caput_), e o art.289-A acrescenta que o não-julgamento
   nesse prazo gera **prescrição da pretensão punitiva** — não é só um teto operacional, é uma
   extinção de mérito. Proposta de texto: substituir a linha correspondente e citar
   [WF-RAIT-001] §Relógios de extinção como o desenho operacional que endereça o risco.
2. **Ponte explícita** entre os estados de `WF-INF-001` (`RECURSO_JARI`, `PROVIDO_JARI`,
   `NEGADO_JARI`, `RECURSO_2A`) e as `instancia`s de [WF-RAIT-001] (`jari`, `cetran`) — a
   tabela "Ponte com WF-INF-001" já escrita em `WF-RAIT-001.md` pode ser copiada/adaptada
   para lá, ou referenciada por link, conforme o dono do arquivo preferir.

## 2. Decisões que precisam do Owner (steering)

**RESOLVIDO em steering (2026-08-24)** — todos os 8 itens abaixo foram respondidos pelo Owner;
registro completo em `_meta/steering.md` §A (itens A.1-A.8) e propagado às regras/workflows
citados. Mantido aqui como registro histórico da proposta original:

1. **Limiares da escada de SLA anti-prescrição** ([WF-RAIT-002] §4) — **RESOLVIDO (A.1):**
   aprovados como propostos. Nota de capacidade adicionada ao workflow: volume alto (>500/mês,
   B.11) com 1 JARI-AM (B.9), quorum CETRAN ~8 (B.10) e 6-15 analistas (B.12) merece checagem
   de throughput real antes de tratar a escada como definitiva em produção.
2. **Desenho de pools** ([WF-RAIT-002] §1) — **RESOLVIDO (A.2):** manter 3 pools base
   (defesa/JARI/CETRAN), sem segmentação adicional.
3. **Mecanismo de sorteio de relator** — **RESOLVIDO (A.3):** usar o round-robin já existente
   na plataforma de worklist ([WF-RAIT-002] §3).
4. **Quorum, convocação, sustentação oral, prazo interno de voto e regra de desempate do
   CETRAN-AM/JARI-AM** — **RESOLVIDO (A.4):** saída (b) escolhida — as propostas deste corpus
   (combo CETRAN-ES + CETRAN-SP) são formalizadas como o desenho de fato em [WF-RAIT-003],
   sujeitas a validação jurídica antes de `approved`. Regimento local segue não localizado.
5. **Mecanismo de accountability por atraso de relator** (`ADVERTIDO`→`AFASTADO_TEMP`,
   [WF-RAIT-002] §5) — **RESOLVIDO (A.5):** adotar o modelo CETRAN-ES.
6. **Fonte do calendário de feriados** — **RESOLVIDO (A.6):** nacional + estadual (AM),
   propagado a [RN-RAIT-005] e [WF-RAIT-002] §7.
7. **Prazo de diligência (T-DIL)** — **RESOLVIDO (A.7):** 15 dias úteis, prorrogável 1x,
   aprovado como proposto ([WF-RAIT-001] §Prazos e timers).
8. **Assinatura digital de ata/decisão** — **RESOLVIDO (A.8):** PAdES+TSA adotado
   ([WF-RAIT-003]).

## 3. Premissas do modelo de capacidade

**RESOLVIDO em steering (2026-08-24)** — ordens de grandeza fornecidas pelo Owner
(`_meta/steering.md` §B):

- **Uma única JARI-AM** — confirmado (B.9).
- **Quorum do CETRAN-AM ≈ 8** conselheiros — confirmado como ordem de grandeza, mesmo piso do
  benchmark CETRAN-ES; número exato ainda a validar (B.10).
- **Volume mensal alto (> 500/mês)** de defesas + recursos JARI + recursos CETRAN somados
  (B.11).
- **6-15 analistas/revisores** no 1º circuito (B.12).

⚠️ **Nota de acompanhamento não fechada pela rodada de steering:** o throughput real do
colegiado (casos efetivamente julgados/mês) não foi perguntado diretamente — combinado com
volume alto e apenas 1 JARI-AM/quorum de 8, isso merece uma pergunta de acompanhamento antes
de tratar a escada de SLA de [WF-RAIT-002] §4 como calibração final para produção.

## 4. Lista de métricas para o feed do dashboard

Espelha os KPIs propostos em `APP.md` §KPIs — lista técnica de o que cada métrica precisa como
insumo de dado, para quem for desenhar a integração com `transversal/dashboard`:

| Métrica                              | Granularidade                           | Fonte de dado                                                 |
| ------------------------------------ | --------------------------------------- | ------------------------------------------------------------- |
| Tempo por fase                       | por caso, por estado de [WF-RAIT-001]   | timestamps de transição de estado                             |
| % em risco de prescrição             | por caso, por relógio (A/B/C), por pool | bandeira de [WF-RAIT-002] §4/§6                               |
| Produtividade por revisor            | por analista/relator, por mês           | casos decididos, tempo de instrução, diligências abertas      |
| Taxa de provimento por enquadramento | por tipo de infração                    | resultado da decisão + enquadramento do AIT (herdado do TEAT) |
| Aging buckets                        | por caso, por `instancia`               | idade do caso (protocolo → hoje)                              |
| Aderência ao SLA local               | por caso                                | tempo total vs. meta de 30d/30 dias úteis                     |
| Sessões adiadas por falta de quorum  | por sessão                              | resultado de `SESSAO_ABERTA` em [WF-RAIT-003]                 |
| Reatribuições e afastamentos         | por responsável                         | eventos de [UC-RAIT-011]                                      |
| Incidentes de prescrição operacional | por caso (deve ser ~zero)               | transição para `PRESCRITO_OPERACIONAL` em [WF-RAIT-002]       |
