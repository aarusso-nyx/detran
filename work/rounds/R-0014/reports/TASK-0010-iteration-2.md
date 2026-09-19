Tarefa: TASK-0010 (iteração 2)

Papel: Inspector.

Implementei o seed compartilhado e separei os critérios em casos individuais. Typecheck e Prettier passaram.

Validações:

- `pnpm --filter @detran/app typecheck` → 0 erros.
- Prettier → OK nos quatro arquivos.
- `portal-journeys`: `Test Files 1 failed (1)` / `Tests 4 failed | 48 passed (52)` (log anterior à última correção de fixture).
- `portal-national-mock`: `Test Files 1 failed (1)` / `Tests 7 failed | 10 passed (17)`.
- Não rodei a suíte completa nem `portal-payload-lint` antes do limite da tarefa.

Vermelhos observados, todos apontam comportamento/fixtures ainda pendentes de TASK-0011, exceto C-4-11/12/32/45, que requerem nova confirmação após a última alteração local:

- C-4-55, 60, 61 → §2–3: fixtures Prata ausentes no mock nacional.
- C-4-58, 59, 64 → §4–5: respostas e persistência SNE/push ainda não atendem o contrato.
- C-4-63 → §3: CRLV retorna 503 nacional antes do 422 canônico.
- C-4-11, 12, 32, 45 → precisam rerun após inserção de timeline/remoção da leitura SSE bloqueante; não classifico como prontas.

Matriz:

```text
C-4-01 → portal-journeys → GET AIT Prata cidadão
C-4-02 → portal-journeys → catálogo defesa M15
C-4-03 → portal-journeys → POST defesa 422
C-4-04 → portal-journeys → defesa sem protocolo
C-4-05 → portal-journeys → AIT antes da indicação
C-4-06 → portal-journeys → catálogo indicação M15
C-4-07 → portal-journeys → POST indicação 422
C-4-08 → portal-journeys → indicação sem transferência
C-4-09 → portal-journeys → lista de pedidos cidadã
C-4-10 → portal-journeys → detalhe de pedido
C-4-11 → portal-journeys → decisão sem transição
C-4-12 → portal-journeys → evento só do sujeito
C-4-13 → portal-journeys → CETRAN M15
C-4-14 → portal-journeys → AITs do Bronze
C-4-15 → portal-journeys → detalhe Bronze
C-4-16 → portal-journeys → pontos do AIT
C-4-17 → portal-journeys → resumo de pontos
C-4-18 → portal-journeys → leitura SNE
C-4-19 → portal-journeys → efeitos SNE
C-4-20 → portal-journeys → ordem adapter SNE
C-4-21 → portal-journeys → cancelamento local SNE
C-4-22 → portal-journeys → SNE já aderido
C-4-23 → portal-journeys → chave SNE divergente
C-4-24 → portal-journeys → CNH cachedAt
C-4-25 → portal-journeys → veículos CDT
C-4-26 → portal-journeys → clearance 503
C-4-27 → portal-journeys → CRLV indisponível
C-4-28 → portal-journeys → falha CNH sem troca
C-4-29 → portal-journeys → cache nacional
C-4-30 → portal-journeys → mock desligado
C-4-31 → portal-journeys → lista sinistros
C-4-32 → portal-journeys → detalhe sinistro
C-4-33 → portal-journeys → sinistro indisponível
C-4-34 → portal-journeys → lista exames
C-4-35 → portal-journeys → legalLabel de exame
C-4-36 → portal-journeys → junta indisponível
C-4-37 → portal-journeys → OD-P19
C-4-38 → portal-journeys → manifestação anônima
C-4-39 → portal-journeys → protocolo/data
C-4-40 → portal-journeys → manifestação autenticada
C-4-41 → portal-journeys → avaliação elegível
C-4-42 → portal-journeys → manifestação independente
C-4-43 → portal-journeys → AIT pagamento
C-4-44 → portal-journeys → draft If-Match
C-4-45 → portal-journeys → submit M17
C-4-46 → portal-journeys → pagamento sem quitação
C-4-47 → portal-journeys → pagamento sem evento
C-4-48 → portal-journeys → identity/me Prata
C-4-49 → portal-journeys → LGPD permitida
C-4-50 → portal-journeys → LGPD completa pendente
C-4-51 → portal-journeys → LGPD correção pendente
C-4-52 → portal-journeys → sem gov.br real
C-4-53 → portal-national-mock → portas reais
C-4-54 → portal-national-mock → mock inválido 503
C-4-55 → portal-national-mock → fixture Prata mock
C-4-56 → portal-national-mock → ordem SnePort
C-4-57 → portal-national-mock → SNE upstream
C-4-58 → portal-national-mock → códigos SNE
C-4-59 → portal-national-mock → idempotência SNE/push
C-4-60 → portal-national-mock → normalização CNH
C-4-61 → portal-national-mock → UUIDv5 veículo
C-4-62 → portal-national-mock → clearance sem invenção
C-4-63 → portal-national-mock → CRLV sem bytes
C-4-64 → portal-national-mock → upsert push
C-4-65 → portal-national-mock → VAPID pendente
C-4-66 → portal-payload-lint → SSE sujeito
C-4-67 → portal-payload-lint → SSE sem internos
C-4-68 → portal-payload-lint → it.each tokens proibidos
C-4-69 → portal-payload-lint → paradas M15/OD
C-4-70 → portal-payload-lint → integridade app
C-4-71 → portal-national-mock → CNH B null
C-4-72 → portal-national-mock → validade ISO
C-4-73 → portal-national-mock → restrictions vazias
C-4-74 → portal-national-mock → vehicleId consistente
```

Limitação relevante: as chaves canônicas `…070400009` e `…070e00001` já existem no tenant seed `a001` e são PKs globais; o helper usa os equivalentes locais `…e09`/`…e1` para não alterar dados do tenant canônico.