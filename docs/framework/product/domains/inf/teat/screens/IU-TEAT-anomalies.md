---
id: IU-TEAT-anomalies
title: Anomalias
status: draft
apps: [teat]
updated: 2026-09-21
---

# Anomalias

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: matriz web de paridade; [UC-TEAT-012]; [RN-TEAT-001]; [RN-TEAT-111]; [ARCH-TEAT-ERRORS] §§1,3.
- Identidade: screenId `anomalies`, uxCode `UX-WEB-084`, grupo `audit`, rota `/ux/web/anomalies`; implementação `gap` / `official-angular-shell`.
- Papéis permitidos: `auditor`, `traffic-authority`, `technical-admin`, `agency-admin`.
- O console usa o backend unificado; consultas nacionais permanecem atrás de packages/senatran-adapter.

## Contrato transcrito

- Objetivo: expor suspeitas de concorrência e falhas de integridade/duplicidade para investigação autorizada, com seus efeitos sobre o processamento.
- Campos e dados: agente, dispositivos e intervalo envolvidos na concorrência; registros afetados, contexto de erro/conflito e incidente de handoff quando declarado. Possível duplicidade correlaciona placa, local, horário, enquadramento e agente/operação conforme [RN-TEAT-001].
- Ações/comandos: consultar a ocorrência, comparar a atuação na linha do tempo do agente e examinar os eventos de auditoria; a decisão de legitimidade pertence ao procedimento de apuração da autoridade.
- Validações e estados: `SUSPEITO_CONCORRENCIA` bloqueia antes da validação; apuração legítima libera para `RECEBIDO`, irregularidade confirmada leva a `REJEITADO`. Reenvio idempotente do mesmo ato não é confundido com concorrência de dispositivos. Nenhuma ocorrência expira sem decisão.
- Critérios e fonte fechada: AC-TEAT-012-2/3/4/5 e [RN-TEAT-111] exigem bloqueio e apuração, sem inventar valor para a janela. TEAT.SYNC_INTEGRITY_ERROR e TEAT.SYNC_CONCURRENCY_SUSPECT conservam os contextos distintos do catálogo de erros; alerta de duplicidade não constitui rejeição automática.

## Navegação autoritativa

1. `agent-timeline`
2. `audit-events`
3. `bi-quality`

Cada destino vem da matriz web; guardas de autenticação, tenant e papel são aplicados antes da transição.

## Estados vazios, erro e acessibilidade

- Estado vazio, erro e carregamento usam o kit STYNX, preservando o código retornado pelo backend.
- Campos de formulário exibem erro inline; estado inválido recarrega o recurso; indisponibilidade nacional não é convertida em dado local.
- WCAG 2.1 AA: foco, rótulo acessível, feedback de ação e navegação por teclado.
