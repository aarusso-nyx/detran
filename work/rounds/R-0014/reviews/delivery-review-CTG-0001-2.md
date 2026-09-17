# Prompt do reviewer — modo `delivery-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `portal-pwa` (rodada `R-0014`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `docs/framework/arch/portal-build-pack.md` — apenas a seção do WP `WP-P4…P6` e o "mapa entregável → definições"
4. `work/rounds/R-0014/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0014/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0014/reports/*.md`, o diff anexado abaixo e os
   arquivos por ele tocados.

## Rubrica (cada item é verificável; cite arquivo e linha)

| #   | Item                                                                                                                       | Aplica a |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Papel constitucional declarado e compatível com o que a tarefa toca (Art. 6, 10)                                           | ambos    |
| 2   | Leitura obrigatória fechada e suficiente: o worker consegue executar sem procurar nada fora da lista                       | prompt   |
| 3   | Fronteira de escrita disjunta entre tarefas simultâneas; `target_modules` corretos; nada de `git` para workers             | prompt   |
| 4   | Critérios de aceitação são comandos existentes (`package.json`) ou arquivos verificáveis, com resultado esperado explícito | ambos    |
| 5   | Nenhum valor inventado: prazos, papéis, estados, erros, rótulos vêm de documento canônico ou viram `source_pending`/`OD-*` | ambos    |
| 6   | Tríade respeitada (Architect → Inspector → Engineer) e testes escritos antes da implementação                              | ambos    |
| 7   | Gates não enfraquecidos (nenhum teste relaxado, nenhum `skip`, nenhum arquivo gerado editado à mão)                        | delivery |
| 8   | Vocabulário canônico (tokens de estado, timer, papel, erro) e i18n só na camada de rótulo                                  | ambos    |
| 9   | Fronteira nacional: nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003)                                  | delivery |
| 10  | ADR e OD citados onde a decisão foi tomada; decisões do steering §H respeitadas, não reabertas                             | ambos    |
| 11  | Entrega completa em relação ao critério: nada "deixado para depois" sem registro em §Fora de escopo                        | delivery |
| 12  | Parcimônia: o prompt não manda ler o repositório inteiro; esforço e modelo condizem com `model-ladder.md`                  | prompt   |
| 13  | Matrizes de autorização testam grants positivos e negativas exaustivas para papéis canônicos omitidos; nada por analogia   | ambos    |

## Veredito

- **PASS**: nenhum achado de severidade `high`; achados `low` viram notas.
- **REVIEW**: pelo menos um achado `high` corrigível pelo maestro ou pelo worker sem mudar o plano.
- **FAIL**: o plano ou a entrega contradiz uma definição canônica, uma decisão do Owner, uma ADR ou
  a Constituição; ou a fronteira de escrita foi violada.

Ciclos: o **primeiro** ciclo de cada item é **exaustivo** — liste todos os achados de uma vez. Nos ciclos
seguintes do mesmo item, avalie **somente** as correções dos achados anteriores; um achado novo sobre
texto que não mudou só é admitido se for `FAIL` por definição (contradição canônica, decisão do Owner,
ADR, Constituição ou fronteira de escrita) e deve dizer explicitamente por que não foi levantado antes
(ajuste R-0006).

## Saída (JSON, e nada mais)

```json
{
  "mode": "delivery-review",
  "round": "R-0014",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0014/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Material anexado pelo maestro

**Segundo ciclo — restrito aos dois achados de `delivery-review-CTG-0001`** (orchestra/README.md
§5). Avalie somente estas correções; um achado novo sobre texto inalterado só é admitido se for
`FAIL` por definição e deve dizer por que não foi levantado antes.

Adenda **A3** (`work/rounds/R-0014/plan.md` §Adendas) e iteração 2 de TASK-0004
(`work/rounds/R-0014/reports/TASK-0004-iteration-2.md`):

1. (item 5, `apps/portal/web/ngsw-config.json`) o `dataGroup` `documentos-offline` saiu por
   completo — nenhum `maxAge` fixo; `ngsw-config.json` só tem `assetGroups`. O cache offline de
   CNH-e/CRLV-e é entregue no CTG-0003 pelo `OfflineDocumentStore` (validade do documento) e a
   forma do `dataGroup`, se houver, é decidida em OD-P51 antes.
2. (item 5, `apps/portal/web/src/app/core/service-catalog.facade.ts`) o token
   `servico_nao_catalogado` e a constante `SERVICE_NOT_CATALOGUED` foram removidos; serviço ausente
   do catálogo devolve `{ status: 'unavailable' }` **sem** `reason` (o motivo só existe quando o
   catálogo o dá — `unavailableReason`). README ajustado. Nenhum spec mudou.

Gates re-executados pelo maestro após A3: `pnpm --filter @detran/portal-web typecheck|lint|test|build`
→ OK, **263/263**; `pnpm verify:parameter-catalogue` → OK (14 i18n namespaces); `pnpm format:check`
→ OK. (`pnpm check` completo já era EXIT 0 antes de A3, que só removeu configuração e um token.)

### Veredito anterior (delivery-review-CTG-0001.json)

```json
{
  "mode": "delivery-review",
  "round": "R-0014",
  "verdict": "FAIL",
  "findings": [
    {
      "severity": "high",
      "item": 5,
      "file": "apps/portal/web/ngsw-config.json",
      "line": 34,
      "claim": "`maxAge: \"1d\"` inventa um prazo e contradiz M14 do plano, que fixa `maxAge = validade retornada`; OD-P51 ainda é só proposta, não decisão canônica.",
      "fix": "não introduzir teto fixo sem decisão: implementar a validade canônica ou registrar e aprovar uma OD/valor de catálogo antes de configurar o service worker."
    },
    {
      "severity": "high",
      "item": 5,
      "file": "apps/portal/web/src/app/core/service-catalog.facade.ts",
      "line": 21,
      "claim": "O token interno `servico_nao_catalogado` não consta no catálogo canônico de motivos nem foi registrado como `source_pending` ou OD; a UI passa a produzi-lo para serviço ausente.",
      "fix": "remover a fabricação do motivo e propagar o caso para tratamento canônico, ou registrar a decisão/fonte antes de materializar o token."
    }
  ],
  "notes": []
}
```

### Diff das correções (ngsw-config.json, service-catalog.facade.ts, README.md) em relação ao diff revisado no ciclo 1

```diff
--- ngsw-config.json (ciclo 1) → (ciclo 2): bloco "dataGroups": [ { "name": "documentos-offline", "urls": ["/v1/portal/documents/cnh", "/v1/portal/vehicles/*/crlv-e"], "cacheConfig": { "strategy": "freshness", "maxSize": 2, "maxAge": "1d", "timeout": "5s" } } ] REMOVIDO.
--- service-catalog.facade.ts (ciclo 1) → (ciclo 2): removidas as linhas
-export const SERVICE_NOT_CATALOGUED = 'servico_nao_catalogado';
-export const NOT_CATALOGUED: ServiceAvailability = Object.freeze({ status: 'unavailable', reason: SERVICE_NOT_CATALOGUED });
+export const NOT_CATALOGUED: ServiceAvailability = Object.freeze({ status: 'unavailable' });
```

### Estado atual dos dois arquivos

```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/index.html",
          "/manifest.webmanifest",
          "/*.css",
          "/*.js",
          "!/runtime-config.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": ["/**/*.(svg|png|webp|woff2)"]
      }
    }
  ]
}
```

```ts
// ServiceCatalogFacade (plan.md M8/M15; adenda A3): `GET /v1/portal/services` (Carta de
// Serviços, rota pública) cacheado em memória por sessão do app → `availability(serviceKey)`.
// Serviço ausente do catálogo → `{ status: 'unavailable' }` sem motivo (o motivo só existe
// quando o catálogo o dá — `unavailableReason`); o backend marca `unavailable`/
// `partially_available` com `unavailableReason` e `alternativeChannelNote` (padrão "bloqueada por
// decisão": a UI nunca simula resultado). Token abstrato substituível por `useValue` nos testes.
import { Injectable, inject } from '@angular/core';
import { PortalClient, type ServiceCatalogItem } from '../data/portal.client';

export type ServiceAvailabilityStatus =
  'available' | 'partially_available' | 'unavailable';

export interface ServiceAvailability {
  readonly status: ServiceAvailabilityStatus;
  /** Token do catálogo (`unavailableReason`); nunca exibido cru — vai em `data-token`. */
  readonly reason?: string;
  /** Texto cidadão do catálogo (`alternativeChannelNote`). */
  readonly alternativeChannelNote?: string;
}

/** Serviço fora da Carta de Serviços: indisponível, sem motivo a exibir. */
export const NOT_CATALOGUED: ServiceAvailability = Object.freeze({
  status: 'unavailable',
});

export function toAvailability(item: ServiceCatalogItem): ServiceAvailability {
  return {
    status: item.availability ?? 'unavailable',
    reason: item.unavailableReason,
    alternativeChannelNote: item.alternativeChannelNote ?? undefined,
  };
}

@Injectable({
  providedIn: 'root',
  useFactory: () => inject(PortalServiceCatalogFacade),
})
export abstract class ServiceCatalogFacade {
  abstract availability(serviceKey: string): Promise<ServiceAvailability>;
}

@Injectable({ providedIn: 'root' })
export class PortalServiceCatalogFacade extends ServiceCatalogFacade {
  private readonly client = inject(PortalClient);
  private catalog: Promise<ReadonlyMap<string, ServiceCatalogItem>> | null =
    null;

  /** Carta de Serviços completa (cache por sessão do app). */
  items(): Promise<ReadonlyMap<string, ServiceCatalogItem>> {
    this.catalog ??= this.client.services().then(
      (items) =>
        new Map(
          items
            .filter((item) => typeof item.serviceKey === 'string')
            .map((item) => [item.serviceKey as string, item]),
        ),
      (error: unknown) => {
        this.catalog = null;
        throw error;
      },
```
