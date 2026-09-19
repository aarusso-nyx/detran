# ADR-0026: Exceção de entrega SQL2 e escala econômica da R-0007

## Status

Aceita pelo OWNER em 2026-09-17 para a campanha R-0007. É uma exceção
delimitada de aceitação, não uma alteração retroativa do parecer independente
nem uma mudança da política de produto da ADR-0024.

## Contexto

A revisão independente SQL2 do CTG-0001, candidato
`1fb5e9a0ea7182d252aeb570abb18df093078a2e2d0e8fb0464725a85e9e5943`,
retornou `REVIEW` válido (um high, quatro low). O high observa que o
`claim-next` ainda pode selecionar um caso legado com `legal_priority` nulo ou
desconhecido. A ADR-0024 continua a exigir a exclusão desses casos até
saneamento; o candidato não satisfaz essa exigência. TASK-0036/0037 foram
preparadas, mas não despachadas.

## Decisão do OWNER

Para concluir a R-0007 com economia de tokens, o OWNER dispensa **somente a
correção desse achado SQL2 de elegibilidade legada** como condição de avanço do
CTG-0001. O gate operacional desse candidato recebe aceitação excepcional do
OWNER; o veredito emitido pelo revisor permanece `REVIEW` no JSON, raw, bridge,
manifesto e registros históricos. Não se registrará um `PASS` independente
inexistente. TASK-0036/0037 ficam canceladas, sem executar nem reiniciar
contadores. A divergência de elegibilidade deve permanecer visível como risco
aceito e débito para saneamento posterior, não ser descrita como conformidade
com ADR-0024.

A dispensa não cobre a fixture de parâmetro, a aplicação transacional do DDL,
RLS/ACL, autorização do ator, imutabilidade, testes positivos de protocolo,
rollback, integridade dos dados ou gates de build/integração. Falha material
nessas áreas continua bloqueante. Achados pequenos e não estruturais podem ser
triados proporcionalmente, com registro explícito; não se enfraquecem testes
para produzir PASS.

Daqui em diante, até nova direção do OWNER, a escala das **novas chamadas** é:
maestro Sol; Architect Sol em vez de Astra; Inspector e Engineer Terra em vez de
Sol; chamadas antes em Terra usam Luna. Astra não será usado. O esforço de cada
papel permanece o vigente, salvo nova decisão. O Auditor Fable 5 continua
independente, quando um gate de revisão for de fato necessário. Registros de
execuções passadas preservam seus modelos e hashes; tarefas futuras serão
reconciliadas com a escala antes do despacho. Evitar revisões redundantes de
bytes inalterados e concentrar a reserva nos gates que provam a entrega.

## Consequências

### Exceção posterior de sequência para TASK-0021 (2026-09-17)

O OWNER autorizou uma única chamada Engineer 4/4 antes do RED integral da
TASK-0020: o 404 de `POST /v1/inf/rait/cases` vale apenas como RED da rota
ausente, não como prova de 403/400, vínculo ou efeitos. Os sensores policy/E2E
ficaram congelados nos hashes do prompt
`TASK-0021-V3-4-OWNER-SEQUENCE.md`. A autorização não conclui TASK-0020,
não reinicia contadores e não dispensa GREEN, revisão, commit ou merge. O
checkpoint subsequente de TASK-0021 identificou fixtures inválidas e Clock
opcional com fallback; ambos permanecem bloqueantes para a entrega.

### Continuações delimitadas após o checkpoint (2026-09-17)

O OWNER autorizou prosseguir com os limites necessários descritos no
checkpoint: uma continuação Inspector 7/7 para fixtures/sensores e uma
continuação Engineer 5/5 para Clock/GREEN, sem zerar contadores. A primeira
recongelou quatro sensores; a segunda reteve somente o delta fail-closed do
Clock e parou diante de 15 RED E2E e paths fora da allowlist. A autorização
não inclui alterar o runtime de identidade local, alargar a superfície DI
congelada, dispensar GREEN ou antecipar TASK-0022. Nova fronteira de
identidade/contexto exige decisão de escopo própria.

### Gate intermediário após o ciclo identidade/tempo (2026-09-17)

O OWNER autorizou o ciclo delimitado de identidade, contexto e fixture
temporal e decidiu **não repetir a revisão independente intermediária**.
Após o Engineer, o Inspector deve observar GREEN real, com testes coletados
no mesmo candidato e hashes congelados; só então TASK-0022 pode começar.
Essa decisão não transforma os pareceres históricos em PASS, não dispensa
gates de segurança ou regressão e não elimina o delivery-review independente
previsto após TASK-0022. Se a autenticação não local permanecer sem papéis
verificados, o GREEN local isolado não comprova prontidão de produção.

O CTG-0001 pode seguir para o preflight da fixture e ensaio de banco sobre os
bytes SQL2, identificado como **aceito por dispensa do OWNER**, não como SQL2
`PASS` independente. Uma mudança posterior de bytes de produto exige nova
avaliação do delta; esta exceção não transfere automaticamente para outro
candidato, PR ou branch integrado. O relatório de entrega e o PR devem divulgar
o risco residual e a distinção entre parecer e aceitação do OWNER.

## Referências

- [ADR-0024](ADR-0024-rait-legal-priority-owner-policy.md).
- `work/rounds/R-0007/reviews/attempt-2/ctg-0001-c4-od-v3-review-sql-2.json`.
- `work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-SQL2-ELIGIBILITY-CYCLE.md`.
