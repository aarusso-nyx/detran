---
id: IU-PORTAL-T21
title: Nova manifestação (ouvidoria) — especificação de tela
status: draft
apps: [portal]
sources: [REF-LEI-13460-2017]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-21. Fontes: [UC-PORTAL-016], [JRN-PORTAL-009], [RN-PORTAL-109].

## 1. Identidade

Tela `T-21` "Nova manifestação (ouvidoria)" ([IU-PORTAL-001] §B). App `portal`. Rota
`ouvidoria/nova` (`route-manifest.md` #31). Módulo `atendimento`. `screen: 'T-21'`,
`sheet: 'IU-PORTAL-T21'`.

## 2. Acesso

Ator anônimo admitido ou Cidadão — `access: nenhum_ou_simples` (`route-manifest.md` #31,
DT-051 fechado, H.51): sem guarda, sessão opcional ([UC-PORTAL-016] pré-condições; [RN-PORTAL-101]
linha 3, "nenhum nível exigível"; [RN-PORTAL-109] item 2). Nenhuma pré-condição além da
identificação mínima necessária para não inviabilizar a manifestação — o sistema **nunca** recusa
o recebimento (art.11, [UC-PORTAL-016] pré-condições).

## 3. Entrada

Chega-se pelo menu "Ouvidoria", acessível a qualquer visitante, anônimo ou autenticado
([UC-PORTAL-016] fluxo 1). Sem parâmetro de rota. "Parâmetros nunca substituem consulta
autorizada": identificação do requerente, quando fornecida, é a da sessão ou do formulário, nunca
inferida de outro parâmetro.

## 4. Dados

`POST manifestations` (`portal-route-contract.md` §8) — não há leitura prévia nesta tela, apenas
o formulário de composição. Campos: tipo (reclamação, denúncia, sugestão, elogio, solicitação —
[UC-PORTAL-016] fluxo 1; `WF-PORTAL-004` nota sobre a taxonomia do art.2º V), descrição livre
(sem categorização fechada de causa obrigatória, [UC-PORTAL-016] AC-2), sigilo do denunciante
opcional, anexos, indicação de anonimato. Nenhum dado pré-existente é consultado (é criação, não
leitura) — sem fixture como fallback.

## 5. Estados

- **Carregando**: n/a no formulário vazio; aplica-se ao envio (submissão em curso).
- **Vazio**: n/a (formulário sempre disponível).
- **Indisponível/offline**: canal de ouvidoria fora do ar — banner de indisponibilidade
  (`portal-error-catalog.md` §8); nunca um motivo que sugira recusa de recebimento
  ([RN-PORTAL-109] item 1).
- **Erro recuperável**: falha de validação de forma (`PORTAL.MANIFESTATION_KIND_INVALID`,
  `portal-error-catalog.md` §6) — inline, foco no primeiro campo.
- **Erro não recuperável**: n/a — recebimento é sempre irrecusável ([RN-PORTAL-109] item 1;
  `PORTAL.MANIFESTATION_NEVER_REFUSED` é invariante de sistema, nunca de UI,
  `portal-error-catalog.md` §6).
- **Sucesso**: comprovante imediato com número de protocolo ([UC-PORTAL-016] fluxo 3;
  [RN-PORTAL-109] item 3).

## 6. Comandos

"Enviar manifestação" (`portal.screens.t21.cmd.enviar`), nível **nenhum** exigível
([RN-PORTAL-101] linha 3; [RN-PORTAL-109] item 2), validação de forma: tipo dentre a taxonomia,
descrição livre sem exigência de causa (`portal-frontends.md` §7 "Manifestação"), idempotência
por `Idempotency-Key` (`portal-route-contract.md` §8), efeito
`MANIFESTACAO_REGISTRADA → COMPROVANTE_EMITIDO` ([WF-PORTAL-004]), destino
`portal/citizen-service`, comprovante imediato com protocolo. "Um clique não muda estado jurídico
só pela UI": o envio gera protocolo, mas a análise de mérito segue o workflow da ouvidoria
([WF-PORTAL-004] `EM_ANALISE`).

## 7. Saída

Após o envio, a tela leva ao comprovante e, com o protocolo, a `/ouvidoria/:manifestationId`
(T-22). Se o cidadão abandona o formulário antes de enviar, não há confirmação — não há rascunho
persistido nesta tela (o envio é atômico).

## 8. Segurança

Sem `portal.entitlement` (ato aberto a qualquer cidadão sobre a própria manifestação). Sigilo do
denunciante preservado nas telas de acompanhamento internas quando solicitado ([UC-PORTAL-016]
1a). Nenhum token/segredo em tela, URL ou log. Nenhuma exigência de motivo determinante
([RN-PORTAL-109] item 2).

## 9. Acessibilidade

Formulário navegável por teclado; mensagens de erro associadas ao campo (`aria-describedby`);
`aria-live` na confirmação de envio; contraste AA; linguagem cidadã, sem jargão de "triagem" ou
"admissibilidade" ([_intake/ux-notes.md] §c "Tom"); WCAG 2.1 AA + eMAG ([IU-PORTAL-001] §D).

## 10. Testes

Unitário: nenhuma combinação de tipo/descrição bloqueia o envio (recebimento irrecusável,
[RN-PORTAL-109] item 1). Roteamento: rota acessível sem sessão (anônimo) e com sessão
(autenticado) — presença e ausência de guarda, conforme `access: nenhum_ou_simples`. Jornada
feliz: envio com comprovante e protocolo. Jornada de erro: falha de validação de forma, inline.
Jornada de negação: n/a (recebimento nunca é recusado).

## Estados obrigatórios

| Estado            | Chave i18n                                   | Texto cidadão                                               | Ação seguinte                   |
| ----------------- | -------------------------------------------- | ----------------------------------------------------------- | ------------------------------- |
| Carregando        | `portal.screens.t21.state.carregando`        | "Enviando sua manifestação."                                | aguardar                        |
| Vazio             | `portal.screens.t21.state.vazio`             | "Não aplicável — o formulário está sempre disponível."      | preencher o formulário          |
| Sem elegibilidade | `portal.screens.t21.state.sem_elegibilidade` | "Não aplicável — a ouvidoria recebe qualquer manifestação." | preencher o formulário          |
| Erro recuperável  | `portal.screens.t21.state.erro_recuperavel`  | "Confira o tipo e a descrição antes de enviar."             | corrigir o campo indicado       |
| Sem permissão     | `portal.screens.t21.state.sem_permissao`     | "Não aplicável — nenhum nível é exigido para manifestar."   | preencher o formulário          |
| Indisponível      | `portal.screens.t21.state.indisponivel`      | "Estamos sem acesso ao canal de ouvidoria agora."           | tentar depois; canal presencial |

## Chaves i18n

- `portal.screens.t21.title` — "Nova manifestação"
- `portal.screens.t21.intro` — "Registre sua reclamação, denúncia, sugestão, elogio ou solicitação."
- `portal.screens.t21.cmd.enviar` — "Enviar manifestação"
- `portal.screens.t21.state.carregando` — (ver tabela acima)
- `portal.screens.t21.state.vazio` — (ver tabela acima)
- `portal.screens.t21.state.sem_elegibilidade` — (ver tabela acima)
- `portal.screens.t21.state.erro_recuperavel` — (ver tabela acima)
- `portal.screens.t21.state.sem_permissao` — (ver tabela acima)
- `portal.screens.t21.state.indisponivel` — (ver tabela acima)
- `portal.screens.t21.field.tipo` — "Tipo de manifestação"
- `portal.screens.t21.field.descricao` — "Descreva o que aconteceu"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por esta tela, não redefinidos aqui.
