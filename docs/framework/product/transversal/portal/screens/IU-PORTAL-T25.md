---
id: IU-PORTAL-T25
title: Carta de Serviços por serviço — especificação de tela
status: draft
apps: [portal]
sources:
  [
    REF-LEI-13460-2017,
    REF-LEI-14129-2021,
    REF-DECRETO-10543-2020,
    REF-DETRANAM-SERVICOS,
  ]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-25. Fontes: [RN-PORTAL-108], [WF-PORTAL-001].

## 1. Identidade

Tela `T-25` "Carta de Serviços por serviço" ([IU-PORTAL-001] §B, transversal). App `portal`.
Rotas `carta-servicos` (lista) e `carta-servicos/:serviceKey` (detalhe) (`route-manifest.md` #2 e
#3). Módulo `catalogo`. `screen: 'T-25'`, `sheet: 'IU-PORTAL-T25'` nas duas rotas.

## 2. Acesso

Anônimo, sem login — `access: anonimo` nas duas rotas (`route-manifest.md` #2/#3;
`portal-frontends.md` §3 "anônimo... `/carta-servicos`"). Sem guarda, sem pré-condição — a Carta
é obrigação de publicidade ativa, disponível a qualquer visitante ([RN-PORTAL-108] "Duas
obrigações de manutenção").

## 3. Entrada

Chega-se pelo rodapé do `CitizenShell` (disponível em toda tela — `portal-frontends.md` §5.1) ou
diretamente pela URL pública. Parâmetro de rota `:serviceKey`, quando presente, seleciona um
serviço do catálogo — "parâmetros nunca substituem consulta autorizada": um `serviceKey`
inexistente no catálogo não é montado como página local, é resolvido contra `GET services`.

## 4. Dados

`GET services` (lista) e `GET services/{serviceKey}` (detalhe) (`portal-route-contract.md` §2) —
Carta de Serviços como estrutura de dados viva, alimentada pelo catálogo de [WF-PORTAL-001], não
um documento estático republicado periodicamente ([RN-PORTAL-108] "Regra"). Onze campos
obrigatórios da Lei 13.460/2017 art.7º §§2º-3º (descrição, requisitos, etapas, **prazo máximo**,
forma de prestação, canal de manifestação, prioridades, tempo de espera, mecanismos de
comunicação, procedimento de resposta, mecanismos de consulta de andamento — [RN-PORTAL-108]
tabela de campos 1-11) mais o décimo segundo campo de boa prática, nível de assinatura exigido
por serviço ([RN-PORTAL-108] "Acrescenta-se..."; [RN-PORTAL-101]). Um serviço só entra no
catálogo com os onze campos preenchidos — trava de produto ([RN-PORTAL-108] "Trava de produto").
Sem fixture como fallback: campo sem base normativa confirmada é declarado como estimativa
qualificada, nunca omitido silenciosamente ([RN-PORTAL-108] "Trava de produto").

## 5. Estados

- **Carregando**: aguardando `GET services`/`GET services/{serviceKey}`.
- **Vazio**: n/a (o catálogo é sempre não vazio; um `serviceKey` inexistente cai em erro não
  recuperável).
- **Indisponível/offline**: catálogo fora do ar — banner de indisponibilidade
  (`portal-error-catalog.md` §8).
- **Erro recuperável**: n/a específico da leitura pública.
- **Erro não recuperável**: `serviceKey` que não resolve no catálogo — `PORTAL.NOT_FOUND`
  (`portal-error-catalog.md` §2), nunca 404 genérico sem explicação.
- **Sucesso**: lista/detalhe com os onze (ou doze) campos, `availability` do serviço
  (`available`/`partially_available`/`unavailable` com motivo — `portal-route-contract.md` §2).

## 6. Comandos

Sem comando de escrita — leitura pública. "Ir para o serviço" (`portal.screens.t25.cmd.ir`),
disponível quando `availability !== 'unavailable'`, navega à rota funcional correspondente
(módulo do serviço, `portal-frontends.md` §4). "Um clique não muda estado jurídico só pela UI":
não se aplica — não há ato jurídico nesta tela.

## 7. Saída

Do detalhe, retorna à lista (`carta-servicos`) ou, via "Ir para o serviço", à rota funcional do
serviço escolhido. Sem dado em edição — sem confirmação de abandono.

## 8. Segurança

Sem `portal.entitlement` (leitura pública, sem PII). Nenhum token/segredo em tela, URL ou log.
Nível de assinatura exibido é sempre o **nível do ato** ([RN-PORTAL-101]), nunca a cor do selo da
conta gov.br ([RN-PORTAL-102] Verificação b: "a Carta de Serviços publica... o nível de
assinatura exigido, nunca o nível de conta").

## 9. Acessibilidade

Superfície de produto, não página morta — navegável por teclado, com busca/filtro acessível;
contraste AA; linguagem cidadã em cada campo (nunca jargão jurídico cru); WCAG 2.1 AA + eMAG,
sem exceção por ser tela pública ([IU-PORTAL-001] §D.2).

## 10. Testes

Unitário: todo serviço listado carrega os onze campos obrigatórios (nenhum "não se aplica" no
campo de prazo máximo — [RN-PORTAL-108] "Trava de produto"). Roteamento: rota `anonimo` acessível
sem sessão. Jornada feliz: consulta de serviço disponível, navegação ao módulo funcional. Jornada
de erro: catálogo indisponível. Jornada de negação: `serviceKey` inexistente → `PORTAL.NOT_FOUND`.

## Estados obrigatórios

| Estado            | Chave i18n                                   | Texto cidadão                                            | Ação seguinte         |
| ----------------- | -------------------------------------------- | -------------------------------------------------------- | --------------------- |
| Carregando        | `portal.screens.t25.state.carregando`        | "Buscando as informações do serviço."                    | aguardar              |
| Vazio             | `portal.screens.t25.state.vazio`             | "Não aplicável — o catálogo sempre lista os serviços."   | —                     |
| Sem elegibilidade | `portal.screens.t25.state.sem_elegibilidade` | "Não aplicável — a Carta de Serviços é pública."         | —                     |
| Erro recuperável  | `portal.screens.t25.state.erro_recuperavel`  | "Não foi possível carregar parte das informações agora." | recarregar            |
| Sem permissão     | `portal.screens.t25.state.sem_permissao`     | "Não encontramos este serviço no catálogo."              | ver todos os serviços |
| Indisponível      | `portal.screens.t25.state.indisponivel`      | "Estamos sem acesso ao catálogo de serviços agora."      | tentar depois         |

## Chaves i18n

- `portal.screens.t25.title` — "Carta de Serviços"
- `portal.screens.t25.intro` — "Veja prazo, documentos e nível exigido para cada serviço do DETRAN-AM."
- `portal.screens.t25.cmd.ir` — "Ir para este serviço"
- `portal.screens.t25.state.carregando` — (ver tabela acima)
- `portal.screens.t25.state.vazio` — (ver tabela acima)
- `portal.screens.t25.state.sem_elegibilidade` — (ver tabela acima)
- `portal.screens.t25.state.erro_recuperavel` — (ver tabela acima)
- `portal.screens.t25.state.sem_permissao` — (ver tabela acima)
- `portal.screens.t25.state.indisponivel` — (ver tabela acima)
- `portal.screens.t25.field.prazo_maximo` — "Prazo máximo do serviço"
- `portal.screens.t25.field.nivel_assinatura` — "Nível de identidade exigido"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por esta tela, não redefinidos aqui.
