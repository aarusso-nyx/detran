---
id: IU-PORTAL-T27
title: Elevação de nível de assinatura — especificação de tela
status: draft
apps: [portal]
sources: [REF-DECRETO-10543-2020, REF-DECRETO-8936-2016]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-27. Fontes: [UC-PORTAL-019], [JRN-PORTAL-001], [RN-PORTAL-101],
[RN-PORTAL-102].

## 1. Identidade

Tela `T-27` "Elevação de nível de assinatura" ([IU-PORTAL-001] §C, "Transversal"). App `portal`.
Rota `assinatura/elevacao` (`route-manifest.md` #35). Módulo `assinatura`. `screen: 'T-27'`,
`sheet: 'IU-PORTAL-T27'`. Destino padrão de `assuranceGuard(level)` para qualquer rota de ato que
exija nível superior (`portal-frontends.md` §3; M8, `plan.md`).

## 2. Acesso

Ator Cidadão autenticado com conta gov.br de nível insuficiente para o ato selecionado
([UC-PORTAL-019] pré-condições; [WF-PORTAL-002] `NIVEL_INSUFICIENTE`). `access: simples`
(`route-manifest.md` #35) — a própria elevação exige apenas nível simples para iniciar
(`portalAuthGuard` + `assuranceGuard('simples')`); o nível avançado é o resultado do fluxo, não
seu pré-requisito. Sem `entitlementGuard`.

## 3. Entrada

Chega-se sempre por redirecionamento de `assuranceGuard(level)` de outra rota de ato
(`UrlTree('/assinatura/elevacao', { queryParams: { retomar: state.url } })` — `plan.md` M8), nunca
por navegação direta espontânea sem contexto. Parâmetro `retomar` guarda a rota original;
"parâmetros nunca substituem consulta autorizada": o `resumeToken` retornado por
`POST assurance/elevations` (`portal-route-contract.md` §3) é o que efetivamente autoriza a
retomada, não o valor de `retomar` isolado.

Premissa adotada ([IU-PORTAL-001] §F; T-02/T-03/T-05/T-27): DT-050 está **fechada** — Portaria
Normativa DETRAN-AM 001/2025 ([REF-DETRANAM-PORTARIA-NORMATIVA-001-2025]) confirma a exigência de
avançada com base em ato estadual (H.50), e o Owner decidiu que o PORTAL aceita os selos gov.br
**prata e ouro** como satisfazendo o nível avançado, e bronze como insuficiente, enquanto o
DETRAN-AM não edita portaria própria sobre o selo prata ([RN-PORTAL-101] "Fonte institucional
localizada e decisão do Owner"; [RN-PORTAL-102] "Atualização 2026-09-13"). A tela nunca condiciona
a exigência à cor do selo em texto ("bronze"/"prata"/"ouro" só em ajuda, nunca como predicado de
autorização — [RN-PORTAL-102] Verificação a).

## 4. Dados

`POST assurance/elevations` e `POST assurance/elevations/{id}/complete`
(`portal-route-contract.md` §3). Campos: nível exigido (`actKey`, `required`, `current`,
`elevationMethods[]`, `resumeRoute` — `portal-error-catalog.md` §1
`PORTAL.ASSURANCE_INSUFFICIENT`), caminho escolhido (biográfica/documental, biométrica, ou
ICP-Brasil — [UC-PORTAL-019] fluxo 3; [RN-PORTAL-101] linhas 5-8 e §5º "Elevação é possível,
rebaixamento não"). A matriz ato→nível vem sempre de `GET me` (`actRequirements[]`), nunca de
tabela no cliente (`portal-frontends.md` §3). Prazo legal do ato original, se estiver correndo,
permanece visível durante toda a elevação — a elevação não pausa nenhum prazo ([UC-PORTAL-019]
4a). Sem fixture como fallback.

## 5. Estados

- **Carregando**: aguardando o redirecionamento gov.br ou a conclusão da validação.
- **Vazio**: n/a (a tela sempre parte de um ato específico que exige elevação).
- **Indisponível/offline**: Plataforma gov.br fora do ar — banner de indisponibilidade
  (`portal-error-catalog.md` §8), sem simular elevação.
- **Erro recuperável**: validação biométrica falha — oferece imediatamente o caminho alternativo
  (biográfico/documental), nunca deixa o cidadão preso a um único método ([UC-PORTAL-019] 3b).
- **Erro não recuperável**: `PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED` — política exigindo
  qualificada é violação de invariante ([RN-PORTAL-101] item c; `portal-error-catalog.md` §1).
- **Sucesso**: elevação concluída, ato original retomado exatamente de onde o cidadão parou,
  nunca reiniciado do zero ([UC-PORTAL-019] fluxo 4, AC-4).

## 6. Comandos

"Elevar meu nível agora" (`portal.screens.t27.cmd.elevar`), nível de partida simples, validação
de forma: escolha de um dos três caminhos do art.5º, I-III do Decreto 10.543/2020
([UC-PORTAL-019] fluxo 3), idempotência via `resumeToken` (não reinicia elevação em curso),
efeito `POST assurance/elevations` → redirect gov.br → `complete` → nível de assinatura elevado
(evento do domínio `portal`, `portal-route-contract.md` §3/§10), destino módulo `assinatura`,
auditado. "Um clique não muda
estado jurídico só pela UI": a elevação em si não pratica o ato original — apenas destrava a
assinatura; o ato (defesa, indicação etc.) só se protocola no `submit` da tela de origem.

Se o cidadão interrompe antes de concluir, o sistema salva o ato original como rascunho e mantém
lembrete visível ("Falta 1 passo: verificar sua identidade"), nunca some o progresso — alimenta o
KPI "taxa de elevação de nível abandonada" ([UC-PORTAL-019] 3a; [APP-PORTAL]).

## 7. Saída

Concluída a elevação, retorna automaticamente à rota original (`retomar`), com o formulário
preenchido intacto ([UC-PORTAL-019] AC-4). Se o cidadão sai sem concluir, o rascunho do ato
original permanece salvo no servidor, retomável depois ([UC-PORTAL-019] 3a) — sem necessidade de
confirmação adicional de abandono, pois nada se perde.

## 8. Segurança

Sem `portal.entitlement` (o alvo é a própria conta do cidadão). Nível de assinatura é claim
assinada do principal, nunca aceito do corpo (`portal-route-contract.md` §1.3;
`portal-frontends.md` §1). Nenhum dado biométrico/documental é retido pelo PORTAL — a validação é
inteiramente da Plataforma gov.br ([UC-PORTAL-019] fluxo 3; `portal-route-contract.md` §3, "nada
armazenado além do token de retomada"). Nenhum token/segredo em tela, URL ou log — o
`resumeToken` trafega apenas no fluxo de redirecionamento, nunca exibido na tela.

## 9. Acessibilidade

Explicação de qual nível falta e por quê, em linguagem simples, nunca erro seco ([UC-PORTAL-019]
AC-1); `aria-live` na conclusão da elevação e na retomada do ato; contraste AA; alvo de toque
generoso nos três caminhos de validação; WCAG 2.1 AA + eMAG ([IU-PORTAL-001] §D).

## 10. Testes

Unitário: nível de conta (bronze/prata/ouro) nunca aparece em posição de condição de autorização
no código ou na tela — só em texto de ajuda ([RN-PORTAL-102] Verificação a). Roteamento:
`assuranceGuard(level)` de qualquer rota de ato redireciona para `/assinatura/elevacao` com
`retomar`, presença e ausência de nível suficiente. Jornada feliz: elevação concluída retoma o
ato exatamente onde parou. Jornada de erro: validação biométrica falha, caminho alternativo
oferecido. Jornada de negação: elevação abandonada, rascunho preservado com lembrete.

## Estados obrigatórios

| Estado            | Chave i18n                                   | Texto cidadão                                                               | Ação seguinte                            |
| ----------------- | -------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| Carregando        | `portal.screens.t27.state.carregando`        | "Preparando a verificação da sua identidade."                               | aguardar                                 |
| Vazio             | `portal.screens.t27.state.vazio`             | "Não aplicável — a tela sempre parte de um ato que exige nível maior."      | —                                        |
| Sem elegibilidade | `portal.screens.t27.state.sem_elegibilidade` | "Nenhum caminho de verificação está disponível para você agora."            | canal alternativo ([RN-PORTAL-105])      |
| Erro recuperável  | `portal.screens.t27.state.erro_recuperavel`  | "Não conseguimos confirmar por reconhecimento facial; tente outro caminho." | escolher validação biográfica/documental |
| Sem permissão     | `portal.screens.t27.state.sem_permissao`     | "Não aplicável — a elevação é sempre do seu próprio nível."                 | —                                        |
| Indisponível      | `portal.screens.t27.state.indisponivel`      | "Estamos sem acesso à Plataforma gov.br agora."                             | tentar depois; canal presencial          |

## Chaves i18n

- `portal.screens.t27.title` — "Confirme sua identidade para continuar"
- `portal.screens.t27.intro` — "Este passo confirma sua identidade com mais segurança. Leva menos de dois minutos."
- `portal.screens.t27.cmd.elevar` — "Elevar meu nível agora"
- `portal.screens.t27.state.carregando` — (ver tabela acima)
- `portal.screens.t27.state.vazio` — (ver tabela acima)
- `portal.screens.t27.state.sem_elegibilidade` — (ver tabela acima)
- `portal.screens.t27.state.erro_recuperavel` — (ver tabela acima)
- `portal.screens.t27.state.sem_permissao` — (ver tabela acima)
- `portal.screens.t27.state.indisponivel` — (ver tabela acima)
- `portal.screens.t27.field.nivel_faltante` — "Nível de identidade que falta"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por esta tela, não redefinidos aqui.
