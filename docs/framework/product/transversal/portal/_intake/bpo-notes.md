---
id: BPO-NOTES-PORTAL
title: Notas do especialista BPO — PORTAL (rodada transversal, 2026-08-24/25)
status: draft
apps: [portal]
sources: []
updated: 2026-08-24
---

Registro de trabalho do especialista BPO para a rodada confirm-extend do PORTAL. Complementa
`_intake/research-dossier.md` (achados de pesquisa) e `_intake/ux-notes.md` (telas/linguagem).
Cobre: propostas de arquivo compartilhado, decisões que precisam do Owner, os pontos de encaixe com
cada app de domínio, e a lista explícita do que o PORTAL não faz.

## 1. Propostas de arquivo compartilhado (fora da fronteira de escrita direta do BPO nesta rodada)

Estas mudanças tocam arquivos fora de `transversal/portal/**` — não escritas diretamente,
propostas aqui para quem tem a fronteira de escrita correspondente:

- **`shared/glossary.md`** — adicionar entradas para: SNE (já existe, ok); "nível de assinatura
  eletrônica" (simples/avançada/qualificada — Decreto 10.543/2020 art.4º); "nível de conta gov.br"
  (bronze/prata/ouro — com a ressalva de que não é o mesmo eixo, e não é normativo); "ciência
  ficta"; "Carta de Serviços ao Usuário" (Lei 13.460 art.7º). Sem essas entradas, qualquer
  consumidor futuro do corpus (engenharia, LEGAL) corre o risco de confundir os dois eixos de nível
  — o mesmo erro que o briefing original desta rodada cometeu.
- **`shared/actors.md`** — o PORTAL usa os atores já listados em "Cidadãos e partes" sem alteração.
  Proposta: acrescentar uma nota explícita de que "Gestor DETRAN"/"Auditor / DPO" (seção
  Transversais) atuam no PORTAL apenas como consumidores do canal de ouvidoria/LGPD ([UC-PORTAL-016],
  [UC-PORTAL-018]), nunca como usuários finais do catálogo de serviços — evita que uma futura
  matriz de RBAC do PORTAL herde permissões operacionais que não fazem sentido para um app
  majoritariamente externo ao órgão.
- **`refs/detran-am/REF-DETRANAM-SERVICOS.md`** — proposta de correção de conteúdo (não apenas de
  processo): incluir, por serviço, o prazo máximo de prestação e o detalhamento do art.7º §3º da
  Lei 13.460/2017 (prioridades, tempo de espera, canais de comunicação, mecanismos de consulta de
  andamento). Ver item 2 abaixo — é decisão de baixo risco/alto impacto, no mesmo padrão já
  aprovado pelo Owner em `_meta/steering.md` D.28.

## 2. Decisões que precisam do Owner (candidatas a `_meta/steering.md`, próxima rodada)

1. **Autorizar a correção de conteúdo da Carta de Serviços do DETRAN-AM** (prazo máximo por
   serviço, Lei 13.460 art.7º §2º, IV) — mesmo padrão já aprovado para endosso cartorial/parecer
   JARI (steering.md D.28). Recomendação do BPO: **sim, autorizar agora**, usando a tabela de
   [WF-PORTAL-001] como fonte de dados.
2. **Meta de adesão ao SNE** — nenhuma meta de produto definida; sem ela, o KPI "taxa de adesão"
   proposto em [APP-PORTAL] não tem referência de sucesso.
3. **Escopo do módulo de pagamento** — gateway próprio (PORTAL processa o pagamento) vs. apenas
   geração de guia com redirecionamento a banco/PIX externo. Decisão de arquitetura de produto que
   condiciona todo o desenho de [UC-PORTAL-015] e [UC-PORTAL-012] (CRLV-e).
4. **Nível de conta exigido para adesão ao SNE** ([UC-PORTAL-007]) — a Res. 931/2022 não define;
   o BPO recomenda nível avançado dado o efeito jurídico da ciência ficta, mas é decisão de produto,
   não obrigação normativa direta.
5. **Confirmar se o app oficial "Detran Digital"/CDT cobre hoje CNH digital e CRLV-e**, e se há
   integração com a Plataforma gov.br para reaproveitar a conta única — pergunta já registrada pela
   rodada CRAWLER (`research-dossier.md` Handoff BPO), reafirmada aqui porque condiciona diretamente
   [UC-PORTAL-011] e [UC-PORTAL-012]: se o app já existe e faz isso, o desenho aqui é de
   consolidação/substituição, não de greenfield puro.

## 3. Seams com cada app de domínio (onde o PORTAL entrega e retoma)

| App de domínio | Onde o PORTAL entrega                                                                                                                               | Onde o PORTAL retoma (exibe de volta ao cidadão)                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **RAIT**       | protocolo de defesa/recurso/indicação de condutor ([WF-RAIT-001] `PROTOCOLADO`)                                                                     | decisão, diligência, pauta, resultado — via [WF-PORTAL-003] notificação + `_intake/ux-notes.md` mapa de tradução de estado |
| **PEC**        | requerimento de junta médica/psicológica ([WF-PEC-002] `REQUERIMENTO_APRESENTADO`) — sujeito à correção de legitimado ainda pendente ([RN-PEC-110]) | resultado de exame ([UC-PORTAL-014]), decisão de junta                                                                     |
| **BOAT**       | nenhuma entrega direta hoje — PORTAL só lê ([UC-PORTAL-013])                                                                                        | dados do BAT, quando o registro está `FECHADO`/`INTEGRADO` ([WF-BOAT-001])                                                 |
| **TEAT**       | nenhuma entrega direta — cidadão nunca lavra AIT                                                                                                    | nenhuma leitura direta hoje; autuação chega ao cidadão via NA/NP, que é [WF-INF-001], não TEAT diretamente                 |
| **DASHBOARD**  | nenhuma entrega — DASHBOARD é consumidor, não destino                                                                                               | PORTAL alimenta o painel de monitoramento (Lei 14.129 art.22) com os eventos de avaliação e prazo — ver [APP-PORTAL] KPIs  |

**Padrão geral**: o PORTAL nunca modela o estado interno de nenhum desses workflows — apenas o
traduz. Qualquer novo estado adicionado a [WF-RAIT-001], [WF-PEC-001/002] ou [WF-BOAT-001] precisa
de uma entrada correspondente no mapa de tradução (`_intake/ux-notes.md` §c) antes de ir a produção
— regra já fixada pelo especialista UX, reafirmada aqui como responsabilidade também do BPO ao
desenhar processo.

## 4. O que o PORTAL NÃO faz (fronteira explícita — releitura obrigatória antes de qualquer PR de engenharia)

- **Não decide nem julga mérito** de nenhum processo — defesa, recurso, sinistro ou exame. Toda
  decisão vem do workflow de destino; o PORTAL apenas exibe.
- **Não altera o ato** que originou o processo (não corrige um AIT, não modifica um BAT, não edita
  um laudo clínico) — apenas coleta o pedido do cidadão e o encaminha.
- **Não é a fonte autoritativa** de veículo (RENAVAM), CNH (RENACH), infração (RENAINF) ou sinistro
  (RENAEST) — é vitrine/espelho. Nenhuma implementação deve tratar o cache do PORTAL como
  substituto do sistema nacional em caso de divergência.
- **Não define regime de ciência jurídica fora do SNE** — notificações de processo fora do SNE são
  UX de acompanhamento, não um novo instituto de ciência ficta (ver [WF-PORTAL-003] "Decisões de
  modelagem pendentes").
- **Não substitui o atendimento presencial** — a Lei 14.129/2021 art.3º XVI garante a permanência
  do atendimento presencial; o PORTAL é canal adicional, não exclusivo.
- **Não trava um ato por exigência de nível de conta gov.br não normativa** — a matriz
  bronze/prata/ouro é inferência operacional, não pode ser apresentada ao cidadão como "a lei exige
  nível ouro" quando a base normativa real é o nível de assinatura (simples/avançada/qualificada) do
  Decreto 10.543/2020.
- **Não modela RBAC operacional interno** (fila de analista, distribuição de relator, pauta de
  sessão) — isso pertence a RAIT/PEC/BOAT; o PORTAL só enxerga o que o cidadão precisa ver.

## 5. Achado de conformidade transferido ao BPO (do handoff da rodada CRAWLER)

Reafirmando o handoff de `_intake/research-dossier.md`: a Carta de Serviços do DETRAN-AM está sem
prazo máximo por serviço (Lei 13.460 art.7º §2º, IV). O BPO propõe a correção (ver item 2.1 acima),
mas não a executa diretamente — é conteúdo do site institucional do DETRAN-AM, fora da fronteira de
escrita deste corpus (que é semântica/requisitos, não publicação).
