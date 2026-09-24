# CTG-0004a — tranche OD-T14: frescor online do bootstrap

**Papel Architect.** Fonte: Owner `1A-300-E2` (2026-09-23), ADR-0029 e linha
`teat.bootstrap.snapshot_max_age_seconds` do catálogo. Esta tranche não implementa E2 offline.

## Contrato

1. `MobileBootstrapService.read()` consulta `FieldDeps.parameters.get` para a chave aprovada,
   sem `agencyId`, com `on` igual à data UTC de `snapshot.capturedAt` (a mesma leitura do relógio).
   Nunca selecionar a vigência por segundo relógio que possa cruzar a meia-noite. O resultado
   utilizável é **somente** a linha tenant/TEAT vigente,
   `source_pending=false`, `value_type='int'`, `traffic_agency_id=null`, com `value_json`
   número inteiro seguro e positivo. A porta de parâmetros deve expor metadados suficientes
   para verificar essa identidade; não inferir metadados ausentes. Nenhuma linha de agência ou
   escopo `surface` vale como override. Falha de consulta, ausência ou valor inválido não usam
   constante de código como substituto.
2. Com linha utilizável, a resposta mantém `snapshot.capturedAt` do único relógio do serviço,
   fixa `snapshot.maxAgeSeconds` no número lido e `snapshot.validUntil` na soma exata em UTC,
   serializada ISO 8601. A soma precisa ser representável e estritamente posterior à captura;
   overflow ou instante inválido falha fechado.
3. Sem linha utilizável, manter `maxAgeSeconds:null` e `validUntil:null`. O gate mobile atual
   bloqueia snapshot sem prazo. Esta tranche não altera o significado das capacidades de estado
   persistido no servidor: elas não são prova local E2 e não liberam operação após `validUntil`.
4. O gate mobile continua estrito nesta tranche. A semântica E2 após 300 s dependerá de prova
   local verificável de grant, reserva, pacote e ausência de blocker conhecido, ligada à
   identidade tenant/agente/dispositivo/turno. ADR-0028 e OD-T16 ainda deixam algoritmo, formato
   de assinatura e âncora de confiança pendentes. Não simular assinatura válida nem aceitar
   `local-unsigned` como prova.

## Oráculos estreitos

- Inspector: linha 300 válida produz `capturedAt` fixo, `maxAgeSeconds:300` e prazo exato +300 s;
  dois horários próximos do limite não arredondam, sem leitura adicional do relógio; assertar
  `get(key,{on:<data UTC do capturedAt>})` em fronteira de data, sem `agencyId`.
- Inspector: ausência/rejeição, pendência, status/tipo/escopo/agência incorretos, zero,
  fracionário, string e overflow mantêm `null`/`null`; nenhum fallback hardcoded.
- Inspector: o retorno pré-turno `activeShift:null`/`session:null`, a ordem dos dez blockers,
  reservas/faixas e identidade já aprovados não mudam. Nenhum teste E2 positivo usa booleano
  ou fixture `local-unsigned` como prova offline.
- Engineer: alterar apenas porta/serviço/fixações necessárias a esses oráculos e manter os
  contratos públicos compatíveis; não editar testes. Review independente restrito após PASS.
