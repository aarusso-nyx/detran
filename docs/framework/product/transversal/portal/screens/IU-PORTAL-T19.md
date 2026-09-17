---
id: IU-PORTAL-T19
title: Detalhe do sinistro — especificação de tela
status: draft
apps: [portal]
sources:
  [REF-CONTRAN-808-2020, REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-19. Fontes: [UC-PORTAL-013], [JRN-PORTAL-007], [RN-PORTAL-118].

## 1. Identidade

Tela `T-19` "Detalhe do sinistro" ([IU-PORTAL-001] §B). App `portal`. Rota `sinistros/:crashId`
(`route-manifest.md` #28). Módulo `sinistros`. `screen: 'T-19'`, `sheet: 'IU-PORTAL-T19'`.

## 2. Acesso

Ator Cidadão em nível simples — consultar dado próprio é ato de nível **simples**
([RN-PORTAL-101] linha 1). `access: simples` (`route-manifest.md` #28): `portalAuthGuard` +
`assuranceGuard('simples')` (`portal-frontends.md` §3). Guarda de vínculo
`entitlementGuard('crash')` sobre `:crashId` (`route-manifest.md`). Pré-condição: o sinistro
está `FECHADO`/`INTEGRADO` ([WF-BOAT-001]; [UC-PORTAL-013] AC-4) — registro ainda
`RASCUNHO`/`EM_ATENDIMENTO` não é tratado como consultável. Sem vínculo comprovado com o
sinistro, a tela não nega acesso seco: mostra a explicação "por que não vejo isto" com caminho
para a ouvidoria ([UC-PORTAL-013] 2b; `portal-frontends.md` §3; [WF-PORTAL-001] invariante 8;
`portal-frontends.md` §2.8), nunca uma tela vazia.

## 3. Entrada

Chega-se pela busca em `/sinistros` (T-18, `route-manifest.md` #27) ou por notificação recebida
na caixa do cidadão sobre um sinistro em que o veículo do usuário está envolvido
([JRN-PORTAL-007] passo 1-2). O parâmetro de rota `:crashId` é validado pelo
`entitlementGuard('crash')` antes de qualquer exibição de conteúdo — parâmetro de rota nunca
substitui a consulta de vínculo autorizada ([WF-PORTAL-002] `VINCULO_VERIFICADO`;
`portal-frontends.md` §3). A busca de origem (T-18) usa chave estreita (CPF/CNH + dado do
veículo, ou protocolo já recebido), nunca busca aberta por data/local que exponha sinistro de
terceiros ([JRN-PORTAL-007] passo 2).

## 4. Dados

`GET crashes/{id}` (`portal-route-contract.md` §7) — projeção do BOAT (`FECHADO`/`INTEGRADO`,
ADR-0020). Campos exibidos dependem da condição do consultante no sinistro: dados objetivos
(local, data/hora, dinâmica, croqui, classificação de gravidade) sempre; dados do próprio
titular (inclusive de saúde, quando aplicável) sem máscara; dado de saúde de terceiro e PII de
outro envolvido além de placa/seguradora ficam suprimidos campo a campo, nunca o documento
inteiro ([JRN-PORTAL-007] passo 3; [RN-PORTAL-118]; [UC-PORTAL-013] AC-2). Nenhuma leitura direta
de tabela do BOAT pelo navegador — só a projeção via `/v1/portal/*` (`portal-frontends.md` §1).
Sem fixture como fallback: registro ainda não fechado mostra status honesto de andamento, nunca
um dado ou prazo inventado ([JRN-PORTAL-007] passo 5).

## 5. Estados

- **Carregando**: aguardando a projeção do BOAT.
- **Vazio**: nenhum sinistro localizado para os dados de busca — resposta válida, não erro
  (mesmo padrão de "nenhum dado é resposta válida" de [UC-PORTAL-018] 2a, transposto aqui).
- **Indisponível/offline**: leitura do BOAT fora do ar — banner "sem acesso ao sistema; seus
  dados não mudam" (`portal-error-catalog.md` §8).
- **Erro recuperável**: registro ainda em `RASCUNHO`/`EM_ATENDIMENTO` — "em andamento —
  aguardando finalização pelo órgão", sem prazo inventado ([JRN-PORTAL-007] passo 5;
  `_intake/ux-notes.md` §i.9).
- **Erro não recuperável**: sem vínculo comprovado — `PORTAL.NOT_FOUND`/
  `PORTAL.ENTITLEMENT_REQUIRED`, tela "por que não vejo isto" (`portal-error-catalog.md` §2/§8).
- **Sucesso**: resumo em linguagem simples primeiro (sinistro registrado, protocolo, data),
  documento oficial disponível para download, nunca obrigatório de ler ([JRN-PORTAL-007] passo 4).

## 6. Comandos

Único comando: "Baixar boletim" (`portal.screens.t19.cmd.baixar`), nível simples, sem validação
de forma (download), sem `Idempotency-Key` (leitura), sem efeito sobre o estado jurídico do
registro — o PORTAL só lê o BOAT, nunca escreve nele ([UC-PORTAL-013] pós-condições: "nenhuma
alteração do registro BOAT"). Toda consulta a dado sensível gera `@Audit`
(`portal-route-contract.md` §1.7; [UC-PORTAL-013] AC-3). "Um clique não muda estado jurídico só
pela UI" se aplica por vacuidade: não há comando de escrita nesta tela.

## 7. Saída

Retorna a `/sinistros` (T-18). Nenhum rascunho a preservar — tela somente leitura; sem
confirmação de abandono por não haver edição em curso.

## 8. Segurança

Vínculo checado por `portal.entitlement` (`kind: crash`) antes de qualquer exibição
([UC-PORTAL-013] pré-condições). Minimização: dado de saúde de terceiro nunca é liberado ao
consultante que não é o titular ([RN-PORTAL-118]; [JRN-PORTAL-007] passo 3). Titular vê o próprio
dado sem máscara; terceiro só o estritamente necessário (placa/seguradora, nunca CPF/endereço)
([RN-PORTAL-118]; [IU-PORTAL-001] §E.4). Nenhum token/segredo em tela, URL ou log. Vocabulário de
bastidor (`RECEBIDO`, `CONSOLIDADO`, `pending_complement`, RENAEST) só em `data-token`, nunca na
tela ([JRN-PORTAL-007] passo 6; `portal-frontends.md` §2.1).

## 9. Acessibilidade

Navegação por teclado completa; foco move para o resumo assim que o conteúdo carrega;
`aria-live` nos estados de carregamento e indisponibilidade; contraste AA testável sob luz
direta ([IU-PORTAL-001] §D; `_intake/ux-notes.md` §f); linguagem cidadã no resumo
([JRN-PORTAL-007] passo 4); WCAG 2.1 AA + eMAG obrigatório, sem trilha "acessível" paralela
([IU-PORTAL-001] §D).

## 10. Testes

Unitário: supressão de campo de terceiro (saúde, PII) quando o consultante não é o titular
daquele campo. Roteamento: `entitlementGuard('crash')` presente e ausente (com e sem vínculo);
`assuranceGuard('simples')` presente e ausente. Jornada feliz: titular baixa o próprio boletim.
Jornada de erro: sem vínculo → "por que não vejo isto". Jornada de negação: registro ainda não
fechado → status honesto sem prazo.

## Estados obrigatórios

| Estado            | Chave i18n                                   | Texto cidadão                                                        | Ação seguinte                       |
| ----------------- | -------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------- |
| Carregando        | `portal.screens.t19.state.carregando`        | "Buscando os dados do seu sinistro."                                 | aguardar                            |
| Vazio             | `portal.screens.t19.state.vazio`             | "Não encontramos sinistro com esses dados."                          | voltar à busca (T-18)               |
| Sem elegibilidade | `portal.screens.t19.state.sem_elegibilidade` | "A consulta de boletim não está disponível para o seu perfil agora." | canal alternativo ([RN-PORTAL-105]) |
| Erro recuperável  | `portal.screens.t19.state.erro_recuperavel`  | "Seu sinistro ainda está em processamento pelo órgão."               | voltar mais tarde                   |
| Sem permissão     | `portal.screens.t19.state.sem_permissao`     | "Não encontramos vínculo seu com este sinistro."                     | "por que não vejo isto" + ouvidoria |
| Indisponível      | `portal.screens.t19.state.indisponivel`      | "Estamos sem acesso ao sistema de sinistros agora."                  | tentar depois; canal presencial     |

## Chaves i18n

- `portal.screens.t19.title` — "Detalhe do sinistro"
- `portal.screens.t19.intro` — "Veja os dados do seu sinistro e baixe o boletim."
- `portal.screens.t19.empty` — "Não encontramos sinistro com esses dados."
- `portal.screens.t19.cmd.baixar` — "Baixar boletim"
- `portal.screens.t19.state.carregando` — (ver tabela acima)
- `portal.screens.t19.state.vazio` — (ver tabela acima)
- `portal.screens.t19.state.sem_elegibilidade` — (ver tabela acima)
- `portal.screens.t19.state.erro_recuperavel` — (ver tabela acima)
- `portal.screens.t19.state.sem_permissao` — (ver tabela acima)
- `portal.screens.t19.state.indisponivel` — (ver tabela acima)
- `portal.screens.t19.field.gravidade` — "Classificação de gravidade"
- `portal.screens.t19.field.dinamica` — "O que aconteceu"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por esta tela, não redefinidos aqui.
