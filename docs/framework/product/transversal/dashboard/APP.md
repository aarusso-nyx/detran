---
id: APP-DASHBOARD
title: DASHBOARD — Monitoramento interno do ecossistema
status: approved
apps: [dashboard]
sources:
  [
    REF-LEI-12527-2011,
    REF-LEI-13460-2017,
    REF-LEI-13614-2018,
    REF-LEI-14129-2021,
    REF-CONTRAN-918,
    REF-CONTRAN-808-2020,
    WF-RAIT-002,
    RN-RAIT-110,
    RN-RAIT-111,
    RN-RAIT-112,
    RN-RAIT-113,
    RN-RAIT-114,
    WF-PEC-002,
    RN-PEC-110,
    RN-PEC-111,
    RN-PEC-112,
    WF-BOAT-001,
    WF-BOAT-003,
    WF-TEAT-001,
    WF-TEAT-002,
    WF-TEAT-003,
    WF-TEAT-004,
    WF-TEAT-005,
  ]
updated: 2026-09-13
---

## Missão

Painel interno único de operação do DETRAN-AM: acompanha, em um único lugar, os relógios legais
que correm sobre `rait` e `pec` (prazos cuja violação **extingue um direito** — prescrição,
decadência, preclusão), os deveres periódicos de prestação de contas e publicação que a
Administração deve cumprir perante a União e o cidadão, os SLAs operacionais de atendimento de
cada app, e a saúde técnica da malha de integrações (outbox, sincronização offline, adapter
SENATRAN, cadeia de custódia). O DASHBOARD não decide nada — ele torna visível, a tempo de agir,
o que cada app já sabe sobre si mesmo mas ninguém olha de forma consolidada.

A tese central: cada um dos quatro apps de domínio (`rait`, `pec`, `boat`, `teat`) já modela seus
próprios relógios e SLAs em seus próprios workflows ([WF-RAIT-002] §4, [RN-PEC-112],
[WF-BOAT-001]/[WF-BOAT-003], [WF-TEAT-003]/[WF-TEAT-004]) — o DASHBOARD **não os re-modela**; ele
os cataloga (ver §Catálogo de indicadores), define o ciclo genérico pelo qual um alerta nasce,
escala e se encerra ([WF-DASH-001]), o calendário que amarra deveres periódicos a datas legais
citáveis ([WF-DASH-002]), e a disciplina de honestidade que impede o painel de mostrar um número
velho como se fosse atual ([WF-DASH-003]).

## Atores

| Papel                         | Atuação central                                                                                                                                                                                                                                                                                | Fronteira                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Operador de monitoramento** | acompanha o radar de alertas em tempo real, reconhece (`ack`) indicadores, aciona o dono correto, verifica encerramento                                                                                                                                                                        | não decide o mérito do caso — apenas garante que o dono soube e agiu         |
| **Gestor de área**            | dono de um ou mais indicadores (Gestor RAIT, coordenador de pool, presidente JARI/CETRAN, Coordenador de RENAEST, Diretoria de Fiscalização, Gestor Clínica/PEC, ouvidor) — a mesma pessoa/papel que já recebe escalonamento nos workflows de origem ([WF-RAIT-002] §6, [WF-TEAT-001] §Atores) | age **no app de origem**, nunca no DASHBOARD                                 |
| **Administração técnica**     | dono dos indicadores de saúde técnica (outbox, sync offline, adapter SENATRAN, faixas de numeração, homologação de dispositivo)                                                                                                                                                                | idem — corrige na origem (`technical-admin`/`integration-operator` dos apps) |
| **Auditor / DPO**             | consulta trilha de auditoria agregada, cadeia de custódia, histórico de alertas e deveres cumpridos/descumpridos; não edita nada                                                                                                                                                               | leitura apenas — mesmo papel transversal de `shared/actors.md`               |

Papel transversal "Gestor DETRAN" (`shared/actors.md`) tem visão cross-tenant de todos os
indicadores, sem ser dono operacional de nenhum — é o consumidor natural de [UC-DASH-005]
(comparação entre unidades/circuitos).

## Escopo (dentro / fora)

**Dentro:** métricas, alertas, trilhas de auditoria agregadas, calendário de deveres periódicos,
indicadores de frescor/confiança de cada painel, comparação de desempenho entre unidades/
circuitos, publicação de dados abertos e transparência ativa (o próprio módulo de transparência
do LAI/dados abertos é, ele mesmo, uma superfície do DASHBOARD — ver [REF-LEI-12527-2011]
art. 8º §3º).

**Fora — regra de fronteira explícita: "DASHBOARD não pratica ato de negócio".** O DASHBOARD
nunca: julga um recurso, decide uma junta, designa um relator, declara uma prescrição, aprova um
cancelamento, corrige um registro RENAEST, libera um veículo. Todo ato de negócio acontece no app
de domínio; o DASHBOARD **detecta, classifica, notifica e acompanha até a verificação do
encerramento** ([WF-DASH-001]). A única exceção aparente — a declaração automática e de ofício
da prescrição do art. 289-A ([RN-RAIT-112], decisão do Owner C.15) — **não é ato do DASHBOARD**:
é um ato do próprio RAIT, disparado por seu relógio interno; o DASHBOARD apenas exibe o evento e
o consequente registro de incidente. Se essa distinção parecer sutil na UI, ela não pode
desaparecer no desenho: o dono do dado (RAIT) permanece o dono do ato.

## Âncoras legais

Corpus completo em `_intake/research-dossier.md`. Instrumentos centrais:

- [REF-LEI-12527-2011] (LAI) — art. 8º §3º (checklist técnico do portal de transparência), art. 11
  §§1º-2º (relógio de resposta a pedido de acesso, 20+10 dias).
- [REF-LEI-13460-2017] (Lei de Defesa do Usuário) — art. 15 (relatório anual de ouvidoria), art. 16
  (respostas da ouvidoria, 30+30 dias, e do agente à ouvidoria, 20+20 dias), art. 23 (pesquisa de
  satisfação anual + ranking público).
- [REF-CONTRAN-918] — art. 26 (informar arrecadação/FUNSET até o dia 20 do mês subsequente) e
  art. 27 §§6º-7º (relatório mensal de cartão, sob pena de suspensão da autorização) — **excerto
  verbatim ainda pendente em `refs/contran/REF-CONTRAN-918.md`**; texto disponível hoje apenas
  como paráfrase em `_intake/research-dossier.md` §2 — marcado `(excerto pendente)`, não é lacuna
  de existência normativa, é lacuna de captura do corpus `refs/`.
- [REF-CONTRAN-808-2020] — art. 8º V (publicação estatística mensal, federal), arts. 7º-10
  (Coordenadores de RENAEST e cascata de validação, já modelada em [WF-BOAT-003]).
- [REF-LEI-13614-2018] / CTB art. 326-A §9º — prazo de repasse estatístico anual, hoje **extinto em
  sua forma original** pela Lei 14.599/2023, sem substituto CONTRAN localizado (gap registrado em
  `refs/INDEX.md`).
- [REF-LEI-14129-2021] arts. 29-32 (dados abertos) e art. 22 (indicadores de serviço: volume,
  tempo médio, satisfação, comparáveis entre entes).
- Tetos legais monitorados por remissão, sem re-modelagem: [RN-RAIT-110..114] (RAIT),
  [RN-PEC-110..112] (PEC), [WF-BOAT-001]/[WF-BOAT-003] (BOAT/RENAEST), [WF-TEAT-001..005] (TEAT).
- Uma rodada LEGAL paralela produz `RN-DASH-1xx` sobre os deveres próprios do DASHBOARD (ex.: base
  legal exata da obrigação de honestidade de frescor, do dever de retenção da trilha de auditoria
  agregada) — referências `[RN-DASH-1xx]` neste corpus são **forward references** intencionais.

## Interfaces com outros apps/domínios

O DASHBOARD não tem base de dados própria de negócio — ele **consome** eventos e leituras dos
quatro apps de domínio e do PORTAL. Contratos de dados propostos (o que cada app precisa expor
para o painel existir) estão detalhados em `_intake/bpo-notes.md` §Contratos de dado; resumo:

| App                | O que o DASHBOARD precisa receber                                                                                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rait`             | eventos de mudança de faixa da escada de SLA ([WF-RAIT-002] §4: `SEM_RISCO`→...→`PRESCRITO_OPERACIONAL`), snapshot de acervo por faixa de risco, eventos de declaração de prescrição                                                                                  |
| `pec`              | eventos do ciclo de junta/recurso ([WF-PEC-002]), prazos em curso por instância, pendências sem prazo (Junta Especial de Saúde)                                                                                                                                       |
| `boat`             | eventos de fechamento local (`closed`), estado da cascata de validação ([WF-BOAT-003]), status de envio à RENAEST, registros bloqueados para correção pós-terminal                                                                                                    |
| `teat`             | fila de sincronização offline (idade do lote mais antigo), estado de homologação SENATRAN do software ([WF-TEAT-003]), validade de pacote normativo instalado em campo, ocupação de faixas de numeração, medidas administrativas em curso (retenção/remoção/depósito) |
| `portal`           | volume/tempo médio/satisfação por serviço (espelha [REF-LEI-14129-2021] art. 22), pedidos LAI em curso, manifestações de ouvidoria em curso                                                                                                                           |
| `senatran-adapter` | latência e taxa de erro por sistema nacional (RENAVAM, RENACH, RENAINF, RENAEST, SNE)                                                                                                                                                                                 |

## Modelo operacional

O DASHBOARD opera em dois modos simultâneos, sobre a mesma base de indicadores (ver §Catálogo):

1. **Radar em tempo real** — indicadores do tipo `legal-ceiling` e `saúde técnica`, que mudam de
   estado a qualquer momento e alimentam o ciclo de alerta [WF-DASH-001].
2. **Calendário de obrigações** — indicadores do tipo `dever periódico`, que seguem um ciclo de
   janela de apuração → preparação → submissão/publicação → comprovação → arquivamento, amarrado a
   datas legais fixas ou periodicidades (dia 20, mensal, anual), governado por [WF-DASH-002].

Indicadores do tipo `SLA operacional` alimentam os dois modos, dependendo de terem ou não prazo
numérico com marco de vencimento identificável.

## Catálogo de indicadores

42 indicadores, derivados dos quatro tetos legais monitorados (RAIT, PEC), dos 13 deveres
periódicos compilados em `_intake/research-dossier.md` §2, dos SLAs operacionais de cada app, e da
saúde técnica da malha de integração. Legenda de tipo:

- **legal-ceiling** — o vencimento do prazo produz, por si só, um **efeito jurídico automático**
  sobre o caso (extinção de direito, decadência, preclusão, conversão de medida, restrição de
  cadastro, cancelamento de homologação). É a classe que [WF-DASH-001] trata na "trilha de
  extinção".
- **dever periódico** — obrigação institucional recorrente do órgão perante terceiros (União,
  cidadão em geral), amarrada a calendário. Governada por [WF-DASH-002].
- **SLA operacional** — meta de atendimento ou prazo do órgão **sem** efeito jurídico automático
  de extinção; descumprimento gera exposição/responsabilização, não perda de direito.
- **saúde técnica** — indicador de infraestrutura/integração, sem base legal direta, mas
  condição de confiabilidade dos demais indicadores.

### A. Legal-ceiling (extinção de direito / efeito jurídico automático)

| ID           | Nome                                                               | Pergunta que responde                                                                                              | Fonte                                                                 | Limiar/alerta                                                                                                                              | Dono                                                  | Ação esperada                                                                                                                                                               |
| ------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IND-DASH-101 | Decadência de aplicação da penalidade (RAIT)                       | Quantos processos estão perto de perder o direito de aplicar a penalidade?                                         | `rait` — [RN-RAIT-114]                                                | 180d (sem defesa) / 360d (com defesa); marcos 50/75/90% ([WF-RAIT-002] §4.3)                                                               | Gestor RAIT / Autoridade de trânsito                  | priorizar decisão da defesa antes do teto                                                                                                                                   |
| IND-DASH-102 | Prescrição por inércia do julgador — JARI (RAIT)                   | Quantos recursos de 1ª instância estão perto de prescrever por falta de julgamento?                                | `rait` — [RN-RAIT-110]/[RN-RAIT-112]                                  | 24 meses do recebimento pela JARI; escada N1/N2/N3/CRÍTICO em 12/18/21/23m ([WF-RAIT-002] §4.1)                                            | Coordenador do pool → Gestor RAIT → Presidente JARI   | pauta prioritária compulsória; no teto, declaração de ofício ([RN-RAIT-112], decisão C.15)                                                                                  |
| IND-DASH-103 | Prescrição por inércia do julgador — CETRAN (RAIT)                 | Idem, para recursos de 2ª instância                                                                                | `rait` — [RN-RAIT-111]/[RN-RAIT-112]                                  | mesma escada do IND-DASH-102, relógio independente                                                                                         | Coordenador do pool → Gestor RAIT → Presidente CETRAN | idem; **gap operacional**: RAIT fica cego sem integração formal da data de recebimento pelo CETRAN ([RN-RAIT-111] §Gap)                                                     |
| IND-DASH-104 | Prescrição por paralisação (RAIT, Lei 9.873/1999)                  | Quantos processos estão parados há tempo demais, em qualquer fase pré-decisão?                                     | `rait` — [RN-RAIT-113] §1º                                            | 36 meses sem movimentação; alerta em 24m, escalada em 30m ([WF-RAIT-002] §4.2)                                                             | Coordenador do pool → Gestor RAIT                     | reatribuição obrigatória ([UC-RAIT-011]); qualquer ato de ofício reinicia o relógio                                                                                         |
| IND-DASH-105 | Prescrição quinquenal (RAIT, Lei 9.873/1999 caput)                 | Algum processo se aproxima de 5 anos desde a prática do ato, sem decisão condenatória recorrível que a interrompa? | `rait` — [RN-RAIT-113] caput                                          | 60 meses da `data_pratica_ato`; **sem escada calibrada em [WF-RAIT-002]** — gap a fechar                                                   | Gestor RAIT                                           | **item de capacidade**: RAIT ainda não expõe este relógio como alerta próprio; DASHBOARD só pode monitorá-lo quando o campo existir — ver `_intake/bpo-notes.md` §Contratos |
| IND-DASH-106 | Preclusão do requerimento de junta (PEC)                           | Quantos candidatos estão perto de perder o direito de requerer revisão?                                            | `pec` — [RN-PEC-112] item 1                                           | 30 dias corridos do conhecimento do resultado; marcos 50/75/90%                                                                            | Gestor Clínica/PEC                                    | garantir que o candidato foi cientificado a tempo de agir (depende de IND-DASH-306 não atrasar)                                                                             |
| IND-DASH-107 | Preclusão do recurso ao CETRAN/CONTRANDIFE (PEC)                   | Quantos candidatos estão perto de perder o direito de recorrer?                                                    | `pec` — [RN-PEC-112] item 4                                           | 30 dias corridos do conhecimento do resultado da junta; marcos 50/75/90%                                                                   | Gestor Clínica/PEC                                    | idem                                                                                                                                                                        |
| IND-DASH-108 | Conversão retenção→remoção + restrição RENAVAM, via T-REG30 (TEAT) | Quantos veículos retidos estão perto de ter a irregularidade convertida em remoção por prazo vencido?              | `teat` — [WF-TEAT-004] T-REG30 (CTB art. 270 §§2º,6º,7º)              | 30 dias do recibo; alerta antes do vencimento                                                                                              | Diretoria de Fiscalização / traffic-authority         | contatar condutor/proprietário antes da conversão automática                                                                                                                |
| IND-DASH-109 | Idem via T-REG15 (retenção convertida direto, art. 271 §9º-A)      | Idem, trilha de 15 dias                                                                                            | `teat` — [WF-TEAT-004] T-REG15                                        | 15 dias do recibo                                                                                                                          | idem                                                  | idem                                                                                                                                                                        |
| IND-DASH-110 | Homologação do software TEAT perante SENATRAN                      | O talão eletrônico está com homologação federal vigente, ou em risco de cancelamento?                              | `teat` — [WF-TEAT-003] "Ciclo de homologação SENATRAN"                | decisão de viabilidade em 60d do protocolo; renovação do laudo a cada 4 anos; cancelamento a qualquer momento por auditoria/descumprimento | Administração técnica / agency-admin                  | tratar "alteração de funcionalidade" como gate de release, iniciar renovação com antecedência do marco quadrienal                                                           |
| IND-DASH-111 | Marco fixo T-SNE2027 (TEAT)                                        | Falta quanto para a notificação de remoção passar a ser exclusivamente via SNE?                                    | `teat` — [WF-TEAT-004] T-SNE2027, [REF-CONTRAN-1025-2026] art. 15 §3º | marco único, 01/01/2027                                                                                                                    | Administração técnica                                 | garantir integração SNE operacional antes do marco — item de roadmap, não de alerta recorrente                                                                              |

### B. Dever periódico (obrigação institucional recorrente)

| ID           | Nome                                                      | Pergunta que responde                                                                                                             | Fonte                                                                           | Periodicidade / prazo                                                                                                   | Dono                                   | Ação esperada                                                                                                                                                         |
| ------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IND-DASH-201 | Arrecadação/FUNSET informada à União                      | O relatório de arrecadação foi enviado até o dia 20?                                                                              | institucional — [REF-CONTRAN-918] art. 26 (dossiê §2 #1)                        | até o dia 20 do mês subsequente                                                                                         | Administração/Financeiro DETRAN-AM     | preparar e submeter antes do dia 20; comprovar envio                                                                                                                  |
| IND-DASH-202 | Relatório mensal de cartão débito/crédito (FUNSET)        | O relatório mensal para controle do repasse foi enviado?                                                                          | institucional — [REF-CONTRAN-918] art. 27 §6º (dossiê #2)                       | mensal                                                                                                                  | Administração/Financeiro DETRAN-AM     | submeter; **descumprimento tem consequência normativa expressa: suspensão da autorização de pagamento por cartão (§7º)** — único dever da tabela com sanção explícita |
| IND-DASH-203 | Publicação estatística mensal RENAEST (benchmark federal) | O ciclo mensal federal de publicação de estatísticas está atualizado, como referência para o próprio ciclo estadual?              | benchmark — [REF-CONTRAN-808] art. 8º V (dossiê #4)                             | mensal (dever federal, não estadual)                                                                                    | Gestor DETRAN (acompanhamento)         | não é ação do DETRAN-AM; usado apenas para comparação de padrão de periodicidade                                                                                      |
| IND-DASH-204 | Repasse estatístico anual ao sistema nacional             | O repasse anual de dados de sinistro ao sistema nacional foi feito, apesar de o prazo legal original estar extinto?               | `boat` — CTB art. 326-A §9º / [REF-LEI-13614-2018] (dossiê #5)                  | **estado "sem prazo definido"** — prazo de 1º de março revogado pela Lei 14.599/2023, sem substituto CONTRAN localizado | Coordenador de RENAEST / Gestor DETRAN | tratar como lacuna normativa explícita na UI (não como ausência silenciosa de dado); acompanhar publicação de regulamentação CONTRAN superveniente                    |
| IND-DASH-205 | Reuniões periódicas de coordenadores RENAEST              | As reuniões periódicas entre o coordenador estadual e o federal estão ocorrendo?                                                  | `boat` — [REF-CONTRAN-808] arts. 8º VIII, 9º VII (dossiê #6)                    | periódica, sem prazo numérico fixado                                                                                    | Coordenador de RENAEST estadual        | registrar ocorrência/pauta; sem SLA de vencimento — indicador de ocorrência, não de prazo                                                                             |
| IND-DASH-206 | Relatório anual de gestão da ouvidoria                    | O relatório anual foi produzido e publicado integralmente na internet?                                                            | `portal`/ouvidoria — [REF-LEI-13460] art. 15 (dossiê #7)                        | anual                                                                                                                   | Ouvidor / Gestor DETRAN                | preparar, publicar, arquivar comprovação de publicação                                                                                                                |
| IND-DASH-207 | Pesquisa de satisfação anual + ranking público            | A pesquisa de satisfação anual foi realizada e o ranking de reclamações publicado?                                                | `portal` — [REF-LEI-13460] art. 23 §§1º-2º (dossiê #10)                         | mínimo anual                                                                                                            | Ouvidor / Gestor DETRAN                | preparar, publicar, arquivar                                                                                                                                          |
| IND-DASH-208 | Notificação de vencimento da CNH                          | As notificações de CNH a vencer em 30 dias foram disparadas?                                                                      | `portal`/PEC — CTB art. 159 §12 (dossiê #13)                                    | recorrente, 30 dias de antecedência por condutor                                                                        | Administração / integração PORTAL      | garantir disparo automático; monitorar taxa de entrega                                                                                                                |
| IND-DASH-209 | Transparência ativa / dados abertos                       | O portal de transparência mantém busca, exportação em formato aberto, API legível por máquina, changelog e acessibilidade em dia? | `portal`/`dashboard` — [REF-LEI-12527] art. 8º §3º; [REF-LEI-14129] arts. 29-32 | checklist técnico contínuo, sem data única — auditado periodicamente                                                    | Administração técnica / Gestor DETRAN  | checklist recorrente (proposta: mensal); corrigir item ausente antes da próxima auditoria do TCE-AM                                                                   |

### C. SLA operacional (meta ou prazo do órgão, sem efeito jurídico automático)

| ID           | Nome                                                         | Pergunta que responde                                                                                             | Fonte                                                                        | Limiar/alerta                                                                   | Dono                                                               | Ação esperada                                                                                                                             |
| ------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| IND-DASH-301 | Resposta da ouvidoria ao usuário                             | As manifestações estão sendo respondidas em até 30 (+30) dias?                                                    | `portal` — [REF-LEI-13460] art. 16 (dossiê #8)                               | 30 dias, prorrogável 1x por igual período                                       | Ouvidor                                                            | responder ou prorrogar motivadamente antes do vencimento                                                                                  |
| IND-DASH-302 | Resposta de agente público à ouvidoria                       | Os agentes respondem às solicitações internas da ouvidoria em até 20 (+20) dias?                                  | interno — [REF-LEI-13460] art. 16 par. único (dossiê #9)                     | 20 dias, prorrogável 1x                                                         | Gestores de área (respondentes)                                    | responder a tempo de a ouvidoria cumprir seu próprio prazo (IND-DASH-301)                                                                 |
| IND-DASH-303 | Resposta a pedido de acesso à informação (LAI)               | Os pedidos LAI estão sendo respondidos dentro do prazo?                                                           | `portal` — [REF-LEI-12527] art. 11 §§1º-2º (dossiê #11)                      | 20 dias, prorrogável por mais 10                                                | Administração / SIC                                                | responder, ou justificar prorrogação/recusa fundamentada                                                                                  |
| IND-DASH-304 | Meta interna de defesa prévia (RAIT)                         | A defesa prévia está sendo decidida dentro da meta de qualidade anunciada (distinta do teto legal de decadência)? | `rait` — [REF-DETRANAM-SERVICOS], nota de [RN-RAIT-110]                      | meta: 30 dias                                                                   | Analista/Revisor (1º circuito)                                     | priorizar fila FIFO; nunca comunicar a meta como se fosse o teto legal (180/360d)                                                         |
| IND-DASH-305 | Meta interna de julgamento pela JARI (RAIT)                  | O julgamento na JARI está dentro da meta de 30 dias úteis anunciada?                                              | `rait` — [REF-DETRANAM-SERVICOS]                                             | meta: 30 dias úteis                                                             | Coordenador do pool JARI                                           | idem — meta ≠ teto legal de 24 meses (IND-DASH-102)                                                                                       |
| IND-DASH-306 | Designação da junta pelo órgão (PEC)                         | O órgão está designando a Junta Médica/Psicológica dentro do prazo legal (sem sanção expressa)?                   | `pec` — [RN-PEC-112] item 2                                                  | 15 dias úteis do requerimento; marcos 50/75/90% (proposta)                      | Gestor Clínica/PEC                                                 | designar a tempo — atraso aqui **estende** o prazo total e mantém o bloqueio de cadastro sobre o candidato ([RN-PEC-112] §Controvérsia c) |
| IND-DASH-307 | Decisão da junta (PEC)                                       | A junta está decidindo dentro dos 30 dias da designação?                                                          | `pec` — [RN-PEC-112] item 3                                                  | 30 dias da designação; marcos 50/75/90%                                         | Junta Médica/Psicológica                                           | decidir a tempo                                                                                                                           |
| IND-DASH-308 | Remessa de documentos ao CETRAN (PEC)                        | O órgão está remetendo os documentos do recurso ao CETRAN em até 20 dias úteis?                                   | `pec` — [RN-PEC-112] item 5                                                  | 20 dias úteis do recebimento do recurso; marcos 50/75/90%                       | Gestor Clínica/PEC                                                 | remeter a tempo                                                                                                                           |
| IND-DASH-309 | Junta Especial de Saúde — designação e decisão (PEC)         | Há pendências na 3ª instância sem prazo legal localizado?                                                         | `pec` — [RN-PEC-112] linha T-JES                                             | **sem prazo numérico** — indicador de idade da pendência, não de vencimento     | CETRAN/CONTRANDIFE (designação); Junta Especial de Saúde (decisão) | acompanhar como "sem prazo definido" explícito na UI; escalar por tempo absoluto decorrido (proposta operacional, não normativa)          |
| IND-DASH-310 | Transmissão à RENAEST por sinistro (BOAT)                    | Os sinistros encerrados localmente estão sendo transmitidos à RENAEST dentro do parâmetro mensal?                 | `boat` — [RN-BOAT-106], [WF-BOAT-001] T-BOAT-TRANSM                          | periodicidade mensal (parâmetro operacional, não teto legal)                    | Coordenador de RENAEST estadual                                    | consolidar e transmitir; sem consequência jurídica identificável em atraso, mas gera indicador de conformidade                            |
| IND-DASH-311 | Comparecimento pós-recolhimento de CNH por alcoolemia (TEAT) | O condutor compareceu dentro de 5 dias após o recolhimento da CNH?                                                | `teat` — [REF-CONTRAN-432] art. 10 §1º ([WF-TEAT-004]/[WF-TEAT-005] T-CNH5D) | 5 dias                                                                          | traffic-authority                                                  | se não comparecer, documento é encaminhado ao órgão de registro                                                                           |
| IND-DASH-312 | Notificação de remoção de veículo (TEAT)                     | A notificação ao proprietário/condutor ausente foi expedida em até 10 dias da remoção?                            | `teat` — CTB art. 271 §6º ([WF-TEAT-004] T-NOTIF10)                          | 10 dias                                                                         | Administração técnica / traffic-authority                          | expedir notificação (postal/edital/SNE)                                                                                                   |
| IND-DASH-313 | Teto de cobrança de despesas de depósito (TEAT)              | Algum veículo se aproxima do teto de 6 meses de cobrança de despesas de depósito?                                 | `teat` — CTB art. 271 §10 ([WF-TEAT-004] T-DEPOSITO6M)                       | 6 meses em depósito                                                             | Administração de depósito/patrimônio                               | revisar cobrança acumulada; sinalizar aproximação do teto de leilão                                                                       |
| IND-DASH-314 | Apuração de suspeita de concorrência de sessão (TEAT)        | Há lotes de AIT retidos em `SUSPEITO_CONCORRENCIA` há muito tempo, sem prazo legal de apuração?                   | `teat` — [WF-TEAT-001] `SUSPEITO_CONCORRENCIA`                               | **sem prazo definido** — indicador de idade da pendência (proposta operacional) | traffic-authority / auditor                                        | apurar; enquanto pendente, o lote não é processado — risco de acúmulo silencioso                                                          |

### D. Saúde técnica

| ID           | Nome                                                     | Pergunta que responde                                                                     | Fonte                                                                                                     | Limiar/alerta                                                                                                                                     | Dono                                   | Ação esperada                                                                                    |
| ------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| IND-DASH-401 | Lag do outbox / fila de eventos entre domínios           | Os eventos entre apps estão sendo publicados e consumidos sem atraso acumulado?           | todos os apps — infraestrutura de mensageria                                                              | proposta: alerta a partir de N minutos de lag (calibração do Owner)                                                                               | Administração técnica                  | investigar consumidor travado; reprocessar fila                                                  |
| IND-DASH-402 | Fila de sincronização offline (TEAT)                     | Qual a idade do lote pendente mais antigo ainda não sincronizado?                         | `teat` — [WF-TEAT-001]/[WF-TEAT-002], `MobileEncryptedStorePort`                                          | proposta: alerta a partir de N horas sem sincronizar (calibração do Owner)                                                                        | integration-operator / technical-admin | verificar conectividade do dispositivo; retransmitir                                             |
| IND-DASH-403 | Latência/erro do adapter SENATRAN por sistema nacional   | RENAVAM, RENACH, RENAINF, RENAEST e SNE estão respondendo dentro do esperado?             | `senatran-adapter`                                                                                        | proposta: taxa de erro / latência p95 por sistema (calibração do Owner)                                                                           | Administração técnica                  | escalar ao operador do sistema nacional afetado; ativar contingência local se disponível         |
| IND-DASH-404 | Integridade da cadeia de custódia de evidências          | As evidências (hash, retenção mínima) permanecem íntegras e disponíveis para reimpressão? | `teat` — [REF-SENATRAN-997] Anexo III b), `INV-EVIDENCE-001`                                              | violação de hash = crítico imediato; retenção abaixo do piso do dia da lavratura = alerta                                                         | Administração técnica / auditor        | investigar imediatamente qualquer divergência de hash — risco de defensabilidade jurídica do AIT |
| IND-DASH-405 | Pacotes normativos mobile expirados em campo (TEAT)      | Quantos dispositivos operam hoje com o pacote normativo vencido?                          | `teat` — [WF-TEAT-003], decisão do Owner E.29                                                             | qualquer dispositivo com pacote expirado em uso — sistema **não bloqueia** lavratura, mas deve avisar o agente e o painel deve contar a exposição | Administração técnica                  | publicar pacote atualizado; monitorar queda de conectividade em campo                            |
| IND-DASH-406 | Ocupação de faixas de numeração de AIT (TEAT)            | Alguma faixa está perto de se esgotar?                                                    | `teat` — [WF-TEAT-002] `AitNumberingRange`                                                                | proposta: alerta a 90% de `next_number` sobre `end_number` (calibração do Owner)                                                                  | agency-admin / technical-admin         | criar nova faixa antes do esgotamento — risco de bloqueio de lavratura se esgotar                |
| IND-DASH-407 | Dispositivos fora do par homologado (TEAT)               | Algum dispositivo está operando com versão não homologada?                                | `teat` — `Homologation`/`ApplicationVersion.homologation_id`, [WF-TEAT-003] nota de distinção RN-TEAT-003 | qualquer ocorrência = alerta                                                                                                                      | technical-admin                        | bloquear/atualizar o dispositivo                                                                 |
| IND-DASH-408 | Disponibilidade e latência das fontes de dado por painel | Cada painel do DASHBOARD sabe se sua própria fonte está disponível e a tempo?             | todos os apps — pré-condição de [WF-DASH-003]                                                             | por painel, conforme `latência aceitável` declarada em [WF-DASH-003]                                                                              | Administração técnica                  | ver [WF-DASH-003] — nunca exibir dado velho como atual                                           |

## KPIs do próprio painel

O DASHBOARD mede a si mesmo, para que a operação de monitoramento não vire um segundo ponto cego:

| KPI                                   | Definição                                                                                                                     | Meta proposta (calibração do Owner)                                                               |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Cobertura de indicadores              | % dos 42 indicadores do catálogo com fonte de dado efetivamente conectada (não apenas catalogada)                             | proposta: 100% dos indicadores tipo `legal-ceiling` no MVP; demais por onda                       |
| MTTA (tempo médio até reconhecimento) | tempo entre `DETECTADO` e `RECONHECIDO` em [WF-DASH-001]                                                                      | proposta: calibrar por severidade (N1/N2/N3/CRÍTICO), a definir                                   |
| MTTR (tempo médio até resolução)      | tempo entre `DETECTADO` e `ENCERRADO`                                                                                         | idem                                                                                              |
| % deveres cumpridos no prazo          | dos indicadores tipo `dever periódico`, % de ciclos que chegam a `ARQUIVADO` (comprovado) antes do vencimento — [WF-DASH-002] | proposta: 100% para os deveres com sanção expressa (IND-DASH-202); meta a calibrar para os demais |
| Frescor médio dos painéis             | % do tempo em que cada painel exibe dado dentro da latência aceitável declarada — [WF-DASH-003]                               | proposta: 95%, a calibrar por painel                                                              |

## Asks de capacidade

1. Cada app de domínio precisa publicar os eventos/leituras listados em §Interfaces — hoje nenhum
   contrato de dado formal existe entre os apps e o DASHBOARD. Ver `_intake/bpo-notes.md`
   §Contratos de dado para a proposta detalhada por app.
2. IND-DASH-105 (prescrição quinquenal) e IND-DASH-104 (paralisação) dependem de RAIT expor
   `data_pratica_ato` e `data_ultimo_ato_de_impulso` como campos de leitura — confirmar com o time
   RAIT se já existem.
3. IND-DASH-102/103 dependem da captura de `data_recebimento_jari`/`data_recebimento_cetran` — o
   gap do CETRAN (órgão externo ao DETRAN-AM) já está registrado em [RN-RAIT-111] §Gap
   operacional; sem integração formal, o DASHBOARD herda o mesmo ponto cego do RAIT.
4. Calibração de limiares técnicos (outbox lag, sync offline, latência de adapter, ocupação de
   faixa de numeração — IND-DASH-401/402/403/406) não tem base normativa; é decisão pura de
   capacidade/SRE do Owner — ver `_intake/bpo-notes.md` §Owner decisions.

## Decisões

- **2026-08-28** — Owner (`_meta/open-issues.md` DT-030): aprovadas em bloco as 9 propostas de
  calibração do BPO listadas em `_intake/bpo-notes.md` §Owner decisions — SLA de ACK por
  severidade, escada de IND-DASH-105 (propagada para [WF-RAIT-002] §4.4), piso de idade para
  indicadores sem prazo numérico, faixas de latência por tipo, periodicidade da auditoria de
  transparência (mensal), calendário dos relatórios anuais e meta de cobertura do MVP (100% do
  bloco `legal-ceiling`) ficam adotados como default. Os itens sem proposta concreta de número
  (limiares de saúde técnica, estratégia de auto-ocultação) têm o enfoque aprovado, com a
  calibração fina delegada a decisão técnica/SRE — deixam de bloquear por decisão de produto.

## Residual aberto após a rodada de endurecimento (2026-08-31)

Última das seis rodadas. As 31 regras seguem em `draft` — a lista de validação jurídica do
DASHBOARD não foi respondida (DT-042, compartilhada com o PORTAL).

**O achado desta rodada não foi um vazio, foi uma colisão.** Sendo a camada derivada, o risco do
DASHBOARD não é ter regra sem lugar — é ter regra que **discorda da fonte**. Era o caso:

| Deriva encontrada                                                                                                                                                                                                  | Estado                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| **Letras dos relógios do RAIT divergentes** — o painel usava B1/B2/C1/C2, onde `C` significava coisa **diferente** do `C` do RAIT, e nenhum desses valores é gravável em `rait_clock.clock_code` (`A`,`B`,`C`,`D`) | corrigido em [RN-DASH-131] |
| [RN-DASH-131] dizia "quatro relógios" no título e "os cinco relógios acima" duas seções depois                                                                                                                     | corrigido                  |
| Inventário de telas citava [WF-RAIT-002] §4.1-4.3, anterior ao relógio D                                                                                                                                           | corrigido em [IU-DASH-001] |
| Catálogo de deveres descrito como 13 linhas; [RN-DASH-120] tem 14                                                                                                                                                  | corrigido em [IU-DASH-001] |

Vocabulário obsoleto das outras rodadas — `evaded`, `CONDICIONADO`, "12x" — foi verificado e **não
aparece** no DASHBOARD.

### Pendências

| Item                                          | Onde                                 | Efeito                                                                                                                                                                            |
| --------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Limiar de célula para publicação agregada** | [RN-DASH-161], P-09 de [IU-DASH-001] | risco ALTO de reidentificação; exige parecer **antes** da primeira publicação (DT-029) — **respondido (DT-029; H.54)**: limiar 10 com supressão secundária; parecer valida depois |
| **Adesão do AM à Lei 14.129/2021**            | [RN-DASH-150], [UC-DASH-007]         | condiciona parte do módulo público (DT-066)                                                                                                                                       |
| **Periodicidade de transmissão ao RENAEST**   | [RN-DASH-113], [RN-DASH-133]         | dever sem relógio vigente; o painel exibe a lacuna em vez de inventar prazo (DT-017)                                                                                              |
| **Endpoint de ACK nos apps de origem**        | [WF-DASH-001], AC-DASH-002-5         | sem ele o reconhecimento é manual, e assim deve ser rotulado                                                                                                                      |
| **Parque de medidores**                       | [RN-DASH-173], AC-DASH-008-7         | o dever de publicidade é vigiável; o parque não foi levantado (DT-063) — **resolvido (DT-063)**: não utilizados hoje; indicador catalogado com fonte desconectada                 |

[UC-DASH-005] e [UC-DASH-007] ficaram em `reviewed` por dependerem do limiar de célula e da adesão
à 14.129 — o núcleo de vigilância (radar, alerta, deveres, trilha, integrações, calendário) está
`approved`.
