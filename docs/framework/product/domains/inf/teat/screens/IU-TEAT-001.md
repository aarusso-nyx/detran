---
id: IU-TEAT-001
title: Registro de deltas de tela do TEAT sobre a matriz oficial de paridade mobile
status: approved
apps: [teat]
sources:
  [
    REF-SENATRAN-997,
    REF-CONTRAN-432,
    REF-CONTRAN-1025-2026,
    REF-CONTRAN-798-804-equipamentos,
    REF-DETRANAM-TALAO-BODYCAM,
  ]
updated: 2026-08-28
---

Diferente do [IU-RAIT-001], este artefato **não é um inventário** — o TEAT já tem inventário
oficial: a matriz de paridade `docs/framework/product/ux-parity/mobile-matrix.json` do repositório
de origem, com **67 telas** (62 numeradas + 5 complementares) e 576 transições, verificada em CI por
`verify-ux-parity`. Essa matriz continua sendo a autoridade sobre quais telas existem.

Este é o **registro dos deltas** que as rodadas de contexto (2026-08-24) e de endurecimento de
especificação (2026-08-26) impõem sobre ela: telas que precisam nascer, telas existentes cujo
conteúdo ou comportamento muda, e um elemento de chrome global. Promovido de
`_intake/ux-notes.md` §b, acrescido do delta da decisão de escopo do Owner sobre medição de
velocidade acoplada (`APP.md` §Fronteira).

Quando a matriz oficial for portada para o monorepo (`apps/teat/mobile`), estes deltas devem ser
absorvidos por ela e este arquivo passa a registrar apenas o que ainda não foi absorvido.

## A — Telas novas (5)

| id   | Tela                                                                        | Grupo                     | Origem                                      | Por que não existe hoje                                                                                                                                             |
| ---- | --------------------------------------------------------------------------- | ------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-01 | Declarar falha de dispositivo / handoff de sessão                           | `autenticacao-e-turno`    | [JRN-TEAT-006], [UC-TEAT-012]               | Sem ela a retaguarda não distingue handoff autorizado de sessão concorrente anômala — e a norma manda **bloquear** o concorrente ([RN-TEAT-111]). Ver AC-TEAT-012-4 |
| D-02 | ~~Checklist de elegibilidade — guarda monitorada~~ **FORA DO MVP (DT-015)** | `medidas-administrativas` | [JRN-TEAT-004], [UC-TEAT-009]               | Modalidade nova ([RN-TEAT-127]), fora do escopo do MVP por decisão do Owner (2026-08-28) — mantida no inventário como registro, não como tela a construir agora     |
| D-03 | ~~Ativação de guarda monitorada~~ **FORA DO MVP (DT-015)**                  | `medidas-administrativas` | [JRN-TEAT-004], [UC-TEAT-009]               | Idem D-02 — as 7 telas atuais do grupo assumem remoção física, que é o único caminho do MVP                                                                         |
| D-04 | Solicitação de cancelamento pós-finalização                                 | `ait-completo`            | [UC-TEAT-011], [WF-TEAT-001]                | Fluxo de **submissão formal**, deliberadamente distinto do cancelamento de rascunho (AC-TEAT-011-3)                                                                 |
| D-05 | **Operação de medição de velocidade (vínculo do medidor + resultado)**      | `ait-completo`            | [UC-TEAT-013], decisão de escopo 2026-08-26 | Nova: vincula o medidor acoplado à sessão, exibe a cadeia metrológica verificada, e mostra medida e considerada lado a lado ([RN-TEAT-138])                         |

## B — Telas existentes com delta (10)

| Tela (`screenId`, uxCode)                       | Grupo                     | Delta exigido                                                                                                          | Âncora                                        |
| ----------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `alcohol-result` UX-MOB-052                     | `alcoolemia`              | Medição realizada e valor considerado **sempre juntos**, nunca um valor único                                          | [RN-TEAT-133], AC-TEAT-007-2                  |
| `alcohol-refusal` UX-MOB-053                    | `alcoolemia`              | Separar **recusa** de **impossibilidade técnica** — hoje partilham campo, e o efeito jurídico difere                   | [RN-TEAT-134], AC-TEAT-007-4/5                |
| `alcohol-signs` UX-MOB-054                      | `alcoolemia`              | Checklist estruturado do Anexo II com exigência de **conjunto**; gera termo anexo, não texto livre                     | [RN-TEAT-132], AC-TEAT-007-6                  |
| `alcohol-forward` UX-MOB-055                    | `alcoolemia`              | Dizer explicitamente que finalizar o AIT **não espera** exame laboratorial                                             | AC-TEAT-007-8                                 |
| `alcohol-term` UX-MOB-057                       | `alcoolemia`              | Conteúdo mínimo estruturado por campo — os nove elementos                                                              | [RN-TEAT-136], AC-TEAT-007-10                 |
| `ait-frame` / `ait-frame-detail` UX-MOB-023/024 | `ait-completo`            | "Sem abordagem" deixa de ser texto livre e passa a derivar do enquadramento (Casos 1/2/3)                              | [RN-TEAT-108], AC-TEAT-002-1                  |
| `removal` UX-MOB-042                            | `medidas-administrativas` | Oferecer guarda monitorada **antes** de acionar reboque, quando elegível                                               | [RN-TEAT-127]                                 |
| `inventory` UX-MOB-043                          | `medidas-administrativas` | Acrescentar os 4 campos do art. 14 §1º                                                                                 | [RN-TEAT-126], AC-TEAT-009-2                  |
| `measure-term` UX-MOB-045                       | `medidas-administrativas` | 7 campos do _caput_; recusa de assinatura não invalida a notificação; **prazo de retirada 60 dias, não 30**            | [RN-TEAT-126], [RN-TEAT-128], AC-TEAT-009-8   |
| `ait-print` UX-MOB-033                          | `ait-completo`            | Duas vias em tempo real; reimpressão no mesmo dia sem duplicar o ato; assinatura do agente exigida **na via impressa** | [RN-TEAT-116], [RN-TEAT-105], AC-TEAT-001-6/7 |

## C — Chrome global (1)

Indicador persistente de gravação de bodycam — ativo, pausado por exceção regulamentada, ou falha —
visível em **toda** tela durante o serviço operacional, nunca dentro de menu ([RN-TEAT-141],
AC-TEAT-010-2). O registro formal de falha reaproveita `support`/`diagnostics` (UX-MOB-084/083),
mas o indicador é chrome, não tela.

## D — Requisitos transversais de tela

1. **Recusa e impossibilidade nunca partilham controle.** Vale para AIT, termo de medida e
   procedimento de alcoolemia — três lugares onde o efeito jurídico diverge ([RN-TEAT-005],
   [RN-TEAT-134]).
2. **Valores metrológicos aparecem em par.** Alcoolemia e velocidade exibem sempre medido e
   considerado; nenhuma tela, termo impresso ou payload carrega um valor único
   ([RN-TEAT-133], [RN-TEAT-138]).
3. **Enum fechado nunca vira texto livre.** Medidas administrativas, motivos de constatação sem
   abordagem e tipos de evidência derivam de catálogo ([RN-TEAT-122], [RN-TEAT-108]).
4. **Ergonomia de campo governa.** Uma mão, sol direto, luvas, pressa e um cidadão esperando — ver
   `_intake/ux-notes.md` §a, que permanece a fonte dessas regras.
5. **Nada bloqueia por falta de rede.** Toda tela do fluxo de campo opera offline; a fila e seus
   erros são visíveis ao agente ([RN-TEAT-001], AC-TEAT-005-5).
6. **Autopreenchimento é proposta, não fato.** Campos vindos de OCR ou de consulta entram como
   sugestão a validar ([RN-TEAT-115], AC-TEAT-013-7).

## E — Pendências de desenho

- **D-05** depende do parque de medidores do DETRAN-AM, não levantado (`APP.md` §Fronteira,
  [RN-DASH-173]). A tela deve ser desenhada para medidor **acoplado e operado por agente**; se o
  órgão trouxer fiscalização eletrônica fixa para dentro, é outra aplicação, não um delta desta.
- ~~Bodycam — escopo MVP × onda futura~~ — **RESOLVIDO (2026-08-28, `_meta/open-issues.md`
  DT-014):** onda futura, fora do MVP. O chrome global de §C continua valendo (barato, não
  depende da decisão); o regime de acesso de [RN-TEAT-142] fica para a mesma onda futura.
- **Janela de "mesmo intervalo"** da detecção de concorrência é parâmetro pendente do Owner
  (AC-TEAT-012-5) — a tela D-01 não deve exibi-la como número fixo antes disso.
