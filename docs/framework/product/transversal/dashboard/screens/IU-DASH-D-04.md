---
id: IU-DASH-D-04
title: Escada de prazos PEC — especificação de tela
status: draft
apps: [dashboard]
sources: [REF-CONTRAN-927-2022, REF-CTB-147-148-habilitacao, REF-LEI-13709-2018]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/radar/pec` (`dashboard-frontends.md` §4, tela D-04; painel P-03
de [IU-DASH-001]).
Fontes: [UC-DASH-001], [JRN-DASH-007], [RN-DASH-130], [RN-DASH-132].

## 1. Identidade

- `id`: `IU-DASH-D-04`; `path`: `/monitoramento/radar/pec` (`route-manifest.md` #4).
- `screen`: P-03 ("Escada de prazos da junta PEC" de [IU-DASH-001] §A).
- camada de produto: Ação.
- módulo: `radar`.
- `slug`: `radar-pec`; segmento i18n: `radar_pec`.
- página: `PecRadarPage`; componente inteligente principal: lista dos cinco prazos separados
  ([RN-DASH-132]).

## 2. Acesso

- `policy`: `dashboard:alert:read` (prov., `OD-D16-002`).
- `access`: N1; drill-down N2 via `LayerGate` (`route-manifest.md` §C linha D-04).
- `roles` (presença): os 9 de `route-manifest.md` §D.
- passe global: GESTOR_DETRAN via §E; ADMIN/SUPORTE bloqueados (`OD-D16-005`).
- guardas: `authGuard` → `permissionGuard('dashboard:alert:read')` → `layerGuard('N1')`;
  `LayerGate` no drill-down; gestor de área só no próprio domínio.

## 3. Entrada

- de onde se chega: menu Ação; deep-link de D-01 quando o item é PEC.
- filtros de URL: pool/circuito/unidade; `dimension` quando aplicável.

## 4. Dados

- lê `GET alerts` filtrada por `app=pec` (`OD-D16-002`); projeção `dashboard.pec_deadlines`
  (contrato §6, IND-DASH-106/107, 306…309).
- cinco prazos separados, monitorados independentemente ([RN-DASH-132]): dois **preclusivos do
  candidato** (requerer junta, 30 dias; recorrer ao CETRAN, 30 dias) e três **do órgão sem
  sanção cominada** (designar junta, 15 dias úteis; junta decidir, 30 dias; remeter documentos,
  20 dias úteis).
- prazos do candidato aparecem rotulados "prazo do candidato, preclusivo" — sem botão de ação
  ([JRN-DASH-007] passo 2, `dashboard-frontends.md` §2 invariante 7); os do órgão aparecem
  rotulados como SLA legal sem sanção, conectados ao bloqueio de cadastro do candidato que
  segue ativo ([JRN-DASH-007] passo 3).
- 3ª instância (Junta Especial de Saúde): sem prazo numérico localizado — estado "sem prazo
  legal localizado" como valor de primeira classe ([JRN-DASH-007] passo 6; [RN-DASH-132]).
- selo de frescor + `asOf` em todo número; nenhum cálculo de dia útil no cliente.

## 5. Estados

- **vazio**: `dashboard.screens.radar_pec.empty`.
- **carregando** / **erro** / **indisponível** / **desatualizado**: idênticos ao padrão de M4
  (bloco A oculta por default).
- **bloqueado por decisão**: não se aplica.

## 6. Comandos

- Nenhum comando de mutação; nenhum botão nos cards de prazo do candidato — só informação
  ([JRN-DASH-007] passo 2). Ações: ver, filtrar, deep-link ao dossiê no PEC.

## 7. Saída

- deep-link ao PEC para os prazos do órgão (designar, decidir, remeter — ação real acontece lá);
  nenhuma ação a partir daqui sobre o relógio do candidato.

## 8. Segurança e LGPD

- N1 nos agregados; N2 (identificação do caso) só sob `LayerGate`; nenhum dado clínico no painel
  (`RN-DASH-132` verificação 3 — o DASHBOARD monitora estados e prazos, nunca resultado,
  diagnóstico ou justificativa clínica; ver [RN-DASH-162]).
- composição da junta "não instrumentado" até o PEC produzir o dado — nunca conformidade
  presumida.

## 9. Acessibilidade

- rótulo distinto para prazo do candidato ("preclusivo") e prazo do órgão ("sem sanção
  expressa"), nunca no mesmo componente sem distinção ([JRN-DASH-007] passo 1).
- severidade por forma + rótulo; `aria-live` na contagem por instância.

## 10. Testes

- roteamento: 9 papéis (presença) e demais (ausência); N3 bloqueado.
- os cinco prazos distinguidos, nenhum card confunde tipo de prazo ([AC-DASH-001-7]).
- 3ª instância exibida como "sem prazo legal localizado", nunca contador ausente.
- os seis estados aplicáveis como critérios.

## Componentes compartilhados

`FreshnessSeal`, `SeverityChip`, `LegalBasisTag`, `LayerGate`, `DeepLinkButton`,
`ClassificationBadge`.

## Chaves i18n

- `dashboard.screens.radar_pec.title` — "Escada de prazos PEC"
- `dashboard.screens.radar_pec.intro` — "Cinco prazos separados; prazo do candidato (preclusivo)
  distinto do prazo do órgão."
- `dashboard.screens.radar_pec.empty` — "Nenhum episódio de revisão em risco no recorte atual."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.severity.*`,
`dashboard.errors.*`, `dashboard.common.fixed.candidate_deadline_preclusive`,
`dashboard.forms.finalidade_n2.*`, `dashboard.a11y.*`.

OD tocada: `OD-D16-002` (política provisória).
