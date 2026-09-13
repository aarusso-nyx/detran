---
id: APP-RAIT
title: RAIT — Recursos Administrativos de Infrações de Trânsito
status: approved
apps: [rait]
sources:
  [
    REF-CONTRAN-900,
    REF-CONTRAN-918,
    REF-CONTRAN-357,
    REF-CTB-extracts-raw,
    REF-LEI-9873-1999,
    REF-DETRANAM-SERVICOS,
    REF-CETRAN-PROCESSO-INTERNO,
    REF-LEI-13709-2018,
  ]
updated: 2026-08-26
---

## Missão

Workflow interno de tratamento de defesas e recursos de multas: distribuição a backlogs de
revisores humanos, acompanhamento de prazos e progresso, em 1º circuito (revisor único —
defesa prévia/instrução) e 2º circuito (julgamento colegiado — JARI; 2ª instância CETRAN).

## Atores

Analista/revisor; presidente e membros de JARI; secretaria; autoridade de trânsito; CETRAN.
Organização interna (coordenador e subcoordenador da defesa prévia, autoridade signatária por
circunscrição, autoridade centralizada do recurso vinculado, suplentes, secretaria de sessão,
coordenador de JARIs quando houver mais de uma), filas, escalas, plantão, sorteio e bancas:
[WF-RAIT-004].

Códigos de RBAC canônicos (Owner, 2026-09-12; `shared/actors.md` §Papéis granulares RAIT):
`rait-analyst`, `rait-coordinator`, `rait-secretary`, `rait-signing-authority`,
`rait-central-authority`, `rait-rapporteur`, `rait-chair`, `rait-manager`, `rait-hr`,
`rait-finance`; transversais reaproveitados: `auditor`, `agency-admin`, `integration-operator`,
`DPO`.

## Escopo (dentro / fora)

Dentro: intake (via portal e balcão), distribuição, prazos, pautas, votos, decisões
assinadas, comunicação de resultado. Fora: interposição pelo cidadão (portal), cobrança.
Fronteiras modeladas como casos de uso de handoff (2026-09-12): integração RENAINF/RENACH pelo
senatran-adapter ([UC-RAIT-029]…[UC-RAIT-031]), arrecadação, restituição e entrega à cobrança/dívida
ativa ([UC-RAIT-032]…[UC-RAIT-035]), remuneração por sessão e mandatos com o RH/gabinete
([UC-RAIT-036], [UC-RAIT-037]).

## Âncoras legais

[REF-CONTRAN-900] (defesa/recurso — admissibilidade, requisitos, diligência, desistência);
[REF-CONTRAN-918] arts. 9, 12-18 (defesa da autuação, NP, recursos, comunicação de decisão);
[REF-CONTRAN-357] (composição/mandato/quorum das JARI); CTB arts. 285-290-A
([REF-CTB-extracts-raw] — efeito suspensivo, prazo de julgamento de 24 meses, prescrição por
inércia do art.289-A, encerramento da instância); Lei 9.873/1999 art.1º §1º
([REF-LEI-9873-1999] — prescrição por paralisação de 3 anos); Lei 13.709/2018 (LGPD,
[REF-LEI-13709-2018] — base legal do dado do requerente e do procurador, retenção, direitos do
titular; bloco [RN-RAIT-133]-[RN-RAIT-138], fechado em 2026-08-26, ver
`_meta/lgpd-assessment.md`). Ver `refs/INDEX.md` §Gaps para o que segue pendente (regimento local
JARI-AM/CETRAN-AM, regulamentação de força maior).

## Modelo operacional (resumo)

O RAIT processa três tipos de pleito sobre um mesmo AIT — defesa prévia (1º circuito, revisor
único), recurso à JARI e recurso ao CETRAN-AM (2º circuito, colegiado) — cada um como um caso
próprio, protocolado, triado, distribuído, instruído e decidido pela mesma máquina de estados
([WF-RAIT-001]), com distribuição/SLA geridos por [WF-RAIT-002] e o rito de sessão colegiada
detalhado em [WF-RAIT-003]. O eixo que organiza todo o desenho de processo é a **prevenção
ativa de prescrição por inércia do próprio órgão**: três relógios de extinção de punibilidade
correm em paralelo a qualquer caso (decadência 180/360 dias — CTB art.282; prescrição por
inércia recursal em 24 meses — CTB art.289-A; prescrição por paralisação em 3 anos — Lei
9.873 art.1º §1º), e a escada de alertas de [WF-RAIT-002] §4 existe para que nenhum dos três
seja alcançado na prática. O SLA local anunciado ao cidadão ("parecer em 30 dias", "30 dias
úteis" na JARI) é uma meta de qualidade de atendimento, independente e muito mais apertada do
que os tetos legais — ambos coexistem no desenho, monitorados por indicadores distintos.

## KPIs propostos

Indicadores a alimentar o `transversal/dashboard` (ver `bpo-notes.md` §Feed de métricas para a
lista técnica completa):

- **Tempo por fase** — mediana e p90 de tempo em cada estado de [WF-RAIT-001] (protocolo→triagem,
  triagem→distribuição, distribuição→decisão), por `instancia`/`circuito`.
- **% em risco de prescrição** — proporção de casos ativos em cada nível de alerta
  (`SEM_RISCO`…`CRITICO`) por relógio (A/B/C), por pool.
- **Produtividade por revisor** — casos decididos/mês por analista e por relator; tempo médio
  de instrução; taxa de diligências abertas.
- **Taxa de provimento por enquadramento** — % de decisões `provido` segmentado por tipo de
  infração/enquadramento — insumo para identificar problemas sistemáticos de autuação
  (CONTRAN-357 item 3.1.c) e retroalimentar o TEAT.
- **Aging buckets** — distribuição de casos ativos por faixa de idade (0-30d, 31-90d, 91-180d,
  181-365d, >365d), cruzado com `instancia`.
- **Aderência ao SLA local** — % de casos decididos dentro da meta operacional de 30 dias
  (defesa) / 30 dias úteis (JARI), como indicador de qualidade separado do risco de
  prescrição.
- **Sessões adiadas por falta de quorum** — contagem e % sobre sessões convocadas — sinal de
  risco sistêmico de capacidade do colegiado.

## Volumes e capacidade

Ordens de grandeza fornecidas pelo Owner em steering (`_meta/steering.md` B.9-B.12, 2026-08-24),
**substituídas onde a Sub Gerência de Infração do DETRAN-AM deu números exatos em resposta
institucional (2026-08-27/28)** — ver notas por linha:

| Parâmetro                              | Valor                                                                                      | Natureza                                                                                                                                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JARI junto ao DETRAN-AM                | uma única, **mas a resposta institucional também menciona níveis "Municipal" e "Federal"** | ⚠️ **ambíguo, não fecha DT-060** — ver nota abaixo                                                                                                                                              |
| Conselheiros do CETRAN-AM              | **19**                                                                                     | **confirmado pela Sub Gerência de Infração** — diverge do levantamento por fonte pública (15-16 assentos nominais no DL-ALEAM 1.147/2026, [REF-DECRETO-34398-2014]); não reconciliado, ver nota |
| Equipe da 1ª instância (defesa prévia) | **10** — 1 coordenador, 1 subcoordenador, 7 revisores, 1 secretária                        | **confirmado**, refina a faixa "6-15" anterior                                                                                                                                                  |
| Autoridades de trânsito investidas     | **55** — 50 na capital, 5 no interior                                                      | **confirmado**; relevante a [RN-RAIT-130] (quem exerce o recurso vinculado da autoridade)                                                                                                       |
| Defesas decididas/mês                  | **306** (jul.) — 244 indeferidas, 62 deferidas                                             | **confirmado**, ponto único no tempo; **muito abaixo** da estimativa anterior de ">500/mês"                                                                                                     |

A mesma resposta institucional (2026-08-27/28) também respondeu duas perguntas de escopo
`teat` — autuações lavradas/mês e uso de radar móvel — registradas em [APP-TEAT] §KPIs
operacionais e §Residual, não duplicadas aqui.

⚠️ **Nota de capacidade — revisada, risco reduzido.** O número real de defesas decididas em julho
(306) é bem menor que a estimativa de trabalho anterior (>500/mês) que motivava a preocupação de
capacidade da escada de SLA de [WF-RAIT-002] §4. Ainda faltam: throughput de sessão JARI/CETRAN
especificamente (a resposta cobre a 1ª instância, não a 2ª), taxa histórica de provimento em 2ª
instância, e reconciliação do número de conselheiros do CETRAN (19 institucional × 15-16 nominal
por fonte pública). Ver `_intake/bpo-notes.md` §3 e `_meta/open-issues.md` DT-064.

⚠️ **Nota sobre a resposta de JARI — não resolve DT-060.** A resposta institucional recebida para
"quantas JARI, quantos membros" foi: _"Municipal (Prefeitura) / Estadual (DETRAN) - 02 Membros /
Federal (JARI)"_ — não é claramente inteligível como composição de uma JARI: não há previsão de
"JARI federal" no CTB/CONTRAN, e "02 Membros" contradiz o piso nacional de 3 integrantes da Res.
CONTRAN 357/2010 (item 4.1). Uma leitura possível é que "02 Membros" descreva os assentos do
**DETRAN-AM dentro do CETRAN-AM** (que a composição já confirmada por fonte pública mostra ter
exatamente 2 titulares de DETRAN/AM — ver [REF-DECRETO-34398-2014] §Composição atual), não a
composição da JARI em si — mas isso é inferência, não confirmação. **Registrado como recebido,
não como resolvido** — precisa de pergunta de esclarecimento dedicada antes de alterar
[RN-RAIT-116]/[WF-RAIT-003].

⚠️ **Nota sobre "prazo de 120 dias" — não reconciliado com os prazos legais já documentados.** A
mesma resposta institucional, à pergunta "quais são os prazos para os processos de recurso",
trouxe: _"120 dias a partir da infração (Sub Gerência de Infração)"_. Isso não corresponde a
nenhum dos prazos legais já capturados no corpus ([RN-RAIT-101]: 30 dias para defesa;
[RN-RAIT-114]: 180/360 dias de decadência; [RN-RAIT-111]/[RN-RAIT-112]: 24 meses para julgamento
em cada instância recursal). Hipótese de trabalho, não confirmada: pode se referir a uma **meta
operacional interna** para a decisão de 1ª instância (mesmo padrão já observado para os "30 dias
úteis" anunciados pela carta de serviço da JARI — [REF-DETRANAM-SERVICOS], que é meta operacional,
não prazo legal) — mas isso não foi confirmado e não deve ser adotado como regra sem
esclarecimento adicional.

## Residual aberto após a rodada de endurecimento (2026-08-26)

Os artefatos deste app estão `approved` exceto os itens abaixo, que dependem de decisão do Owner
ou de fonte externa e por isso seguem em `reviewed`:

| Item                                                                                                                                                                                         | Onde                         | Bloqueia                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------- |
| Regime do recurso da autoridade contra provimento — autoridade competente, prazo próprio, contrarrazões                                                                                      | [RN-RAIT-130], [UC-RAIT-008] | modelagem completa do 2º circuito na direção órgão→CETRAN                                   |
| Prescrição do art.289-A: efeito do julgamento tardio, suspensão/interrupção, intervalo entre instâncias                                                                                      | [RN-RAIT-112]                | comportamento do sistema ao ultrapassar o teto                                              |
| Sustentação oral na sessão — prever configurável × omitir                                                                                                                                    | [WF-RAIT-003]                | desenho da tela T-12 ([IU-RAIT-001])                                                        |
| Procedimento do desconto de 40% fora do SNE                                                                                                                                                  | [RN-RAIT-127]                | cálculo de valor devido exposto ao cidadão                                                  |
| _Reformatio in pejus_ em 2ª instância                                                                                                                                                        | [RN-RAIT-119], [RN-RAIT-132] | limites da decisão do colegiado                                                             |
| Índice de correção da restituição (UFIR extinta)                                                                                                                                             | [RN-RAIT-129]                | valor a devolver ao cidadão                                                                 |
| Bloco LGPD do RAIT (base legal, dado sensível incidental, procurador, retenção, compartilhamento JARI/CETRAN) — recém-desenhado, pendente validação jurídica e integração de modelo de dados | [RN-RAIT-133]-[RN-RAIT-138]  | publicidade da hipótese de tratamento; modelo de dados por papel de titular ([RN-RAIT-137]) |

Nenhum deles bloqueia o início da construção: todos são localizáveis a um ponto do desenho e
nenhum atinge o núcleo do ciclo de vida do caso, da distribuição ou dos relógios de prescrição.
