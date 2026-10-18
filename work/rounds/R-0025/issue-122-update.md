# Issue #122 — atualização proposta (não publicada)

R-0025 retomada do checkpoint orchestra/rait-web-wiring, main reconciliada por
merge5809388b, A-C3-01 aplicada. Primeiro PR autorizado: admissibilidade direta
PROTOCOLADO→triage→checklist→admit/reject, conforme escolha explícita do Owner.

Quatro tarefas de análise/contrato históricas preservadas. TASK-0024…0027 novas
para fontes geradas, sensores, backend e frontend. Primeiro pacote não entrega os
64 comandos nem a JW-01 completa; claim/instrução/minuta ficam para depois.

OD-R25-016 registra divergência de sequência; OD-R25-017 registra limite do
GET/RLS tenant versus acesso individual sem fonte. Sem nova permissão/transição.
Checks afetados, root pnpm check, doctor e revisão cruzada PASS. Browser local
admit/reject PASS com sessão sintética; IdP real e escopo individual sem prova.
TASK-0024…0027 completed no recorte; PR #193 aberto, merge/close não autorizados.
