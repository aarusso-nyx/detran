---
id: IU-RAIT-022
title: Protocolo — remessas à JARI — especificação de tela
status: draft
apps: [rait]
sources: [REF-CTB-280-290, REF-CONTRAN-900, REF-CONTRAN-918]
updated: 2026-09-21
---

Ficha da rota `/protocolo/remessas` (`rait-web-frontend.md` §4; sem tela própria em
[IU-RAIT-001]).
Fontes: [UC-RAIT-017], [JRN-RAIT-003], [RN-RAIT-003], [RN-RAIT-107], [RN-RAIT-110],
[RN-RAIT-106].

## 1. Identidade

- id: `IU-RAIT-022`; rota: `/protocolo/remessas` (`route-manifest.md` #21); `screen: '—'`.
- módulo: `protocolo` (`rait-web-frontend.md` §2).
- página: `RemittancesPage`; componente inteligente: `RemittanceChecklist`
  (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #21).
- slug i18n: `protocolo-remessas` (`route-manifest.md` §A).

## 2. Acesso

- papel: `rait-secretary` (`route-manifest.md` #21).
- guardas: `raitAuthGuard` + `roleGuard(['rait-secretary'])` (M4).
- chave de política: `inf:rait-case:remit-jari` (§7); recebimento pela JARI:
  `inf:rait-case:receive-judging-body` (§7).
- pré-condição: caso `ADMITIDO` → `AGUARDANDO_REMESSA_JARI` ([WF-RAIT-001]); `T-REM10` armado
  ([UC-RAIT-017] Pré-condições).

## 3. Entrada

- de onde se chega: `/protocolo` (indicador de remessa pendente); [JRN-RAIT-003] passo 3; JW-03
  passo 5 (F-J-0).
- parâmetros de rota: nenhum; lista aceita `?q=&ordem=&filtro=`.
- deep-link canônico: `/protocolo/remessas` sem parâmetros.

## 4. Dados

- resolver: "F-J-0: remessas à JARI, T-REM10" (`route-manifest.md` #21).
- cliente gerado: `data/api/case.client.ts`, recurso `/v1/inf/rait/cases` filtrado por
  `AGUARDANDO_REMESSA_JARI`.
- campos exibidos: checklist de ofício (AIT, evidências do TEAT, NA/NP com marcos de ciência,
  decisão da defesa prévia e sua minuta, petição e anexos do recorrente, registro de
  admissibilidade — [UC-RAIT-017] Fluxo 1), dias restantes de `T-REM10` ([WF-RAIT-001] §Prazos).
- calculado do backend: `dias_ate_remessa` ([RN-RAIT-107]) e piso de vínculo de evidência TEAT
  (OD-R7-FJ0-001, steering §H.58) — a tela exibe, não recalcula o piso.

## 5. Estados

- carregando: skeleton do checklist.
- vazio: "nenhuma remessa pendente".
- erro recuperável: falha transitória ao remeter/registrar recebimento — retry.
- sem permissão: 403 → banner "sem permissão para esta ação".
- conflito: `RAIT.REMIT_NOT_ADMITTED` (409) — caso não admitido ou instância errada;
  `RAIT.RECEIPT_ALREADY_REGISTERED` (409) — segundo recebimento pelo órgão julgador
  (`rait-error-catalog.md` §3.8).
- indisponível: não se aplica (`L2`).

## 6. Comandos

| Ação (`recurso:ação`)            | Papel                        | Pré-estado → pós-estado                                                       | Comando (§7)              | Confirmação com efeito jurídico                                                                       | Erros esperados                                              |
| -------------------------------- | ---------------------------- | ----------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `rait.case:remit-jari`           | `rait-secretary`             | `ADMITIDO` (`AGUARDANDO_REMESSA_JARI`) → `AGUARDANDO_REMESSA_JARI` (remetido) | `POST …/commands/remit`   | "Ao remeter, o dossiê completo segue à JARI; o relógio de 24 meses só inicia no recebimento por ela." | `RAIT.REMIT_NOT_ADMITTED`, `RAIT.REMIT_CHECKLIST_INCOMPLETE` |
| `rait.case:receive-judging-body` | `rait-secretary` (colegiado) | `AGUARDANDO_REMESSA_JARI` → `DISTRIBUIDO`                                     | `POST …/commands/receive` | "Ao registrar o recebimento, inicia o teto legal de 24 meses para julgamento (CTB art.285 §6º)."      | `RAIT.RECEIPT_ALREADY_REGISTERED`                            |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §11). `If-Match` sempre exigido em
ambos os comandos.

## 7. Saída

- remessa concluída: caso permanece em `/protocolo/remessas` até o recebimento pela JARI; ao
  registrar o recebimento, marco `T-JUL-24M` fica visível ([UC-RAIT-017] AC-RAIT-017-2).
- ausência de evidência TEAT (nenhum vínculo válido, ou obrigatório indisponível): remessa
  bloqueada, `RAIT.REMIT_CHECKLIST_INCOMPLETE` (`UC-RAIT-017` AC-RAIT-017-4; steering §H.58).
- `T-REM10` vencido: alerta ao gestor, sem sanção legal — indicador `dias_ate_remessa` visível
  ([RN-RAIT-107]).

## 8. Segurança e LGPD

- remessa nunca depende do cidadão: documento do órgão ausente é anexado de ofício ou vira tarefa
  interna, nunca pedido ao recorrente ([RN-RAIT-003]; [UC-RAIT-017] AC-RAIT-017-1).
- dados do requerente e do procurador exibidos conforme papel; terceiros suprimidos
  ([RN-RAIT-137]).
- nenhum segredo em URL/log.

## 9. Acessibilidade e atalhos

- `j/k`/`enter` para navegar e abrir a remessa (`rait-web-frontend.md` §10).
- `T-REM10` sempre exibido com base legal ao lado ([IU-RAIT-001] §1; CTB art. 285 §2º).
- foco visível; checklist incompleto sinalizado por texto, não só cor ([IU-RAIT-001] §4).

## 10. Testes

- unitário: remessa nunca exige documento do cidadão (AC-RAIT-017-1); duas datas distintas
  (`T-JUL-24M` de `data_recebimento_jari`, `T-REM10` de `data_interposicao`, AC-RAIT-017-2);
  atraso de remessa visível separado do risco de prescrição (AC-RAIT-017-3); ausência de
  evidência nunca passa silenciosamente (AC-RAIT-017-4).
- roteamento: `rait-secretary` ativa; demais papéis → `/sem-permissao`.
- estados: conflito `RAIT.RECEIPT_ALREADY_REGISTERED`; checklist incompleto.

## Componentes compartilhados

`DeadlineChip`, `LegalBasisTooltip`, `EventTimeline`.

## Chaves i18n

- `rait.screens.protocolo-remessas.title` — "Remessas à JARI"
- `rait.screens.protocolo-remessas.intro` — "Casos admitidos aguardando remessa ou recebimento pela JARI (F-J-0)"
- `rait.screens.protocolo-remessas.empty` — "Nenhuma remessa pendente"
- `rait.screens.protocolo-remessas.cmd.remit` — "Remeter à JARI"
- `rait.screens.protocolo-remessas.cmd.receive` — "Registrar recebimento"
- `rait.screens.protocolo-remessas.field.checklist` — "Checklist do ofício"
