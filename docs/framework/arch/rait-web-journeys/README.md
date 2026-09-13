# Jornadas do console RAIT por papel — com diagramas

Uma jornada por papel canônico (`shared/actors.md` §Papéis granulares RAIT), escrita como sequência
**rota → ação → comando → efeito**, com dois diagramas cada: o **fluxo de telas** (rotas, ações e
estados do caso/sessão) e a **sequência** do caminho principal (UI → API → guarda → evento).
Fonte de verdade das telas: `IU-RAIT-001`; das rotas e componentes: `../rait-web-frontend.md` §4-§7;
dos estados: `WF-RAIT-001`, `WF-RAIT-003`, `WF-RAIT-004`, `WF-INF-003`; dos erros:
`../rait-error-catalog.md`. SVGs gerados dos blocos Mermaid em `../diagrams/ARCH-RAIT-WEB-j*.svg`.

| #   | Papel                        | Arquivo                                                                | Jornada de produto de origem          |
| --- | ---------------------------- | ---------------------------------------------------------------------- | ------------------------------------- |
| 01  | `rait-analyst`               | [JW-01-analista.md](./JW-01-analista.md)                               | JRN-RAIT-001                          |
| 02  | `rait-coordinator`           | [JW-02-coordenador.md](./JW-02-coordenador.md)                         | WF-RAIT-004 §3-4; UC-RAIT-013/025/038 |
| 03  | `rait-secretary` (protocolo) | [JW-03-secretaria-protocolo.md](./JW-03-secretaria-protocolo.md)       | JRN-RAIT-003                          |
| 04  | `rait-secretary` (colegiado) | [JW-04-secretaria-colegiado.md](./JW-04-secretaria-colegiado.md)       | UC-RAIT-014/015/020/036/024           |
| 05  | `rait-signing-authority`     | [JW-05-autoridade-signataria.md](./JW-05-autoridade-signataria.md)     | UC-RAIT-016                           |
| 06  | `rait-central-authority`     | [JW-06-autoridade-centralizada.md](./JW-06-autoridade-centralizada.md) | UC-RAIT-008                           |
| 07  | `rait-rapporteur`            | [JW-07-relator.md](./JW-07-relator.md)                                 | JRN-RAIT-002; UC-RAIT-004/019/026     |
| 08  | `rait-chair`                 | [JW-08-presidente.md](./JW-08-presidente.md)                           | JRN-RAIT-002; UC-RAIT-005/006/021     |
| 09  | `rait-manager`               | [JW-09-gestor.md](./JW-09-gestor.md)                                   | JRN-RAIT-004; UC-RAIT-010/023/039/040 |
| 10  | `rait-hr` e `rait-finance`   | [JW-10-rh-financeiro.md](./JW-10-rh-financeiro.md)                     | UC-RAIT-032…037                       |
| 11  | `integration-operator`       | [JW-11-operador-integracao.md](./JW-11-operador-integracao.md)         | UC-RAIT-029…031                       |
| 12  | `AUDITOR` e `agency-admin`   | [JW-12-auditor-admin.md](./JW-12-auditor-admin.md)                     | UC-RAIT-022/042/043                   |

Convenções dos diagramas: retângulos = telas (rota e código `T-nn`), losangos = decisões do usuário
ou guardas, `[ESTADO]` = estado do caso RAIT, `(( ))` = estado terminal da jornada, tracejado =
transição automática por timer ou evento. Nenhum diagrama inventa tela ou comando fora da
especificação; se falta algo, é a especificação que muda primeiro.
