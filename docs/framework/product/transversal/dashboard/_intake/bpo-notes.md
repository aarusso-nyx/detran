---
id: BPO-NOTES-DASHBOARD
title: Notas de BPO — DASHBOARD (decisões do Owner, seams com cada app, contratos de dado propostos)
status: draft
apps: [dashboard]
sources:
  [
    APP-DASHBOARD,
    WF-DASH-001,
    WF-DASH-002,
    WF-DASH-003,
    RESEARCH-DOSSIER-DASHBOARD,
  ]
updated: 2026-08-24
---

## Owner decisions — limiares e calibrações pendentes

Nenhum destes itens tem base normativa própria; todos são propostas de BPO que precisam de
decisão explícita do Owner antes de `WF-DASH-001..003` e o catálogo de indicadores passarem de
`draft` para `reviewed`, no mesmo padrão já usado para [WF-RAIT-002] §4 (`_meta/steering.md` A.1).

1. **SLA de reconhecimento (ACK) por nível de severidade** ([WF-DASH-001]) — quanto tempo até um
   alerta `NOTIFICADO` sem ACK vira `ESCALONADO`? Proposta inicial de trabalho (não confirmada):
   N1 = 24h úteis, N2 = 8h úteis, N3 = 2h úteis, CRÍTICO/`CRITICO_EXTINCAO` = imediato (sem
   janela de tolerância, notificação simultânea a todos os níveis da cadeia).
2. **Limiares técnicos de saúde técnica** (IND-DASH-401/402/403/406) — lag de outbox, idade
   máxima tolerável de lote offline não sincronizado, latência/erro por sistema SENATRAN,
   percentual de ocupação de faixa de numeração que dispara alerta. Não há norma aplicável — é
   decisão pura de capacidade/SRE.
3. **Escada de alerta para IND-DASH-105** (prescrição quinquenal, RAIT) — [RN-RAIT-113] caput
   define o teto (5 anos) mas [WF-RAIT-002] não calibrou marcos de alerta para este relógio
   específico (só para a paralisação de 3 anos). Recomenda-se ao Owner decidir, em conjunto com o
   time RAIT, se replica a mesma disciplina 50/75/90% já aprovada para os demais relógios.
4. **Idade de pendência para indicadores sem prazo numérico** (IND-DASH-309 Junta Especial de
   Saúde; IND-DASH-314 SUSPEITO_CONCORRENCIA) — sem base legal para um marco de alerta, propõe-se
   usar a duração mediana histórica de casos análogos como referência de "anormal", uma vez que
   houver dados suficientes; até lá, sugestão de piso arbitrário de 60 dias como primeiro alerta
   informativo (não normativo).
5. **Latências aceitáveis por painel** ([WF-DASH-003]) — a tabela de faixas por tipo de indicador
   no workflow é proposta; valores exatos por painel individual (ex. "IND-DASH-102 precisa de
   leitura a cada 15 minutos, ou a cada hora?") dependem de custo de integração real, a levantar
   com cada time de app.
6. **Estratégia padrão para indicadores desatualizados por muito tempo** ([WF-DASH-003]) — quando
   um número `DESATUALIZADO_MARCADO` deve passar a ser ocultado também, mesmo nos blocos B/C/D.
7. **Periodicidade de auditoria do checklist de transparência ativa** (IND-DASH-209) — proposta
   de BPO: mensal, alinhado ao padrão de periodicidade que o próprio corpus já usa para RENAEST
   ([REF-CONTRAN-808] art. 8º V).
8. **Data-limite operacional para relatórios anuais sem data fixada em norma** (IND-DASH-206
   ouvidoria, IND-DASH-207 pesquisa de satisfação) — proposta de BPO: alinhar ao encerramento do
   exercício fiscal (31/12 → prazo de preparação em janeiro/fevereiro do ano seguinte), mas é
   decisão de calendário administrativo do Owner, não normativa.
9. **Meta de cobertura de indicadores para o MVP** ([APP-DASHBOARD] §KPIs) — proposta: 100% dos
   11 indicadores do bloco `legal-ceiling` no primeiro incremento (são os de maior exposição
   institucional — mesma priorização já usada por LEGAL para RAIT/PEC), demais blocos por onda.

## Seams com cada app — o que falta para o DASHBOARD existir de fato

Hoje **nenhum** dos quatro apps de domínio publica eventos ou expõe leituras formalmente
contratadas para o DASHBOARD — todo o desenho acima pressupõe que esses contratos venham a
existir. Prioridade sugerida, por exposição institucional (maior primeiro):

| App                                       | Seam faltante                                                                                                                                                                        | Indicadores afetados                  | Prioridade                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `rait`                                    | evento de mudança de faixa da escada de SLA ([WF-RAIT-002] §4); leitura de `data_recebimento_jari`/`data_recebimento_cetran`/`data_pratica_ato`/`data_ultimo_ato_de_impulso`         | IND-DASH-101..105                     | alta — bloco de maior exposição jurídica de todo o corpus                                          |
| `pec`                                     | evento de transição do ciclo de junta ([WF-PEC-002]); leitura de prazos em curso por instância; sinalização de pendências sem prazo (Junta Especial de Saúde)                        | IND-DASH-106..109, 306..309           | alta — mesma classe de risco (preclusão)                                                           |
| `teat`                                    | leitura de fila de sincronização offline; estado de homologação SENATRAN; validade de pacote normativo em campo; ocupação de faixas de numeração; estado das medidas administrativas | IND-DASH-108..111, 311..314, 401..407 | média-alta — volume operacional alto, mas sem extinção de direito de terceiro na maioria dos casos |
| `boat`                                    | evento de fechamento local; estado da cascata de validação ([WF-BOAT-003]); status de envio à RENAEST                                                                                | IND-DASH-203..205, 310                | média                                                                                              |
| `portal`                                  | volume/tempo médio/satisfação por serviço; pedidos LAI em curso; manifestações de ouvidoria em curso                                                                                 | IND-DASH-206..209, 301..303           | média                                                                                              |
| `senatran-adapter`                        | latência/taxa de erro por sistema nacional                                                                                                                                           | IND-DASH-403                          | alta — é, ele mesmo, pré-condição de confiabilidade de vários outros indicadores                   |
| institucional (fora de qualquer app hoje) | fluxo de preparação/comprovação de arrecadação FUNSET, relatório de cartão                                                                                                           | IND-DASH-201, 202                     | alta — único dever com sanção automática expressa (202)                                            |

## Contratos de dado — proposta inicial (a validar com cada time técnico)

Formato proposto por seam, não vinculante — ponto de partida para negociação com cada time:

- **Evento de mudança de estado**: `{indicador_id, caso_id, estado_anterior, estado_novo,
timestamp, base_legal}` — publicado pelo app de origem sempre que um caso cruza um marco
  relevante (mudança de faixa, novo prazo aberto, prazo vencido).
- **Leitura periódica (fallback)**: quando o app de origem ainda não publica evento, o DASHBOARD
  faz leitura direta (API de consulta), com o selo de frescor de [WF-DASH-003] refletindo essa
  degradação — nunca tratado como equivalente a um evento em tempo real.
- **Evento de ciência (ACK)**: nenhum dos quatro apps expõe hoje um endpoint de "reconhecimento"
  formal — até que existam, o Operador de monitoramento registra o ACK manualmente no DASHBOARD,
  com nota explícita de que é um registro de transição, não uma confirmação de origem.
- **Evento de comprovação de dever periódico**: `{dever_id, periodo, evidencia_uri,
timestamp, dono}` — hoje inexistente para qualquer um dos 9 deveres do bloco B; proposta de
  formato mínimo de arquivo de evidência (protocolo, captura, hash).

## Decisões

Nenhuma decisão de steering registrada ainda — todos os itens acima aguardam rodada de steering
com o Owner, no mesmo padrão já usado para RAIT (`_meta/steering.md` §A) e PEC.
