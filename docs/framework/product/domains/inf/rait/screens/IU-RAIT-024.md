---
id: IU-RAIT-024
title: Protocolo — registro de desistência — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-900, REF-CTB-280-290]
updated: 2026-09-21
---

Ficha da rota `/protocolo/desistencias` (`rait-web-frontend.md` §4; tela T-17 de
[IU-RAIT-001]).
Fontes: [UC-RAIT-012], [JRN-RAIT-003], [RN-RAIT-121], [RN-RAIT-123].

## 1. Identidade

- id: `IU-RAIT-024`; rota: `/protocolo/desistencias` (`route-manifest.md` #23);
  `screen: 'T-17'`.
- módulo: `protocolo` (`rait-web-frontend.md` §2).
- página: `WithdrawalsPage` (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #23).
- slug i18n: `protocolo-desistencias` (`route-manifest.md` §A).

## 2. Acesso

- papel: `rait-secretary` (`route-manifest.md` #23).
- guardas: `raitAuthGuard` + `roleGuard(['rait-secretary'])` (M4).
- chave de política: `inf:rait-case:withdraw` (§7).
- pré-condição: caso em qualquer estado pré-decisão — `PROTOCOLADO`,
  `TRIAGEM_ADMISSIBILIDADE`, `DISTRIBUIDO`, `EM_INSTRUCAO`, `DILIGENCIA`, `PRONTO_P_DECISAO` ou
  `PAUTADO` ([WF-RAIT-001]; [UC-RAIT-012] Pré-condições).

## 3. Entrada

- de onde se chega: `/protocolo` (busca por protocolo/AIT); [JRN-RAIT-003] passo 4; JW-03
  passo 6.
- parâmetros de rota: nenhum; busca por caso/protocolo aceita `?q=`.
- deep-link canônico: `/protocolo/desistencias` sem parâmetros.

## 4. Dados

- resolver: "registro de desistência" (`route-manifest.md` #23).
- cliente gerado: `data/api/case.client.ts`.
- campos exibidos: termo de desistência (anexo), legitimidade do signatário ([RN-RAIT-121]),
  estado atual do caso, diligências abertas, presença em pauta futura.
- calculado do backend: verificação de que o caso ainda não foi julgado
  (`DECIDIDO_AUTORIDADE`/`JULGADO_SESSAO` não alcançados — [UC-RAIT-012] Fluxo 2) é feita pelo
  servidor, não pela tela.

## 5. Estados

- carregando: skeleton do formulário de termo.
- vazio: não se aplica — formulário sobre um caso identificado.
- erro recuperável: falha transitória ao enviar o termo — retry, mantém o preenchido.
- sem permissão: 403 → banner "sem permissão para esta ação".
- conflito: `RAIT.WITHDRAWAL_AFTER_DECISION` (409) — desistência após decisão/proclamação
  (`rait-error-catalog.md` §3.3) → recarrega e orienta sobre o caminho recursal remanescente.
- indisponível: não se aplica (`L2`).

## 6. Comandos

| Ação (`recurso:ação`) | Papel            | Pré-estado → pós-estado                                               | Comando (§7)               | Confirmação com efeito jurídico                                                                 | Erros esperados                                                |
| --------------------- | ---------------- | --------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `rait.case:withdraw`  | `rait-secretary` | qualquer estado pré-decisão → `ENCERRADO_DESISTENCIA` ([WF-RAIT-001]) | `POST …/commands/withdraw` | "Ao homologar a desistência, o caso é encerrado sem decisão de mérito e sai de qualquer pauta." | `RAIT.WITHDRAWAL_AFTER_DECISION`, `RAIT.WITHDRAWAL_LEGITIMACY` |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §11). `If-Match` sempre exigido.

## 7. Saída

- sucesso: caso passa a `ENCERRADO_DESISTENCIA` ([UC-RAIT-012] Pós-condições); diligências
  abertas são encerradas e o caso sai de pautas futuras no mesmo ato ([UC-RAIT-012]
  AC-RAIT-012-3).
- desistência durante sessão já aberta: decisão do presidente sobre a tempestividade, registrada
  em ata ([UC-RAIT-012] AC-RAIT-012-4; [WF-RAIT-003]) — fora do alcance desta tela.
- sem resultado de mérito registrado; não alimenta a taxa de provimento por enquadramento
  ([UC-RAIT-012] AC-RAIT-012-5).

## 8. Segurança e LGPD

- termo exige legitimidade do signatário — requerente ou procurador habilitado ([RN-RAIT-121])
  anexado ao dossiê como peça ([UC-RAIT-012] AC-RAIT-012-2).
- dados do requerente exibidos conforme papel; terceiros suprimidos ([RN-RAIT-137]).
- nenhum segredo em URL/log.

## 9. Acessibilidade e atalhos

- `j/k`/`enter` para localizar e abrir o caso.
- foco visível; upload do termo com feedback de erro associado ao campo.
- risco de bloqueio (caso já julgado) nunca só por cor — texto explícito ([IU-RAIT-001] §4).

## 10. Testes

- unitário: desistência é admissível até o julgamento, e só até ele
  ([UC-RAIT-012] AC-RAIT-012-1); exige forma escrita e legitimidade (AC-RAIT-012-2); encerrar
  limpa diligências e pautas (AC-RAIT-012-3); sem decisão de mérito registrada (AC-RAIT-012-5).
- roteamento: `rait-secretary` ativa; demais papéis → `/sem-permissao`.
- estados: conflito `RAIT.WITHDRAWAL_AFTER_DECISION`.

## Componentes compartilhados

`DocumentUploader`, `LegalBasisTooltip`, `EventTimeline`.

## Chaves i18n

- `rait.screens.protocolo-desistencias.title` — "Registro de desistência"
- `rait.screens.protocolo-desistencias.intro` — "Encerre o caso sem decisão de mérito, a pedido do requerente"
- `rait.screens.protocolo-desistencias.cmd.withdraw` — "Homologar desistência"
- `rait.screens.protocolo-desistencias.field.term` — "Termo de desistência"
- `rait.screens.protocolo-desistencias.state.after_decision` — "O caso já foi decidido; a desistência não é mais admissível"
