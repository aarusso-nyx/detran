---
id: IU-RAIT-046
title: Escala semanal e plantão — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-DETRANAM-SERVICOS]
updated: 2026-09-21
---

Ficha da rota `organizacao/escala` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-013].

## 1. Identidade

- id `IU-RAIT-046`; `path`: `organizacao/escala` (route-manifest.md #48); `screen`: `—`.
- módulo `organizacao`; página `SchedulePage`, componente inteligente `ScheduleGrid` (§5.3).
- nível `L0`; slug i18n `organizacao-escala`.

## 2. Acesso

- papéis: `rait-coordinator`, `rait-chair` (route-manifest.md linha 48).
- guardas: `raitAuthGuard`; `roleGuard(['rait-coordinator', 'rait-chair'])`.
- chave de política: `inf:rait-schedule:publish` (`rait-web-frontend.md` §7).

## 3. Entrada

- chega-se pelo redirect de `/organizacao` para `rait-coordinator`/`rait-chair`
  (route-manifest.md §B) ou pela navegação.

## 4. Dados

- resolver da rota: "escala semanal e plantão — §11 linha 4 (escala/plantão pendente)"
  (route-manifest.md).
- dependência: `rait-web-frontend.md` §11 linha 4 — "Escala/plantão, lote de sorteio com ata,
  unidade/turma, suplência, tipo de impedimento, banca ([WF-RAIT-004] §10)" — módulo FE
  `organizacao`/`colegiado` — situação **pendente no blueprint do worklist**.
- desenho pretendido ([UC-RAIT-013]): por membro e dia, `DISPONIVEL`/`AUSENTE_PROGRAMADO`, `WIP`
  quando diferente do padrão do pool, plantão de risco (`EM_PLANTAO`), suplente de plantão por
  sessão do calendário.

## 5. Estados

- **indisponível nesta versão** (`DetranErrorStateComponent`, `rait.states.unavailable_in_version`)
  citando `rait-web-frontend.md` §11 linha 4 — sem mock silencioso (§11 último parágrafo).
- quando a dependência existir: carregando (esqueleto do `ScheduleGrid`), erro recuperável, sem
  permissão (banner `rait.errors.forbidden`).

## 6. Comandos

| Ação (`recurso:ação`)   | Papel                            | Pré-estado → pós-estado                                        | Comando                                      | Confirmação                                                          | Erros esperados                                               |
| ----------------------- | -------------------------------- | -------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------- |
| `rait.schedule:publish` | `rait-coordinator`, `rait-chair` | escala rascunhada → escala publicada, elegibilidade atualizada | `POST /v1/inf/rait/schedules` (pendente, §7) | "todo dia útil precisa de plantonista" ([UC-RAIT-013] AC-RAIT-013-2) | `RAIT.SCHEDULE_NO_DUTY_MEMBER`, `RAIT.SCHEDULE_PERIOD_LOCKED` |

- `endpoint de comando: R-0007 CTG-0004`, **além** da dependência de dados da §11 linha 4 — dupla
  pendência (endpoint de comando e entidade de escala) até que ambas fechem.
- capacidade projetada abaixo da chegada média: alerta e o coordenador registra medida ou aceita o
  risco com justificativa ([UC-RAIT-013] 4a).

## 7. Saída

- escala publicada fica visível a todos os membros e ao gestor RAIT, com histórico de versões
  ([UC-RAIT-013] fluxo 5).
- ausência imprevista após publicação: reatribuição dos casos com prazo vencendo no período
  ([UC-RAIT-013] 5a → [UC-RAIT-011]).

## 8. Segurança e LGPD

- nenhum dado pessoal sensível; escala trata só disponibilidade e mandato.

## 9. Acessibilidade e atalhos

- `ScheduleGrid` navegável por teclado (célula por célula); contraste AA.

## 10. Testes

- AC-RAIT-013-1 — membro `AUSENTE_PROGRAMADO` não é elegível.
- AC-RAIT-013-2 — publicação bloqueada sem plantonista em algum dia útil.
- AC-RAIT-013-3 — escala é auditável (quem estava escalado em D).
- roteamento: `rait-coordinator`/`rait-chair` ativam; demais papéis → `/sem-permissao`; enquanto
  `L0`, a rota existe e exibe "indisponível" para todos os papéis autorizados (M13).

## Componentes compartilhados

`ScheduleGrid` (§5.3, organizacao); nenhum de §5.2 aplica diretamente.

## Chaves i18n

- `rait.screens.organizacao-escala.title` — "Escala semanal e plantão"
- `rait.screens.organizacao-escala.cmd.publish` — "Publicar escala"

Estado "indisponível nesta versão" é referenciado por `rait.states.unavailable_in_version` da
semente, nunca redefinido aqui.
