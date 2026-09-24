# Delivery review — CTG-0004a / ciclo 3 definitivo focal

Papel constitucional: **Auditor/REVIEWER independente**. Exceção do Owner: reviewer da família
CODEX nesta sessão. Revisão somente leitura; não edite arquivo e não use Git mutante.

## Candidato

- base commit: `408ab438fdd940eed6bd46296daad0a141d5a222`
- working-tree candidate digest: `dff4fcabbc1b8cce130589c73b2b9a50df45989554a3d8577be29b00bc736c`
- contrato: `docs/framework/arch/teat-mobile-contract.md`
- achados de entrada: `delivery-review-CTG-0004a-cycle-2-extraordinary.{md,json}`,
  somente `CTG4A-R2-F001…F009`
- sensores focais: os três `apps/teat/mobile/src/app/app.ctg4a-*.spec.ts`

## Escopo obrigatório e fechado

Reavalie somente se as correções deste último ciclo eliminam F001…F009 sem regressão direta nas
correções anteriormente aceitas. Inspecione e reproduza apenas:

1. runtime config, auth/login/MFA, bootstrap/coordinator e GuardContext reativo/logout;
2. request/response/cursor de sync contra o OpenAPI gerado;
3. assinaturas/headers reais e providers root de normativo, printer, store e worker;
4. bindings comportamentais de páginas por grupos do contrato, persistência real e negação
   `source_pending`, sem `Map` ou string nominal;
5. ErrorHandler/FieldShell, D-05 e BOAT renderizados/fail-closed;
6. readiness guard delegando ao serviço único;
7. bodycam dinâmico/diagnóstico e printer fail-closed, falha assíncrona, sucesso e receipt;
8. oito coleções cifradas, IndexedDB + AES-GCM e ausência de plaintext/localStorage;
9. qualidade dos três sensores: comportamento real, sem regex/metadata/doubles fracos.

Comando autorizado: somente os três specs focais. Pode executar typecheck/lint focal se necessário;
não execute suite ampla, build ou `pnpm check`. Confira `git diff --check` e que produção não tocou
tests/config/generated fora dos três novos specs e do runtime-config/index autorizado.

## Saída

Retorne `PASS`, `REVIEW` ou `FAIL`. Para cada finding, forneça id, severity, arquivo/linha, claim,
impacto e correção. `PASS` exige zero finding critical/high/medium dentro do escopo focal e evidência
de reprodução dos 11 testes. Não reabra itens fora de F001…F009 nem exija gate amplo.
