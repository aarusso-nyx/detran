---
id: IU-DASH-D-05
title: Radar TEAT — especificação de tela
status: draft
apps: [dashboard]
sources: [REF-SENATRAN-997, REF-CONTRAN-1025-2026, REF-CTB-280-290]
updated: 2026-09-21
---

Ficha da rota `/monitoramento/radar/teat` (`dashboard-frontends.md` §4, tela D-05; tela de apoio
— sem `P-nn` próprio em [IU-DASH-001]).
Fontes: [RN-DASH-130], [RN-DASH-134].

## 1. Identidade

- `id`: `IU-DASH-D-05`; `path`: `/monitoramento/radar/teat` (`route-manifest.md` #5).
- `screen`: tela de apoio (sem painel P-nn dedicado; [IU-DASH-001] não tem painel TEAT —
  `route-manifest.md` §G nota 4).
- camada de produto: Ação.
- módulo: `radar`.
- `slug`: `radar-teat`; segmento i18n: `radar_teat`.
- página: `TeatRadarPage`; componente inteligente principal: lista por família de vigilância
  ([RN-DASH-134]).

## 2. Acesso

- `policy`: `dashboard:alert:read` (prov., `OD-D16-002`).
- `access`: N1; drill-down N2 via `LayerGate`.
- `roles` (presença): os 9 de `route-manifest.md` §D.
- passe global: GESTOR_DETRAN via §E; ADMIN/SUPORTE bloqueados (`OD-D16-005`).
- guardas: `authGuard` → `permissionGuard('dashboard:alert:read')` → `layerGuard('N1')`.

## 3. Entrada

- de onde se chega: menu Ação; deep-link de D-01 quando o item é TEAT.
- filtros de URL: pool/circuito/unidade.

## 4. Dados

- lê `GET alerts` filtrada por `app=teat` (`OD-D16-002`); projeção `dashboard.teat_measures`
  (contrato §6, IND-DASH-108…111, 311…314).
- cinco famílias de vigilância do TEAT ([RN-DASH-134]): homologação SENATRAN do software
  (renovação a cada 4 anos), verificação metrológica (12 meses), sessão exclusiva do agente
  (bloqueio, não alerta — o registro concorrente não deve ser processado, apuração obrigatória
  pela autoridade), integridade e trilha do talão, prazos de custódia (T-REG30/T-REG15, marco
  fixo T-SNE2027, comparecimento 5 dias, notificação 10 dias, depósito 6 meses).
- o objeto da vigilância é precondição de validade com data de expiração, não prazo processual
  ([RN-DASH-134]): o risco é produzir em massa atos inválidos sem perceber.
- selo de frescor + `asOf` em todo número; percentual de AIT lavrados sob equipamento/versão com
  validade comprovada é o indicador-síntese do módulo.

## 5. Estados

- **vazio**: `dashboard.screens.radar_teat.empty`.
- **carregando** / **erro** / **indisponível** / **desatualizado**: padrão M4.
- **bloqueado por decisão**: não se aplica.

## 6. Comandos

- Nenhum comando de mutação; nenhuma ação corretiva a partir do painel ([RN-DASH-134]
  verificação 3): interditar aparelho, cancelar AIT, liberar retenção e abrir apuração são atos
  do TEAT (`agency-admin`, `traffic-authority`), praticados lá. Ações: ver, filtrar, deep-link.

## 7. Saída

- deep-link ao TEAT para a correção (renovar certificado, corrigir homologação); registro
  concorrente aparece bloqueado, com evidência de apuração aberta ([RN-DASH-134] verificação 3).

## 8. Segurança e LGPD

- N1 nos agregados; N2 (equipamento/AIT específico) só sob `LayerGate`; N3 nunca — bodycam:
  disponibilidade e integridade monitoradas, jamais conteúdo ([RN-DASH-134] verificação 4,
  [RN-DASH-170]).

## 9. Acessibilidade

- severidade por forma + rótulo; famílias 1/2 com alerta por antecedência (D-90/D-30/D-7/vencido)
  legível por leitor de tela, não só cor.

## 10. Testes

- roteamento: 9 papéis (presença) e demais (ausência); N3 bloqueado.
- as cinco famílias distinguidas; sessão concorrente exibida como bloqueio com apuração aberta,
  nunca como "resolvido" (ligado a [AC-DASH-006-3]).
- os seis estados aplicáveis como critérios.

## Componentes compartilhados

`FreshnessSeal`, `SeverityChip`, `LegalBasisTag`, `LayerGate`, `DeepLinkButton`,
`ClassificationBadge`.

## Chaves i18n

- `dashboard.screens.radar_teat.title` — "Radar TEAT"
- `dashboard.screens.radar_teat.intro` — "Homologação SENATRAN, verificação metrológica, sessão
  exclusiva, integridade do talão e prazos de custódia."
- `dashboard.screens.radar_teat.empty` — "Nenhum item de vigilância do TEAT em alerta."

Referências (sem criar): `dashboard.states.*`, `dashboard.freshness.*`, `dashboard.severity.*`,
`dashboard.errors.*`, `dashboard.forms.finalidade_n2.*`, `dashboard.a11y.*`.

OD tocada: `OD-D16-002` (política provisória).
