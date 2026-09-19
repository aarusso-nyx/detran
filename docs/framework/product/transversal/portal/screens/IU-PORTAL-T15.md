---
id: IU-PORTAL-T15
title: Como funciona a pontuação — especificação de tela
status: draft
apps: [portal]
sources:
  [
    REF-LEI-14129-2021,
    REF-LEI-13460-2017,
    REF-DECRETO-10543-2020,
    REF-CTB-extracts-raw,
  ]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-15. Fontes: [JRN-PORTAL-004].

## 1. Identidade

`T-15`, "Como funciona a pontuação", app `portal`, rota `pontuacao/como-funciona`
(`route-manifest.md` #4), módulo `catalogo`, `screen: 'T-15'`, `sheet: 'IU-PORTAL-T15'`.

## 2. Acesso

Ator anônimo — conteúdo público ([IU-PORTAL-001] §A/T-15 nota; `route-manifest.md` `access:
anonimo`); sem guarda.

## 3. Entrada

Acessível sem login a partir da tela inicial pública ou de um link em `/autos` (T-14)
([JRN-PORTAL-004] narrativa 4, "Josué pode abrir 'como isso funciona'"). Sem parâmetro de rota.

## 4. Dados

`GET content/points-explainer` (`portal-route-contract.md` §2, público): conteúdo versionado. Não
há dado pessoal nesta tela — é explicativo, não consulta.

## 5. Estados

- **carregando**: esqueleto do texto.
- **vazio**: não se aplica — conteúdo estático versionado.
- **sem elegibilidade / sem permissão**: não se aplica — acesso anônimo.
- **erro recuperável**: falha ao carregar o conteúdo — tentar novamente.
- **indisponível**: conteúdo indisponível — mensagem genérica, sem bloquear a navegação do
  restante do app.
- **sucesso**: distingue pontos já definitivos de pontos em disputa em linguagem simples
  ([JRN-PORTAL-004] narrativa 4; [RN-RAIT-131]).

## 6. Comandos

Nenhum comando — tela puramente informativa.

## 7. Saída

Volta para `/autos` (T-14) ou para a página de onde veio (histórico do navegador). Nada a salvar.

## 8. Segurança

Sem dado pessoal exibido. Sem token/segredo.

## 9. Acessibilidade

Linguagem cidadã, sem jargão processual não explicado (`_intake/ux-notes.md` §c "Tom"); estrutura
de headings navegável por leitor de tela; contraste AA.

## 10. Testes

Unitário: conteúdo distingue "definitivo" de "em disputa" sem confundir os dois. Roteamento: rota
acessível sem sessão (`access: anonimo`), presente mesmo para usuário anônimo.

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)                           | Ação seguinte     |
| ----------------- | ---------------------------------------------------- | ----------------- |
| carregando        | `portal.states.loading`                              | —                 |
| vazio             | n/a — conteúdo estático                              | —                 |
| sem elegibilidade | n/a — acesso anônimo                                 | —                 |
| erro recuperável  | `portal.states.error` + `portal.common.action.retry` | tentar novamente  |
| sem permissão     | n/a — acesso anônimo                                 | —                 |
| indisponível      | `portal.states.service_unavailable`                  | voltar mais tarde |

## Chaves i18n

- `portal.screens.t15.title` — "Como funciona a pontuação"
- `portal.screens.t15.intro` — "Pontos só entram na sua carteira depois de esgotados os
  recursos — o que ainda está em disputa não conta como definitivo." ([JRN-PORTAL-004] narrativa
  4, [RN-RAIT-131])
