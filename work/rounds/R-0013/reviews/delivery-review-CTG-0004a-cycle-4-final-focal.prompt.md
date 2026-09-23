# Delivery review — CTG-0004a / ciclo 4 final focal

Papel constitucional: **Auditor/REVIEWER independente**. Exceção do Owner: reviewer da família
CODEX nesta sessão. Revisão somente leitura; não edite arquivo e não use Git mutante.

## Candidato

- base commit: `408ab438fdd940eed6bd46296daad0a141d5a222`
- product candidate digest: `f1c61d9ad8adfdb8dabdfbec7904f1fd7c989fc9dfda1140b08d2131377cf787`
- digest recipe: SHA-256 do `git diff --binary --no-ext-diff HEAD -- apps/teat/mobile
docs/framework/arch/teat-mobile-contract.md`, seguido, em ordem lexical, de `UNTRACKED <path>` e
  SHA-256 de cada arquivo não rastreado sob `apps/teat/mobile`
- contrato: `docs/framework/arch/teat-mobile-contract.md`
- review de entrada: `delivery-review-CTG-0004a-cycle-3-definitive-focal.{md,json}`
- sensores focais: os três `apps/teat/mobile/src/app/app.ctg4a-*.spec.ts`

## Escopo obrigatório e fechado

Reavalie somente os sete resíduos do ciclo 3 (`CTG4A-R2-F001`, `F002`, `F004`, `F005`, `F006`,
`F008` e `F009`) e confirme que as correções já aceitas em F003/F007 não regrediram diretamente.
Inspecione especificamente:

1. callback único `/auth-mfa`, lifecycle real, ordem callback → sessão → bootstrap, navegação e
   limpeza automática no logout;
2. primeiro cursor persistido antes do POST, reuso após falha, receipt snake_case e somente o 404
   `TEAT.SYNC_RECEIPT_NOT_FOUND` convertido em ausência;
3. operações reais de página, draft e queue completos, lifecycle/form/submit/i18n de AIT Review;
4. D-05 sem loader e BOAT ausente preservando destino seguro sem placeholder interno;
5. validade do snapshot e warning diagnóstico reais;
6. conflito/replay de storage preservando o registro original, inclusive após reinício;
7. sensores focais incompatíveis com falsos verdes, inclusive montagem real de componente.

Comando autorizado: somente os três specs focais. Pode executar typecheck/lint focal se necessário;
não execute suite ampla, build ou `pnpm check`. Confira `git diff --check` e recompute o digest pela
receita acima. A mudança adicional de `src/main.ts` que fixa `redirectUrl` em `/auth-mfa` faz parte
de F001.

## Saída

Retorne `PASS`, `REVIEW` ou `FAIL`. Para cada finding, forneça id, severity, arquivo/linha, claim,
impacto e correção. `PASS` exige zero finding critical/high/medium no escopo focal e reprodução de
18/18 testes. Não reabra itens fora de F001…F009 nem exija gate amplo.
