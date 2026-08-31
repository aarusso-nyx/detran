---
id: UC-DASH-006
title: Técnico investiga fila de integração parada
status: approved
apps: [dashboard, teat]
sources: [WF-DASH-001, WF-DASH-003, WF-TEAT-001, WF-TEAT-002]
updated: 2026-08-31
---

## Ator e objetivo

Administração técnica quer diagnosticar rapidamente por que um indicador de saúde técnica
(outbox, sincronização offline, adapter SENATRAN) está degradado, e agir antes que a degradação
vire um problema de negócio (ex. AITs presos em fila, faixa de numeração esgotando).

## Pré-condições

- Um indicador do bloco D ([APP-DASHBOARD] §Catálogo) está em alerta — ex. IND-DASH-402 (fila de
  sincronização offline) com lote pendente há mais que o limiar calibrado.

## Fluxo principal

1. Técnico recebe a notificação do alerta ([WF-DASH-001], `NOTIFICADO`).
2. Técnico reconhece o alerta (`RECONHECIDO`) e abre o detalhe: qual fila, qual dispositivo/
   agente, idade do lote mais antigo, histórico de tentativas de sincronização.
3. Técnico verifica o selo de frescor da própria leitura ([WF-DASH-003]) — confirma que o número
   exibido não está, ele mesmo, desatualizado antes de agir sobre ele.
4. Técnico investiga a causa no app de origem (TEAT): conectividade do dispositivo, erro de
   validação do lote, colisão de faixa de numeração.
5. Técnico corrige no app de origem (retransmite lote, libera dispositivo, cria nova faixa de
   numeração — [WF-TEAT-002]).
6. Sistema detecta a normalização e move o alerta para `VERIFICADO` → `ENCERRADO`.

## Fluxos alternativos / exceções

- **Causa é indisponibilidade da própria fonte, não da fila em si**: alerta correto é
  IND-DASH-408 (disponibilidade da fonte), não o indicador de negócio — técnico redireciona a
  investigação para a integração, não para o conteúdo da fila.
- **Faixa de numeração próxima de esgotar durante a investigação** (IND-DASH-406): técnico cria
  nova faixa proativamente, evitando bloqueio de lavratura em campo.
- **Fila parada por adapter SENATRAN fora do ar** (IND-DASH-403): técnico escalona ao operador do
  sistema nacional afetado; sem contingência local disponível, o alerta permanece `EM_TRATAMENTO`
  até a normalização externa — DASHBOARD não pode "resolver" uma indisponibilidade de terceiro.

## Pós-condições

- Fila normalizada, alerta encerrado com evidência de causa raiz registrada na trilha
  ([UC-DASH-004]).

## Critérios de aceitação

**AC-DASH-006-1 — o técnico confere o frescor antes de agir sobre o número**

- **Dado** um alerta de fila parada
- **Quando** o detalhe é aberto
- **Então** o selo de frescor da própria leitura é exibido ([WF-DASH-003]) — agir sobre um número
  desatualizado é o modo de falha específico deste caso de uso

**AC-DASH-006-2 — o TEAT é vigiado por validade que caduca, não por prazo processual**

- **Dado** os indicadores do TEAT
- **Quando** são classificados
- **Então** seguem as famílias de [RN-DASH-134] — homologação, verificação metrológica, sessão
  exclusiva, integridade do talão, prazos de custódia — cujo vício é **retroativo e silencioso**:
  atinge todos os autos do período, e se descobre em contencioso

**AC-DASH-006-3 — sessão concorrente é bloqueio, não alerta**

- **Dado** registros concorrentes do mesmo agente
- **Quando** o painel os mostra
- **Então** reflete que o app **não os processa** ([RN-TEAT-111]) e que a apuração pela autoridade
  é obrigatória — o painel não sugere que basta observar

**AC-DASH-006-4 — a correção acontece no TEAT**

- **Dado** uma causa identificada
- **Quando** o técnico corrige
- **Então** age no app de origem ([RN-DASH-101]); o alerta encerra por detecção da normalização,
  não por ação no painel

**AC-DASH-006-5 — o RENAEST é vigiado por conformidade estrutural e latência**

- **Dado** os indicadores do BOAT
- **Quando** são montados
- **Então** medem conformidade e latência ([RN-DASH-133]) — e, onde não há prazo legal vigente, o
  painel diz "sem prazo normativo" em vez de inventar um

## Regras aplicáveis

- [WF-DASH-001] (ciclo do alerta)
- [WF-DASH-003] (frescor da própria leitura, antes de confiar nela para diagnosticar)
- [WF-TEAT-001], [WF-TEAT-002] (mecânica de origem da fila investigada)
