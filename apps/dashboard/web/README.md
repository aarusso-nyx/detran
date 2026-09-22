# apps/dashboard/web — console de monitoramento (@detran/dashboard-web)

Console interno do DETRAN-AM sobre `@detran/ui` e STYNX 1.3.1 (Angular 22). Toda rota vive sob
`/monitoramento`; o manifesto de rotas (`src/app/app.route-manifest.ts`) é a transcrição de
`work/rounds/R-0016/route-manifest.md` e é dele que saem guardas, títulos, `data.screen` e menu.

## Blocos de indicadores

Cada tela declara os blocos que exibe (coluna `blocks` do manifesto). O bloco decide a
estratégia do selo de frescor: no bloco A o valor é **ocultado** quando a leitura não vale; nos
demais é **marcado** ([WF-DASH-003]).

### A — Legal-ceiling

`/monitoramento` (D-01) · `/monitoramento/alertas/:id` (D-02) · `/monitoramento/radar/rait`
(D-03) · `/monitoramento/radar/pec` (D-04) · `/monitoramento/radar/teat` (D-05) ·
`/monitoramento/comparativo` (D-10) · `/monitoramento/auditoria` (D-11) ·
`/monitoramento/indicadores` (D-14, e a rota-filha `/indicadores/:id`).

### B — Dever periódico

`/monitoramento` (D-01) · `/monitoramento/alertas/:id` (D-02) · `/monitoramento/deveres` (D-08) ·
`/monitoramento/deveres/:id/ciclos/:period` (D-09) · `/monitoramento/comparativo` (D-10) ·
`/monitoramento/auditoria` (D-11) · `/monitoramento/transparencia` (D-12) ·
`/monitoramento/sinistros` (D-13) · `/monitoramento/indicadores` (D-14).

### C — SLA operacional

`/monitoramento` (D-01) · `/monitoramento/alertas/:id` (D-02) · `/monitoramento/radar/pec`
(D-04) · `/monitoramento/radar/teat` (D-05) · `/monitoramento/comparativo` (D-10) ·
`/monitoramento/auditoria` (D-11) · `/monitoramento/sinistros` (D-13) ·
`/monitoramento/indicadores` (D-14).

### D — Saúde técnica

`/monitoramento` (D-01) · `/monitoramento/alertas/:id` (D-02) · `/monitoramento/integracoes`
(D-06) · `/monitoramento/integracoes/:system` (D-07) · `/monitoramento/auditoria` (D-11) ·
`/monitoramento/indicadores` (D-14) · `/monitoramento/frescor` (D-15).

`/monitoramento/relatorios` (D-16), `/monitoramento/exportacoes` (D-17) e `/monitoramento/kpis`
(D-18) não declaram bloco: são catálogo e registro, não leitura de indicador.

## Camadas de acesso

A camada é do usuário (`core/layer-table.ts`, transcrição provisória — OD-D16-006) e o backend
permanece autoridade (`DASH.LAYER_FORBIDDEN`). O passe global (`'*'` nas permissões) **não**
alcança a camada.

- **N0 — Indicadores agregados institucionais:** `/monitoramento/deveres` (D-08),
  `/monitoramento/deveres/:id/ciclos/:period` (D-09), `/monitoramento/transparencia` (D-12),
  `/monitoramento/sinistros` (D-13), `/monitoramento/indicadores` (D-14),
  `/monitoramento/frescor` (D-15), `/monitoramento/kpis` (D-18).
- **N1 — Operacional por fila:** `/monitoramento` (D-01), `/monitoramento/alertas/:id` (D-02),
  `/monitoramento/radar/rait` (D-03), `/monitoramento/radar/pec` (D-04),
  `/monitoramento/radar/teat` (D-05), `/monitoramento/integracoes` (D-06),
  `/monitoramento/integracoes/:system` (D-07), `/monitoramento/comparativo` (D-10),
  `/monitoramento/relatorios` (D-16), `/monitoramento/exportacoes` (D-17).
- **N2 — Identificação de objeto de processo:** `/monitoramento/auditoria` (D-11). O objeto só
  aparece depois da finalidade declarada (`LayerGate`, cabeçalho `X-Purpose` em L2).
- **N3 — Dado pessoal sensível:** nunca é camada de rota —
  `dashboardLayerAllows(_, 'N3') === false` para qualquer papel.

## Nível das telas

Todas as telas estão em **L0**: R-0011 (`BP-DASH-MONITOR-001`) não tem código, logo não existe
cliente gerado, facade de leitura nem `HttpClient` em `features/`. Cada tela renderiza título,
intro e o estado "indisponível nesta versão" citando a dependência — nunca mock silencioso.
Cada tela **sobe a L2 quando** `features/<módulo>/<módulo>.client.ts` (gerado de
`BP-DASH-MONITOR-001`) existir.

| Rota                                        | Tela | Ficha        | Nível |
| ------------------------------------------- | ---- | ------------ | ----- |
| `/monitoramento`                            | D-01 | IU-DASH-D-01 | L0    |
| `/monitoramento/alertas/:id`                | D-02 | IU-DASH-D-02 | L0    |
| `/monitoramento/radar/rait`                 | D-03 | IU-DASH-D-03 | L0    |
| `/monitoramento/radar/pec`                  | D-04 | IU-DASH-D-04 | L0    |
| `/monitoramento/radar/teat`                 | D-05 | IU-DASH-D-05 | L0    |
| `/monitoramento/integracoes`                | D-06 | IU-DASH-D-06 | L0    |
| `/monitoramento/integracoes/:system`        | D-07 | IU-DASH-D-07 | L0    |
| `/monitoramento/deveres`                    | D-08 | IU-DASH-D-08 | L0    |
| `/monitoramento/deveres/:id/ciclos/:period` | D-09 | IU-DASH-D-09 | L0    |
| `/monitoramento/comparativo`                | D-10 | IU-DASH-D-10 | L0    |
| `/monitoramento/auditoria`                  | D-11 | IU-DASH-D-11 | L0    |
| `/monitoramento/transparencia`              | D-12 | IU-DASH-D-12 | L0    |
| `/monitoramento/sinistros`                  | D-13 | IU-DASH-D-13 | L0    |
| `/monitoramento/indicadores`                | D-14 | IU-DASH-D-14 | L0    |
| `/monitoramento/frescor`                    | D-15 | IU-DASH-D-15 | L0    |
| `/monitoramento/relatorios`                 | D-16 | IU-DASH-D-16 | L0    |
| `/monitoramento/exportacoes`                | D-17 | IU-DASH-D-17 | L0    |
| `/monitoramento/kpis`                       | D-18 | IU-DASH-D-18 | L0    |

As duas rotas-filhas de detalhe (`/monitoramento/indicadores/:id` e
`/monitoramento/relatorios/:id`) usam a ficha e a página do pai; as duas auxiliares
(`/monitoramento/sem-permissao` e `/monitoramento/auth/callback`) não têm ficha.

## Verificação

```bash
pnpm --filter @detran/dashboard-web typecheck
pnpm --filter @detran/dashboard-web lint
pnpm --filter @detran/dashboard-web test
pnpm --filter @detran/dashboard-web build
```

## Definições

- `docs/framework/arch/dashboard-frontends.md` — stack, invariantes, guardas, componentes, pastas.
- `docs/framework/arch/dashboard-route-contract.md` — rotas `/v1/dashboard/*`, `meta.freshness`, stream.
- `docs/framework/arch/dashboard-error-catalog.md` — os 52 códigos `DASH.*` e a apresentação de cada um.
- `docs/framework/arch/dashboard-build-pack.md` — pacote de construção (WP-D5).
- `work/rounds/R-0016/route-manifest.md` — manifesto de rotas, papéis, camadas, títulos e menu.
- `work/rounds/R-0016/contracts/CTG-0002.md` — contrato deste app (§1–§14).
