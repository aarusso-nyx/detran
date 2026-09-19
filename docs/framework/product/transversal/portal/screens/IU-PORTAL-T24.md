---
id: IU-PORTAL-T24
title: Meus dados (LGPD) — especificação de tela
status: draft
apps: [portal]
sources: [REF-LEI-13709-2018, REF-LEI-14129-2021]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-24. Fontes: [UC-PORTAL-018], [JRN-PORTAL-011], [RN-PORTAL-118],
[RN-PORTAL-119], [RN-PORTAL-121].

## 1. Identidade

Tela `T-24` "Meus dados (LGPD)" ([IU-PORTAL-001] §B). App `portal`. Rota
`privacidade/meus-dados` (`route-manifest.md` #34). Módulo `privacidade`. `screen: 'T-24'`,
`sheet: 'IU-PORTAL-T24'`.

## 2. Acesso

Ator Cidadão, nível simples para confirmação de existência/formato simplificado, avançada para
declaração completa/dado sensível ([UC-PORTAL-018] pré-condições; [WF-PORTAL-002]).
`access: simples` no manifesto (`route-manifest.md` #34) — a exigência de avançada para o escopo
`declaracao_completa` é gate de formulário, não guarda de rota (`portal-frontends.md` §7 "Meus
dados (T-24)": "declaração completa exige avançada"). Sem `entitlementGuard` (o alvo é sempre o
próprio titular autenticado).

## 3. Entrada

Chega-se por "Meus dados" como item de primeira classe do menu, não escondido em configurações
avançadas ([JRN-PORTAL-011] passo 1). Sem parâmetro de rota. "Parâmetros nunca substituem
consulta autorizada": o escopo consultado é sempre o do CPF da sessão.

## 4. Dados

`GET me` (`portal-route-contract.md` §3, `heldDataSummary[]`) para o panorama por domínio;
`POST privacy/requests` (`@stynx-nyx/privacy`, `portal-route-contract.md` §5.1
`lgpd_declaracao`) para declaração completa, correção ou eliminação. Campos: confirmação
simplificada de existência de tratamento, imediata, sem fila ([UC-PORTAL-018] fluxo 2, AC-1);
panorama por domínio (infrações/RAIT, sinistros/BOAT com o mesmo mascaramento por identidade de
T-19 quando há terceiros, exames/PEC, cadastro/PORTAL), cada seção linkando à tela funcional
correspondente em vez de duplicar conteúdo ([JRN-PORTAL-011] passo 2). Sem fixture como fallback;
"nenhum dado encontrado" é resposta válida, não erro ([UC-PORTAL-018] 2a).

## 5. Estados

- **Carregando**: aguardando `GET me` e o panorama por domínio.
- **Vazio**: nenhum dado vinculado ao CPF — resposta válida e completa ([UC-PORTAL-018] 2a).
- **Indisponível/offline**: leitura de algum domínio fora do ar — banner por seção, sem bloquear
  as demais (`portal-error-catalog.md` §8).
- **Erro recuperável**: `PORTAL.PRIVACY_SCOPE_REQUIRES_ASSURANCE` — declaração completa com
  nível simples (`portal-error-catalog.md` §6) → T-27 com o nível que falta.
- **Erro não recuperável**: `PORTAL.PRIVACY_CORRECTION_NOT_ALLOWED` — campo não corrigível por
  ser de origem nacional (`portal-error-catalog.md` §6; [RN-PORTAL-121]).
- **Sucesso**: dado do titular exibido por completo, sem máscara ([RN-PORTAL-118]; [UC-PORTAL-018]
  AC-5), com ação de correção contextual ao lado de cada seção ([RN-PORTAL-121] item 1).

## 6. Comandos

- "Confirmar existência de tratamento" (`portal.screens.t24.cmd.confirmar`), nível simples,
  imediato, sem prazo de espera ([UC-PORTAL-018] AC-1).
- "Solicitar declaração completa" (`portal.screens.t24.cmd.declaracao_completa`), nível avançado,
  validação: escopo declarado, `POST privacy/requests` com `scope: declaracao_completa`
  (`portal-route-contract.md` §5.1), efeito: protocolo com o prazo do regime público — não os 15
  dias do art.19, II da LGPD ([RN-PORTAL-120]; [UC-PORTAL-018] AC-2).
- "Corrigir" (`portal.screens.t24.cmd.corrigir`), ação de primeira classe ao lado de cada dado,
  nível conforme o escopo (`RN-PORTAL-121] item 1), roteia para a via processual quando o pedido
  é de mérito de ato, nunca indeferido sem alternativa ([RN-PORTAL-121] item 3).
- "Exportar meus dados" (`portal.screens.t24.cmd.exportar`), formato legível por máquina, sem
  custo — não é "portabilidade" ([RN-PORTAL-121] "Regra — portabilidade"; a tela nunca usa essa
  palavra).

"Um clique não muda estado jurídico só pela UI": correção de dado cadastral é providência de
dado, nunca altera o conteúdo de um ato (infração, sinistro, exame) — isso segue a via processual
própria ([RN-PORTAL-121] item 3).

## 7. Saída

Retorna a `/conta` ou permanece em `/privacidade/meus-dados`. Solicitações protocoladas
permanecem visíveis com estado e histórico; abandonar um formulário de correção sem enviar não
grava nada (rascunho não persiste como pedido).

## 8. Segurança

Sem `portal.entitlement` de terceiro — o alvo é sempre o próprio CPF autenticado. Titular vê o
próprio dado sem máscara ([RN-PORTAL-118]); dado de terceiro (ex. em sinistro compartilhado) é
suprimido campo a campo, nunca a seção inteira ([RN-PORTAL-112] item 3; [JRN-PORTAL-011] passo 2).
Nenhuma base legal de tratamento afirmada com falsa certeza — linguagem genérica até confirmação
jurídica da hipótese exata ([JRN-PORTAL-011] passo 6; [RN-PORTAL-122]). Nenhum token/segredo em
tela, URL ou log; toda solicitação é evento de tratamento auditado ([RN-PORTAL-119] Verificação
e).

## 9. Acessibilidade

Cada seção com dado do titular tem ação de correção contextual acessível por teclado
([RN-PORTAL-121] Verificação a); `aria-live` na confirmação imediata e no protocolo da declaração
completa; contraste AA; linguagem simples também como acessibilidade cognitiva
(`_intake/ux-notes.md` §f "Linguagem simples é também acessibilidade cognitiva"); WCAG 2.1 AA +
eMAG ([IU-PORTAL-001] §D).

## 10. Testes

Unitário: nenhum dado do próprio titular aparece mascarado ([RN-PORTAL-118] Verificação b).
Roteamento: `assuranceGuard` no gate de "declaração completa" (presença e ausência de nível
avançado). Jornada feliz: confirmação imediata + declaração completa protocolada com o prazo
correto. Jornada de erro: pedido de correção de mérito roteado para a via processual, com
explicação. Jornada de negação: campo de origem nacional não corrigível, com `howToCorrect`.

## Estados obrigatórios

| Estado            | Chave i18n                                   | Texto cidadão                                                          | Ação seguinte                   |
| ----------------- | -------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------- |
| Carregando        | `portal.screens.t24.state.carregando`        | "Reunindo os dados que temos sobre você."                              | aguardar                        |
| Vazio             | `portal.screens.t24.state.vazio`             | "Não encontramos dados seus em nossos sistemas."                       | —                               |
| Sem elegibilidade | `portal.screens.t24.state.sem_elegibilidade` | "A declaração completa exige um nível de identidade mais alto."        | elevar nível (T-27)             |
| Erro recuperável  | `portal.screens.t24.state.erro_recuperavel`  | "Não foi possível corrigir este campo automaticamente; veja o motivo." | seguir o caminho indicado       |
| Sem permissão     | `portal.screens.t24.state.sem_permissao`     | "Este campo é de origem nacional e não pode ser corrigido por aqui."   | ver como corrigir               |
| Indisponível      | `portal.screens.t24.state.indisponivel`      | "Estamos sem acesso a parte dos seus dados agora."                     | tentar depois; canal presencial |

## Chaves i18n

- `portal.screens.t24.title` — "Meus dados"
- `portal.screens.t24.intro` — "Veja, corrija e solicite os dados que o DETRAN-AM tem sobre você."
- `portal.screens.t24.empty` — "Não encontramos dados seus em nossos sistemas."
- `portal.screens.t24.cmd.confirmar` — "Confirmar que temos dados seus"
- `portal.screens.t24.cmd.declaracao_completa` — "Solicitar declaração completa"
- `portal.screens.t24.cmd.corrigir` — "Corrigir este dado"
- `portal.screens.t24.cmd.exportar` — "Exportar meus dados"
- `portal.screens.t24.state.carregando` — (ver tabela acima)
- `portal.screens.t24.state.vazio` — (ver tabela acima)
- `portal.screens.t24.state.sem_elegibilidade` — (ver tabela acima)
- `portal.screens.t24.state.erro_recuperavel` — (ver tabela acima)
- `portal.screens.t24.state.sem_permissao` — (ver tabela acima)
- `portal.screens.t24.state.indisponivel` — (ver tabela acima)

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por esta tela, não redefinidos aqui.
