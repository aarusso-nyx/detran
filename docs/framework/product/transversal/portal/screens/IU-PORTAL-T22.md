---
id: IU-PORTAL-T22
title: Acompanhar manifestação — especificação de tela
status: draft
apps: [portal]
sources: [REF-LEI-13460-2017]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-22. Fontes: [UC-PORTAL-016], [JRN-PORTAL-009], [RN-PORTAL-109].

## 1. Identidade

Tela `T-22` "Acompanhar manifestação" ([IU-PORTAL-001] §B). App `portal`. Rota
`ouvidoria/:manifestationId` (`route-manifest.md` #32). Módulo `atendimento`. `screen: 'T-22'`,
`sheet: 'IU-PORTAL-T22'`.

## 2. Acesso

Ator Cidadão, nível simples para acompanhar (DT-051 fechado, H.51: "nenhum para manifestar,
simples para acompanhar" — [UC-PORTAL-016] Atualização 2026-09-13). `access: simples`
(`route-manifest.md` #32): `portalAuthGuard` + `assuranceGuard('simples')`. Guarda de vínculo
`entitlementGuard('manifestation')` sobre `:manifestationId` (`route-manifest.md`). Sem vínculo
com a manifestação (ex. protocolo de outro cidadão), a tela explica o motivo, nunca "acesso
negado" seco ([WF-PORTAL-001] invariante 8).

## 3. Entrada

Chega-se pelo comprovante emitido ao enviar (T-21), pela caixa de notificações (T-12, quando há
atualização) ou por "Meus processos". Parâmetro de rota `:manifestationId` validado pelo
`entitlementGuard('manifestation')` — "parâmetros nunca substituem consulta autorizada"
([WF-PORTAL-002] `VINCULO_VERIFICADO`).

## 4. Dados

`GET manifestations/{id}` (`portal-route-contract.md` §8) — estado traduzido, protocolo, prazos
(`agencyDueOn`, prorrogação com justificativa), decisão quando existir, indicador de avaliação
oferecida. Os dois relógios legais aparecem sempre distintos: o relógio do usuário (30 dias,
prorrogável uma vez, teto 60 — [RN-PORTAL-109] item 4) é o único exibido ao cidadão; o relógio
interno de 20 dias entre a ouvidoria e o agente ([RN-PORTAL-109] item 5) nunca aparece como se
fosse prazo do cidadão ([UC-PORTAL-016] AC-4; [JRN-PORTAL-009] passo 3). Prorrogação é comunicada
com a justificativa, nunca silenciosa ([UC-PORTAL-016] 4a; [JRN-PORTAL-009] passo 5). Sem fixture
como fallback.

## 5. Estados

- **Carregando**: aguardando a leitura da manifestação.
- **Vazio**: n/a (a tela sempre tem uma manifestação de referência pelo `:manifestationId`).
- **Indisponível/offline**: leitura do módulo de atendimento fora do ar — banner de
  indisponibilidade (`portal-error-catalog.md` §8).
- **Erro recuperável**: n/a específico — o estado em análise é sempre mostrado honestamente
  (`EM_ANALISE`, `INFORMACAO_SOLICITADA_AO_AGENTE` traduzidos — [WF-PORTAL-004]).
- **Erro não recuperável**: sem vínculo com a manifestação — `PORTAL.NOT_FOUND`, tela "por que
  não vejo isto" (`portal-error-catalog.md` §2).
- **Sucesso**: status em linguagem cidadã, contador visível ("resposta até DD/MM"), decisão final
  com ciência confirmada, convite a avaliar quando `ENCERRADA` ([UC-PORTAL-016] fluxos 4-5;
  [JRN-PORTAL-009] passo 4).

## 6. Comandos

"Confirmar ciência" (`portal.screens.t22.cmd.confirmar_ciencia`), nível simples, sem validação de
forma adicional, sem `Idempotency-Key` explícita além do padrão de leitura confirmada, efeito
`CIENCIA_AO_USUARIO → ENCERRADA` ([WF-PORTAL-004]), destino módulo `atendimento`, auditado. "Um
clique não muda estado jurídico só pela UI": a decisão administrativa já foi tomada pela
ouvidoria; este comando só registra a ciência do cidadão.

## 7. Saída

Retorna a `/notificacoes` (T-12) ou "Meus processos". Quando `ENCERRADA`, a tela oferece o
convite de avaliação (T-26) na mesma tela do resultado, nunca como notificação genérica dias
depois ([UC-PORTAL-017] AC-1, reaproveitado como padrão do ciclo em [WF-PORTAL-004]). Nenhum
dado em edição nesta tela — sem confirmação de abandono.

## 8. Segurança

Vínculo checado por `portal.entitlement` (`kind: manifestation`) antes de exibir qualquer
conteúdo. Sigilo do denunciante preservado quando solicitado no envio ([UC-PORTAL-016] 1a).
Nenhum token/segredo em tela, URL ou log. Vocabulário de bastidor (`EM_ANALISE`,
`INFORMACAO_SOLICITADA_AO_AGENTE`) só em `data-token` ([WF-PORTAL-001] invariante 1;
`portal-frontends.md` §2.1).

## 9. Acessibilidade

Contador de prazo com ícone + texto, nunca só cor ([_intake/ux-notes.md] §f "Contraste sob
sol"); `aria-live` na mudança de estado; foco move ao topo da linha do tempo após atualização;
contraste AA; WCAG 2.1 AA + eMAG ([IU-PORTAL-001] §D).

## 10. Testes

Unitário: relógio do usuário (30+30) e relógio interno (20+20) nunca aparecem confundidos na
mesma leitura de tela ([RN-PORTAL-109] item 5). Roteamento: `entitlementGuard('manifestation')`
presente e ausente. Jornada feliz: acompanhamento até `ENCERRADA` com convite de avaliação.
Jornada de erro: leitura do módulo indisponível. Jornada de negação: sem vínculo com a
manifestação.

## Estados obrigatórios

| Estado            | Chave i18n                                   | Texto cidadão                                                         | Ação seguinte                       |
| ----------------- | -------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------- |
| Carregando        | `portal.screens.t22.state.carregando`        | "Buscando o andamento da sua manifestação."                           | aguardar                            |
| Vazio             | `portal.screens.t22.state.vazio`             | "Não aplicável — a manifestação já está identificada pelo protocolo." | —                                   |
| Sem elegibilidade | `portal.screens.t22.state.sem_elegibilidade` | "O acompanhamento não está disponível para o seu perfil agora."       | canal alternativo ([RN-PORTAL-105]) |
| Erro recuperável  | `portal.screens.t22.state.erro_recuperavel`  | "Sua manifestação está em análise pela ouvidoria."                    | acompanhar o prazo exibido          |
| Sem permissão     | `portal.screens.t22.state.sem_permissao`     | "Não encontramos vínculo seu com esta manifestação."                  | "por que não vejo isto" + ouvidoria |
| Indisponível      | `portal.screens.t22.state.indisponivel`      | "Estamos sem acesso ao sistema de ouvidoria agora."                   | tentar depois; canal presencial     |

## Chaves i18n

- `portal.screens.t22.title` — "Acompanhar manifestação"
- `portal.screens.t22.intro` — "Veja o andamento e o prazo de resposta da sua manifestação."
- `portal.screens.t22.cmd.confirmar_ciencia` — "Confirmar que recebi a resposta"
- `portal.screens.t22.state.carregando` — (ver tabela acima)
- `portal.screens.t22.state.vazio` — (ver tabela acima)
- `portal.screens.t22.state.sem_elegibilidade` — (ver tabela acima)
- `portal.screens.t22.state.erro_recuperavel` — (ver tabela acima)
- `portal.screens.t22.state.sem_permissao` — (ver tabela acima)
- `portal.screens.t22.state.indisponivel` — (ver tabela acima)
- `portal.screens.t22.field.prazo_orgao` — "Prazo do órgão para responder"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por esta tela, não redefinidos aqui.
