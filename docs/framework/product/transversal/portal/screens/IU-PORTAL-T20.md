---
id: IU-PORTAL-T20
title: Meu resultado de exame de aptidão — especificação de tela
status: draft
apps: [portal]
sources:
  [
    REF-CONTRAN-927-2022,
    REF-CTB-147-148-habilitacao,
    REF-DETRANAM-PORTARIA-005-2021,
    REF-LEI-14063-2020,
  ]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-20. Fontes: [UC-PORTAL-014], [JRN-PORTAL-008], [RN-PORTAL-118].

## 1. Identidade

Tela `T-20` "Meu resultado de exame de aptidão" ([IU-PORTAL-001] §B). App `portal`. Rota
`exames` (`route-manifest.md` #29). Módulo `exames`. `screen: 'T-20'`, `sheet: 'IU-PORTAL-T20'`.

## 2. Acesso

Ator Cidadão, nível simples ([UC-PORTAL-014] pré-condições; [WF-PORTAL-002]). `access: simples`
(`route-manifest.md` #29): `portalAuthGuard` + `assuranceGuard('simples')`. Sem
`entitlementGuard` de rota — o vínculo é o próprio CPF do candidato/condutor ([UC-PORTAL-014]
ator). Pré-condição: encontro clínico no PEC em `SIGNED` ou `CLOSED` — resultado nunca exibido
antes de assinado, mesmo que o exame já tenha ocorrido presencialmente ([UC-PORTAL-014]
pré-condições, [WF-PEC-001]). Sem resultado disponível, a tela explica o motivo (em
processamento ou exame ainda não realizado), nunca uma tela vazia sem explicação
([UC-PORTAL-014] fluxo 3; [WF-PORTAL-001] invariante 8).

## 3. Entrada

Chega-se pelo módulo de habilitação/CNH do PORTAL ("Meus exames" — [UC-PORTAL-014] fluxo 1).
Sem parâmetro de rota (lista por CPF autenticado). "Parâmetros nunca substituem consulta
autorizada": a listagem vem sempre da sessão do cidadão, nunca de um identificador informado
pelo cliente.

## 4. Dados

`GET exams`, `GET exams/{id}` (`portal-route-contract.md` §7) — projeção do PEC (`SIGNED`/
`CLOSED`, ADR-0020). Campos: rótulo legal do resultado (apto / apto com restrições / inapto
temporário / inapto — [RN-PEC-105]/[RN-PEC-106], nunca o rótulo interno `CONDICIONADO` exposto
cru — [UC-PORTAL-014] fluxo 2, [JRN-PORTAL-008] passo 1); validade calculada por faixa etária
(10/5/3 anos, CTB art.147 §2º — [RN-PEC-102]); para resultado psicológico, prazo de
disponibilização de até 2 dias úteis (Res. 927/2022 art.9º §3º — [UC-PORTAL-014] fluxo 3); se
inaptidão, prazo de 30 dias para requerer junta já contando ([UC-PORTAL-014] fluxo 4;
[RN-PEC-112]). Nenhuma tabela do PEC lida diretamente pelo navegador — só a projeção via
`/v1/portal/*` (`portal-frontends.md` §1). Sem fixture como fallback: se o Anexo XV da
Res.927/2022 não estiver disponível na base de conhecimento do produto para explicar um código
de restrição específico, a tela mostra o texto genérico e direciona ao canal humano, sem
arriscar explicação incorreta ([JRN-PORTAL-008] passo 2).

## 5. Estados

- **Carregando**: aguardando a projeção do PEC.
- **Vazio**: nenhum exame realizado/registrado para este CPF.
- **Indisponível/offline**: leitura do PEC fora do ar — banner de indisponibilidade
  (`portal-error-catalog.md` §8).
- **Erro recuperável**: resultado psicológico concluído há menos de 2 dias úteis — "em
  processamento", com o prazo, nunca uma tela vazia ([UC-PORTAL-014] AC-3).
- **Erro não recuperável**: n/a nesta tela — todo caso de indisponibilidade de vínculo aqui é
  "vazio" (o ato é de leitura do próprio CPF, sem checagem de vínculo de terceiro).
- **Sucesso**: rótulo legal do resultado + explicação ao lado + validade calculada; se inaptidão,
  ação única "requerer junta" com prazo já contando ([UC-PORTAL-014] fluxos 2 e 4).

## 6. Comandos

- "Solicitar entrevista devolutiva" (`portal.screens.t20.cmd.entrevista`), nível simples,
  disponível sempre que o resultado não é "apto" simples, botão de primeira classe, não link de
  rodapé ([JRN-PORTAL-008] passo 4).
- "Requerer junta médica/psicológica" (`portal.screens.t20.cmd.requerer_junta`), nível avançado
  (delegação PEC, `portal-frontends.md` §4/§7 "Junta médica"), pré-condição: inaptidão e prazo de
  30 dias do conhecimento não expirado ([UC-PORTAL-014] AC-4; fluxo alternativo 4a — prazo
  expirado remove a ação e explica o motivo), efeito `ch:...:request-board` (`portal-frontends.md`
  §4), destino `/exames/:examId/junta/nova`, auditado como qualquer comando de ato pessoal.
  "Um clique não muda estado jurídico só pela UI": o requerimento entra na fila da junta, o
  resultado do exame em si não é alterado por este comando.

## 7. Saída

Retorna a `/inicio` ou permanece em `/exames` (lista). Nenhum dado é editado nesta tela; sem
confirmação de abandono, salvo quando o cidadão inicia "requerer junta" (rascunho tratado pela
tela de destino, T-nn de junta, fora deste lote — módulo `exames`).

## 8. Segurança

Sem checagem de `portal.entitlement` de terceiro nesta tela — o acesso é sempre ao próprio dossiê
do CPF autenticado ([UC-PORTAL-014] AC-5: "acesso é integral e sem máscara" — [RN-PORTAL-118],
[RN-PEC-153]). Minimização: nenhum resultado em painel público, notificação com prévia visível na
tela de bloqueio de um aparelho possivelmente compartilhado — conteúdo sensível só dentro do app
autenticado ([JRN-PORTAL-008] passo 3; `_intake/ux-notes.md` §g.3/§h.3). Nenhum token/segredo em
tela, URL ou log. Vocabulário de bastidor (`CONDICIONADO`, "PENDENTE" não confirmado) só em
`data-token`, nunca exposto cru ([JRN-PORTAL-008] métricas de sucesso).

## 9. Acessibilidade

Explicação do rótulo legal aparece junto ao resultado, não como link para outra página
([JRN-PORTAL-008] passo 2); `aria-live` na troca de estado ("em processamento" → resultado
disponível); contraste AA; linguagem clínica sem alarme, mesmo em resultado desfavorável
(`_intake/ux-notes.md` §c "Tom"); WCAG 2.1 AA + eMAG ([IU-PORTAL-001] §D).

## 10. Testes

Unitário: rótulo exibido é sempre um dos quatro legais, nunca `CONDICIONADO`/`PENDENTE` crus
([UC-PORTAL-014] AC-1). Roteamento: `assuranceGuard('simples')` presente/ausente; ação "requerer
junta" só visível com inaptidão e prazo não expirado. Jornada feliz: candidato lê "apto" com
validade calculada. Jornada de erro: resultado psicológico "em processamento" com prazo. Jornada
de negação: prazo de junta expirado — ação não aparece, motivo explicado.

## Estados obrigatórios

| Estado            | Chave i18n                                   | Texto cidadão                                                | Ação seguinte                        |
| ----------------- | -------------------------------------------- | ------------------------------------------------------------ | ------------------------------------ |
| Carregando        | `portal.screens.t20.state.carregando`        | "Buscando o resultado do seu exame."                         | aguardar                             |
| Vazio             | `portal.screens.t20.state.vazio`             | "Você ainda não tem exame registrado."                       | ver como agendar (Carta de Serviços) |
| Sem elegibilidade | `portal.screens.t20.state.sem_elegibilidade` | "Esta consulta não está disponível para o seu perfil agora." | canal alternativo ([RN-PORTAL-105])  |
| Erro recuperável  | `portal.screens.t20.state.erro_recuperavel`  | "Seu resultado psicológico ainda está em processamento."     | voltar em até 2 dias úteis           |
| Sem permissão     | `portal.screens.t20.state.sem_permissao`     | "Não encontramos exame vinculado ao seu CPF."                | ouvidoria                            |
| Indisponível      | `portal.screens.t20.state.indisponivel`      | "Estamos sem acesso ao sistema de exames agora."             | tentar depois; canal presencial      |

## Chaves i18n

- `portal.screens.t20.title` — "Meu resultado de exame de aptidão"
- `portal.screens.t20.intro` — "Veja o resultado do seu exame médico e psicológico."
- `portal.screens.t20.empty` — "Você ainda não tem exame registrado."
- `portal.screens.t20.cmd.entrevista` — "Falar com quem avaliou meu exame"
- `portal.screens.t20.cmd.requerer_junta` — "Requerer junta médica/psicológica"
- `portal.screens.t20.state.carregando` — (ver tabela acima)
- `portal.screens.t20.state.vazio` — (ver tabela acima)
- `portal.screens.t20.state.sem_elegibilidade` — (ver tabela acima)
- `portal.screens.t20.state.erro_recuperavel` — (ver tabela acima)
- `portal.screens.t20.state.sem_permissao` — (ver tabela acima)
- `portal.screens.t20.state.indisponivel` — (ver tabela acima)
- `portal.screens.t20.field.validade` — "Validade do exame"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por esta tela, não redefinidos aqui.
