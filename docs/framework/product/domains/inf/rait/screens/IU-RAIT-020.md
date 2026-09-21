---
id: IU-RAIT-020
title: Protocolo — cadastro e digitalização de peça física — especificação de tela
status: draft
apps: [rait]
sources:
  [
    REF-CONTRAN-900,
    REF-DETRANAM-SERVICOS,
    REF-DETRANAM-PORTARIA-5046,
    REF-CETRAN-PROCESSO-INTERNO,
  ]
updated: 2026-09-21
---

Ficha da rota `/protocolo/novo` (`rait-web-frontend.md` §4; tela T-08 de [IU-RAIT-001]).
Fontes: [UC-RAIT-001], [JRN-RAIT-003], [RN-RAIT-002], [RN-RAIT-003], [RN-RAIT-106],
[RN-RAIT-120], [RN-RAIT-121].

## 1. Identidade

- id: `IU-RAIT-020`; rota: `/protocolo/novo` (`route-manifest.md` #19); `screen: 'T-08'`.
- módulo: `protocolo` (`rait-web-frontend.md` §2).
- página: `IntakeNewPage`; componente inteligente: `IntakeWizard` — "canal, marco de
  tempestividade, partes, documentos, conteúdo mínimo" (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #19).
- slug i18n: `protocolo-novo` (`route-manifest.md` §A).

## 2. Acesso

- papel: `rait-secretary` (`route-manifest.md` #19).
- guardas: `raitAuthGuard` + `roleGuard(['rait-secretary'])` (M4).
- chave de política: `inf:rait-case:protocol` (§7, ação `rait.case:protocol`).
- pré-condição: canal de entrada disponível (balcão, postal, digital) e existência de um
  AIT/NA/NP referenciado ([UC-RAIT-001] Pré-condições).

## 3. Entrada

- de onde se chega: `/protocolo` (botão "novo intake"); [JRN-RAIT-003] passos 2-4; JW-03 passo 2.
- parâmetros de rota: nenhum.
- assistente sem parâmetro de URL por etapa (estado do wizard é local); rascunho não persiste
  no servidor entre sessões — fonte não cita persistência de rascunho para esta rota
  (diferente de IU-PORTAL-T03); tratado como `OD-R12-012` proposto no relatório.

## 4. Dados

- resolver: "cadastro e digitalização de peça física" (`route-manifest.md` #19).
- cliente gerado: `data/api/case.client.ts` (`case`), `POST /v1/inf/rait/cases`
  (`rait-web-frontend.md` §7, `Idempotency-Key`).
- campos do formulário — Intake físico (`rait-web-frontend.md` §9): canal, data do marco
  (postagem/protocolo — [RN-RAIT-106]), placa + nº do AIT (um só — [RN-RAIT-002]), requerente
  (nome, CPF/CNPJ, endereço), assinatura presente, documentos ([UC-RAIT-001] passo 2).
- upload por URL assinada do storage do kernel; hash exibido (`rait-web-frontend.md` §8).
- calculado do backend: classificação automática de `instancia`/`circuito`
  ([UC-RAIT-001] AC-RAIT-001-4) — o formulário nunca oferece essa escolha manualmente.

## 5. Estados

- carregando: skeleton do assistente.
- vazio: não se aplica — formulário de criação.
- erro recuperável: falha transitória ao enviar — mantém o preenchido, permite nova tentativa.
- sem permissão: 403 `RAIT.FORBIDDEN_ACTION` → banner "sem permissão para esta ação".
- conflito: `RAIT.INTAKE_DUPLICATE_INSTANCE` (409) — já existe caso ativo do mesmo AIT na mesma
  instância (`rait-error-catalog.md` §3.3) → recarrega e orienta ao caso existente.
- indisponível: não se aplica (`L2`).

## 6. Comandos

| Ação (`recurso:ação`) | Papel            | Pré-estado → pós-estado             | Comando (§7)              | Confirmação com efeito jurídico                                                               | Erros esperados (catálogo §3)                                                                                                                                                        |
| --------------------- | ---------------- | ----------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `rait.case:protocol`  | `rait-secretary` | `—` → `PROTOCOLADO` ([WF-RAIT-001]) | `POST /v1/inf/rait/cases` | "Ao protocolar, o prazo de tempestividade passa a contar do marco do canal, não do registro." | `RAIT.INTAKE_MULTIPLE_AIT`, `RAIT.INTAKE_DUPLICATE_INSTANCE`, `RAIT.INTAKE_CHANNEL_MARK_MISSING`, `RAIT.DOCUMENT_INVALID`, `RAIT.PARTY_LEGITIMACY_INVALID`, `RAIT.VALIDATION_FAILED` |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §7, §11 — "todos" os módulos
dependem dos endpoints de comando; hoje só CRUD gerado). `If-Match` não se aplica à criação
(recurso ainda não existe); as demais ações desta rota (juntada de documento) usam
`Idempotency-Key`, não `If-Match`.

## 7. Saída

- sucesso: protocolo exibido no ato ([UC-RAIT-001] Pós-condições) e navega a `/casos/:id/resumo`.
- peça com mais de um AIT: recusada com orientação, sem criar caso ([RN-RAIT-002] § único).
- conteúdo mínimo ausente no canal físico: caso é criado em `PROTOCOLADO` com pendência aberta
  ([UC-RAIT-001] AC-RAIT-001-2), navega a `/protocolo/pendencias`.

## 8. Segurança e LGPD

- base legal do tratamento dos dados do requerente é competência legal/regulatória, nunca
  consentimento ([RN-RAIT-133]) — nenhum checkbox de consentimento no formulário.
- instrução textual junto ao campo de exposição de fatos orientando a não incluir dado sensível
  além do necessário ([RN-RAIT-134]).
- procuração exige apenas firma reconhecida por autenticidade no próprio balcão, sem endosso
  cartorial ([RN-RAIT-121]).
- nenhum segredo em URL/log; upload por URL assinada.

## 9. Acessibilidade e atalhos

- navegação por teclado completa no assistente ([IU-RAIT-001] §5); nenhum atalho global ativo
  dentro de campos de texto (`rait-web-frontend.md` §10).
- erros de validação associados ao campo, foco no primeiro erro (`rait-error-catalog.md` §4).
- caso digitalizado tem a mesma forma de um caso nativo — o `DocumentUploader` sempre extrai
  campos estruturados, nunca só anexa PDF ([UC-RAIT-001] AC-RAIT-001-5; [IU-RAIT-001] §6).

## 10. Testes

- unitário: bloqueio de requerimento com mais de um AIT ([UC-RAIT-001] AC-RAIT-001-1); data de
  protocolo do canal postal = data da postagem (AC-RAIT-001-3); classificação automática de
  instância/circuito (AC-RAIT-001-4); dossiê estruturado, não PDF solto (AC-RAIT-001-5);
  procuração com firma por autenticidade aceita sem endosso cartorial (AC-RAIT-001-6).
- roteamento: `rait-secretary` ativa; demais papéis → `/sem-permissao`.
- jornada feliz: protocolo com conteúdo mínimo completo → `/casos/:id/resumo`; jornada de erro:
  conteúdo mínimo ausente no físico → pendência aberta, sem recusa.

## Componentes compartilhados

`DocumentUploader`, `LegalBasisTooltip`.

## Chaves i18n

- `rait.screens.protocolo-novo.title` — "Novo protocolo"
- `rait.screens.protocolo-novo.intro` — "Registre o pleito recebido por balcão, postal ou protocolo virtual"
- `rait.screens.protocolo-novo.cmd.protocol` — "Protocolar"
- `rait.screens.protocolo-novo.field.channel` — "Canal de entrada"
- `rait.screens.protocolo-novo.field.marco` — "Data do marco de tempestividade"
- `rait.screens.protocolo-novo.field.ait` — "Placa e número do AIT"
- `rait.screens.protocolo-novo.state.duplicate` — "Já existe um caso ativo para este AIT nesta instância"
