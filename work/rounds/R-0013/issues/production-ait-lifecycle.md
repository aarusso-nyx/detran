## Objetivo

Fechar o ciclo de vida AIT produtivo offline/online: seleção e retomada durável,
revisão monotônica, finalização/cancelamento atômicos, destino do número e
reconciliação backend. Escopo adiado de CTG-0004a/R-0013 pelo Owner (ADR-0033).

## Escopo

- `localEntityId` persistido, seletor transacional, trava por tenant/agente/
  dispositivo/turno, reserva e digest do primeiro comando; reprise idempotente
  devolve identidade/número originais; corrupção e divergência bloqueiam.
- Revisão local CAS monotônica, payload e pacote imutáveis onde exigido; `If-Match`
  usa somente ETag real do servidor. Finalização AIT exige E2, localização real e
  validador agregado; commit local atômico entre resultado, fila e lock.
- Cancelamento/abandono são eventos duráveis. Número fixado é consumido e não
  reutilizado automaticamente. Lock só é liberado por decisão autenticada aplicada
  atomicamente; backend reconcilia disposição auditável, conflitos e retries.
- Sync autenticado, recibos, recuperação de crash, reconciliação e isolamento do
  turno/tenant; nenhuma fila legada contorna as guardas.

## Critérios de aceite

- [ ] Máquina de estados versionada e contratos local/backend aprovados; testes
      de seleção, handoff, múltiplos drafts e um ativo por escopo.
- [ ] Testes de concorrência, reprise pós-crash, CAS, cursor parcial, digest
      divergente e reabertura comprovam identidade/revisão/número estáveis.
- [ ] Finalização e cancelamento só ocorrem com autoridade exigida; transação
      falha sem efeito parcial; fila e sync não aceitam AIT terminal/legado indevido.
- [ ] Toda reserva/número tem disposição consumida ou abandonada auditável;
      nenhum número é reaproveitado automaticamente, inclusive após conflito/retry.
- [ ] Backend valida ETag real, pacote, agregado e escopo e emite recibo
      verificável; testes local/backend/E2E e review independente verdes.

## Dependências

Validador AIT, E2, runtime Android e decisão institucional de autoridade de
cancelamento/recibos. Tranches estreitas de R-0013 são ponto de partida, não PASS
do ciclo produtivo. R-0017 é só candidato a round dedicado.
Gate de campo dependente: [#112](https://github.com/aarusso-nyx/detran/issues/112).
