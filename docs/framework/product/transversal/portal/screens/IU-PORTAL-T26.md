---
id: IU-PORTAL-T26
title: Avaliação do serviço — especificação de tela
status: draft
apps: [portal]
sources: [REF-LEI-13460-2017, REF-LEI-14129-2021]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-26. Fontes: [UC-PORTAL-017], [JRN-PORTAL-009], [RN-PORTAL-110].

## 1. Identidade

Tela `T-26` "Avaliação do serviço" ([IU-PORTAL-001] §B). App `portal`. Rota
`avaliacao/:requestId` (`route-manifest.md` #33). Módulo `atendimento`. `screen: 'T-26'`,
`sheet: 'IU-PORTAL-T26'`.

## 2. Acesso

Ator Cidadão, nível simples ([UC-PORTAL-017] pré-condições implícitas — mesmo nível do serviço
avaliado). `access: simples` (`route-manifest.md` #33): `portalAuthGuard` +
`assuranceGuard('simples')`. Guarda de vínculo `entitlementGuard('request')` sobre `:requestId`
(`route-manifest.md`). Pré-condição: serviço em `RESULTADO_DISPONIVEL`/`ENCERRADA` no workflow de
origem ([UC-PORTAL-017] pré-condições; [WF-PORTAL-001]/[WF-PORTAL-004]) — a avaliação nunca é
oferecida antes de o cidadão ter algo concreto para avaliar.

## 3. Entrada

Chega-se pelo convite exibido na mesma tela/momento do resultado (T-10 decisão, ou T-22 ao
encerrar manifestação) — nunca como notificação separada dias depois ([UC-PORTAL-017] fluxo 1,
AC-1). Parâmetro de rota `:requestId` validado pelo `entitlementGuard('request')` antes da
composição — "parâmetros nunca substituem consulta autorizada".

## 4. Dados

`POST requests/{id}/evaluation` (`portal-route-contract.md` §5) para o registro; leitura prévia
do estado do pedido vem de `GET requests/{id}` (T-07/T-10) para confirmar `RESULTADO_DISPONIVEL`.
Campos: satisfação com o resultado, qualidade do atendimento, cumprimento do prazo prometido, e
comentário livre opcional — as três dimensões do art.23, I-III ([UC-PORTAL-017] fluxo 2;
[RN-PORTAL-110] item 1). Sem fixture como fallback.

## 5. Estados

- **Carregando**: aguardando confirmação de que o serviço está em condição de ser avaliado.
- **Vazio**: n/a (a tela sempre parte de um `:requestId` concluído).
- **Indisponível/offline**: módulo de atendimento fora do ar — banner de indisponibilidade
  (`portal-error-catalog.md` §8).
- **Erro recuperável**: n/a específico.
- **Erro não recuperável**: `PORTAL.EVALUATION_NOT_OFFERED` — avaliar antes do resultado
  (`portal-error-catalog.md` §3); `PORTAL.EVALUATION_ALREADY_SUBMITTED` — segunda avaliação
  (`portal-error-catalog.md` §6).
- **Sucesso**: confirmação de recebimento com a frase de transparência — "sua resposta alimenta
  um indicador público", sem exigir leitura de texto legal ([UC-PORTAL-017] fluxo 3, AC-3).

## 6. Comandos

"Enviar avaliação" (`portal.screens.t26.cmd.enviar`), nível simples, validação de forma: as três
dimensões obrigatórias mais comentário opcional (`portal-frontends.md` §7 "Avaliação (T-26)"),
sem `Idempotency-Key` distinta do padrão de criação, efeito `AVALIADA`, destino módulo
`atendimento`/consolidação anual e painel do DASHBOARD (`portal-route-contract.md` §5;
[UC-PORTAL-017] fluxo 4; [RN-PORTAL-110] item 5). "Um clique não muda estado jurídico só pela
UI": a avaliação não altera o resultado nem reabre o processo já concluído ([UC-PORTAL-017]
pós-condições).

Se o comentário livre contiver reclamação específica e acionável, a tela oferece, na mesma tela,
o caminho direto para abrir manifestação formal de ouvidoria (T-21) — a avaliação não substitui o
canal de ouvidoria quando o cidadão quer resposta individual ([UC-PORTAL-017] 2a).

## 7. Saída

Após enviar, retorna ao resultado de origem (T-10/T-22) ou a "Meus processos". Ausência de
resposta dentro da janela do convite não é tratada como avaliação negativa nem positiva — a tela
não insiste além de um lembrete único ([UC-PORTAL-017] 1a).

## 8. Segurança

Vínculo checado por `portal.entitlement` (`kind: request`). Resultado agregado é publicado
integralmente, nunca seletivamente ([UC-PORTAL-017] AC-4; [RN-PORTAL-110] item 3). Nenhum
token/segredo em tela, URL ou log.

## 9. Acessibilidade

Formulário de avaliação navegável por teclado, com as cinco dimensões da lei claramente
rotuladas; `aria-live` na confirmação de envio; contraste AA; alvo de toque generoso nas opções
de nota; WCAG 2.1 AA + eMAG ([IU-PORTAL-001] §D).

## 10. Testes

Unitário: envio bloqueado sem `RESULTADO_DISPONIVEL`/`ENCERRADA` ([UC-PORTAL-017] pré-condições).
Roteamento: `entitlementGuard('request')`, presença e ausência. Jornada feliz: avaliação enviada
com confirmação de transparência. Jornada de erro: segunda avaliação recusada. Jornada de
negação: avaliação tentada antes do resultado.

## Estados obrigatórios

| Estado            | Chave i18n                                   | Texto cidadão                                                      | Ação seguinte                       |
| ----------------- | -------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------- |
| Carregando        | `portal.screens.t26.state.carregando`        | "Preparando a avaliação do seu atendimento."                       | aguardar                            |
| Vazio             | `portal.screens.t26.state.vazio`             | "Não aplicável — a avaliação já parte de um serviço identificado." | —                                   |
| Sem elegibilidade | `portal.screens.t26.state.sem_elegibilidade` | "Este serviço ainda não tem resultado para avaliar."               | voltar quando o resultado sair      |
| Erro recuperável  | `portal.screens.t26.state.erro_recuperavel`  | "Você já avaliou este serviço."                                    | ver o que respondeu                 |
| Sem permissão     | `portal.screens.t26.state.sem_permissao`     | "Não encontramos vínculo seu com este serviço."                    | "por que não vejo isto" + ouvidoria |
| Indisponível      | `portal.screens.t26.state.indisponivel`      | "Estamos sem acesso ao módulo de avaliação agora."                 | tentar depois                       |

## Chaves i18n

- `portal.screens.t26.title` — "Avaliar o serviço"
- `portal.screens.t26.intro` — "Conte como foi seu atendimento — sua resposta ajuda a melhorar o serviço."
- `portal.screens.t26.cmd.enviar` — "Enviar avaliação"
- `portal.screens.t26.cmd.abrir_manifestacao` — "Registrar uma manifestação sobre isso"
- `portal.screens.t26.state.carregando` — (ver tabela acima)
- `portal.screens.t26.state.vazio` — (ver tabela acima)
- `portal.screens.t26.state.sem_elegibilidade` — (ver tabela acima)
- `portal.screens.t26.state.erro_recuperavel` — (ver tabela acima)
- `portal.screens.t26.state.sem_permissao` — (ver tabela acima)
- `portal.screens.t26.state.indisponivel` — (ver tabela acima)
- `portal.screens.t26.field.satisfacao` — "Sua satisfação com o resultado"
- `portal.screens.t26.field.qualidade` — "Qualidade do atendimento"
- `portal.screens.t26.field.prazo_cumprido` — "O prazo prometido foi cumprido?"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por esta tela, não redefinidos aqui.
