---
id: IU-RAIT-014
title: Partes do caso — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-900, REF-CTB-280-290]
updated: 2026-09-21
---

Ficha da rota `casos/:id/partes` (`rait-web-frontend.md` §4; sem tela própria em [IU-RAIT-001],
aba do layout T-04). Fontes: [RN-RAIT-120].

## 1. Identidade

- id: `IU-RAIT-014`; `path`: `casos/:id/partes` (`route-manifest.md` #14).
- `screen`: `—`.
- módulo: `caso`; componente inteligente: `PartiesPage` (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md`).
- slug i18n: `casos-id-partes`.

## 2. Acesso

- papéis: `rait-secretary`, `rait-analyst` (`route-manifest.md` #14).
- guardas: as de `/casos/:id` + `roleGuard(['rait-secretary', 'rait-analyst'])`.
- sem comando de mutação próprio no lote A (correção de dado factual — RN-RAIT-121, não lida
  nesta rodada — fica fora do escopo desta ficha; ver "Fora do escopo").

## 3. Entrada

- de onde se chega: navegação de aba a partir de `/casos/:id`.
- parâmetros de rota: `:id` (herdado do layout).
- deep-link canônico: `/casos/:id/partes`.

## 4. Dados

- resolver: "requerente, procurador, legitimidade" (`route-manifest.md` #14).
- clientes: `data/api/case.client.ts` (partes do caso).
- calculado do backend: qualidade em que o requerente atua (proprietário, condutor identificado,
  embarcador, transportador — [RN-RAIT-120]) já persistida desde a triagem/interposição, não
  reavaliada nesta tela; procuração verificada é atributo do backend
  (`RAIT.PROCURATION_UNVERIFIED`, catálogo §3.3).

## 5. Estados

- **carregando**: skeleton da lista de partes.
- **vazio**: não se aplica — todo caso tem ao menos o requerente.
- **erro recuperável**: falha ao carregar; retry.
- **sem permissão**: papel fora de `rait-secretary`/`rait-analyst` — `RAIT.FORBIDDEN_ACTION` (403).
- **erro de negócio**: `RAIT.PARTY_LEGITIMACY_INVALID` (422, catálogo §3.3) — base de legitimidade
  incompatível com o sujeito passivo; `RAIT.PROCURATION_UNVERIFIED` (422) — procurador sem
  instrumento verificado.

## 6. Comandos

Nenhum comando de mutação nesta ficha do lote A — a tela exibe as partes e a base de
legitimidade já registradas ([RN-RAIT-120]); qualquer ação de correção de dado factual do
requerente é tratada como pendência de fonte (ver nota ao fim das Chaves i18n).

## 7. Saída

- não navega a outra rota por ação própria.

## 8. Segurança e LGPD

- dado do requerente/procurador visível por papel; dado de terceiro citado no processo é
  suprimido campo a campo ([RN-RAIT-137]).

## 9. Acessibilidade e atalhos

- foco visível na lista de partes; nenhuma dependência exclusiva de cor para indicar
  pendência de legitimidade.

## 10. Testes

- roteamento: `rait-secretary`/`rait-analyst` ativam; demais papéis → `/sem-permissao` (M14).
- critérios ligados à legitimidade taxativa de [RN-RAIT-120] (rol de legitimados exibido, sem
  aceitar qualidade fora do rol sem decisão jurídica expressa).

## Componentes compartilhados

`CaseHeader` (`rait-web-frontend.md` §5.2).

## Chaves i18n

- `rait.screens.casos-id-partes.title` — "Partes do caso"
- `rait.screens.casos-id-partes.intro` — "Requerente, procurador e base de legitimidade."

Nota (fora do escopo desta ficha, não decidida aqui): o roteamento entre "corrigir dado factual"
(endereço, CPF, placa, grafia) e "mérito do ato" é matéria do bloco [RN-RAIT-137] item 2, ainda
sem lista fechada de campos corrigíveis nesta rodada.
