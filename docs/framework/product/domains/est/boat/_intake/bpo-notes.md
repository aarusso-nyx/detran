# bpo-notes.md — rodada BPO BOAT (2026-08-24, confirm-extend sobre pesquisa RENAEST/808-2020)

Notas de decisão, forward-references e itens fora da fronteira de escrita desta sessão
(write-only em `est/boat/**`). Companheira de `_intake/research-dossier.md` (achados legais) e
`_intake/proposals.md` (backlog da rodada de mineração anterior, ainda válido salvo indicação).

## Inventário desta rodada

**Revisado**: [WF-BOAT-001] (revisão em linha, nota de revisão + prazos + decisões pendentes
atualizadas), [APP.md] (âncoras legais, missão, atores, escopo, modelo de dados, + 4 seções novas
de ops enrichment).

**Novo**: [WF-BOAT-002] (intake de parceiro facultativo), [WF-BOAT-003] (validação em 3 níveis +
gap de correção pós-terminal), [UC-BOAT-006] a [UC-BOAT-011] (6 UCs), `_intake/bpo-notes.md`
(este arquivo).

## RN-BOAT-1xx — reconciliação com a rodada LEGAL paralela (estado final observado nesta sessão)

A rodada LEGAL correu em paralelo a esta (mandato do briefing: "Legal writes RN-BOAT-1xx in
parallel — forward-reference sanctioned") e, ao final desta sessão BPO, havia publicado
**RN-BOAT-101 a RN-BOAT-115**. A numeração cresceu **enquanto esta rodada BPO estava em curso** —
duas rodadas de reconciliação foram necessárias (a numeração inicial 101-105 usada por esta rodada
colidiu com conteúdo real publicado sob os mesmos números; a correção para 107-110 colidiu de novo
quando a LEGAL avançou até 115). Estado final, já refletido nos artefatos BOAT:

| id (real)   | Título                                                                                          | Onde é citada em BOAT                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| RN-BOAT-101 | Coleta de dado de sinistro pelo DETRAN-AM é competência própria (CTB art. 22, IX)               | [APP.md] §Âncoras legais (consistente, não citada por id)                                       |
| RN-BOAT-102 | RENAEST — existência, cadeia normativa em 3 níveis, dever estadual de alimentar                 | [WF-BOAT-003]                                                                                   |
| RN-BOAT-103 | BAT — documento-fonte normativo, 4 categorias, dever de atestar consistência                    | [WF-BOAT-003]                                                                                   |
| RN-BOAT-104 | Validação em 3 níveis — DETRAN-AM valida estadual + municípios não integrados ao SNT            | [WF-BOAT-003], [UC-BOAT-009]                                                                    |
| RN-BOAT-105 | Coordenador de RENAEST — designação obrigatória, responsabilidade nominal                       | [WF-BOAT-003], [UC-BOAT-008], [UC-BOAT-009], [UC-BOAT-011]                                      |
| RN-BOAT-106 | Ausência de prazo legal de transmissão — periodicidade mensal como parâmetro prudencial         | [WF-BOAT-001] §Prazos (substituiu a proposta original de 5 dias úteis desta rodada)             |
| RN-BOAT-112 | Parceiros integram o RENAEST de forma facultativa e por mediação do DETRAN estadual             | [WF-BOAT-002], [UC-BOAT-008]                                                                    |
| RN-BOAT-114 | Cena do sinistro, regime 1 — deveres do art. 176 (sinistro com vítima)                          | [WF-BOAT-001], [UC-BOAT-006], [UC-BOAT-007]                                                     |
| RN-BOAT-115 | Cena do sinistro, regime 2 — recusa de socorro mediante solicitação da autoridade (art. 177)    | [WF-BOAT-001], [UC-BOAT-007]                                                                    |
| RN-BOAT-116 | Cena do sinistro, regime 3 — art. 178 (sinistro sem vítima), dever único de remoção por fluidez | [WF-BOAT-001], [UC-BOAT-007]                                                                    |
| RN-BOAT-117 | O booleano `evaded` não comporta os três regimes — captura deve ser por dever descumprido       | [WF-BOAT-001], [UC-BOAT-007] — formaliza o refinamento de produto mais consequente desta rodada |
| RN-BOAT-118 | Preservar o local para a perícia × liberar a via — sem critério normativo de precedência        | [UC-BOAT-006], [UC-BOAT-007]                                                                    |
| RN-BOAT-119 | Tacógrafo — em sinistro com vítima, só perito oficial retira o disco/unidade (art. 279)         | [UC-BOAT-006]                                                                                   |
| RN-BOAT-120 | Remoção de veículo sinistrado sem responsável no local (art. 279-A)                             | [UC-BOAT-006]                                                                                   |

Todos os tópicos desta rodada BPO que dependiam de forward-reference — os três regimes de cena
(176/177/178), a insuficiência do booleano `evaded`, a tensão preservação×remoção, o tacógrafo e a
remoção sem responsável — acabaram **completamente formalizados** pela rodada LEGAL paralela
(RN-BOAT-114 a 120) ainda durante esta sessão. A LGPD para dado de saúde de vítima também foi
coberta, por **[RN-BOAT-122]** — "dado de vítima é dado pessoal sensível, LGPD incide
integralmente, exclusão de segurança pública não alcança o BOAT" —, já citada em [APP.md]
§Capacidade item 4. A própria RN-BOAT-122 encadeia mais regras ainda não lidas nesta sessão
(RN-BOAT-123 hipótese legal de tratamento; 124 minimização; 125 término/eliminação; 126 direitos
do titular) — a rodada LEGAL seguia publicando ao final desta sessão BPO. **Nenhum tópico do
handoff original desta rodada permanece sem RN correspondente.** Recomenda-se, na próxima sessão
que tocar BOAT, checar `est/boat/rules/` por ids acima de 122 e citá-los onde pertinente
(especialmente 123-126, que devem afetar diretamente [RN-BOAT-003], [UC-BOAT-003] e [UC-BOAT-008]).

## Shared/ops seams flagados (fora da fronteira de escrita `est/boat/**`)

1. **`shared/glossary.md`** — entrada "RENAEST" (linha 50) hoje diz "base normativa pendente";
   deveria ser atualizada para citar [REF-CONTRAN-808-2020] e [REF-CTB-sinistro-cena-renaest]
   (gap fechado nesta rodada). Não editado por regra de fronteira — mesma situação já registrada
   em `_intake/proposals.md` da rodada de mineração anterior, agora com a fonte pronta para uso.
2. **`shared/actors.md`** — entrada "Parceiro conveniado (sinistros)" (linha 34) diz "visão de
   produto NÃO confirmada". Deveria ser atualizada para "confirmada em nível legal
   ([REF-CONTRAN-808-2020] art. 6º), facultativa, sem RBAC de sistema definido pela norma" — ver
   [APP.md] §Atores e §Nível de parceiro para o texto já escrito no lado BOAT.
3. **TEAT — doutrina de evidência/offline reutilizada por referência, não remodelada**: todo
   ponto de contato desta rodada com TEAT ([WF-TEAT-001] doutrina offline/evidência, [WF-TEAT-004]
   remoção, [UC-TEAT-010] bodycam) foi tratado como **reuso por referência** — nenhum artefato
   TEAT foi editado, nenhuma doutrina foi reimplementada localmente em BOAT. Isso preserva a regra
   de fronteira "domínios evoluem independentemente" do `CONVENTIONS.md`, mas cria um seam
   operacional real: qualquer revisão futura da doutrina de evidência/offline em TEAT precisa
   propagar (manualmente, por ora) para os pontos que BOAT referencia — não há mecanismo
   automático de sincronização entre os dois corpora.
4. **`_meta/backlog.md`** — os itens de pesquisa já fechados por esta rodada
   (`_intake/research-dossier.md` §Mapa CONFIRMA/CONTRADIZ/ESTENDE) deveriam ser marcados como
   resolvidos no backlog compartilhado; não editado por regra de fronteira.

## Decisões de escopo tomadas nesta rodada (não normativas — registradas para rastreabilidade)

1. **`evaded` → captura estruturada 176-178**: tratado como refinamento de schema/UI dentro do
   escopo desta rodada (novo UC-BOAT-007, referências em WF-BOAT-001 e APP.md), não como mudança
   de estado de workflow — nenhum estado do ciclo de vida local foi alterado.
2. **WF-BOAT-002/003 modelados como sub-workflows dedicados**, não como estados adicionais dentro
   de WF-BOAT-001 — decisão de organização documental (evita poluir o diagrama principal já
   estabelecido), consistente com o padrão de sub-máquinas já usado em [WF-TEAT-004] (retenção vs.
   remoção como sub-máquinas separadas) e [WF-RAIT-003] (referenciado por [WF-RAIT-001]).
3. **Correção de registro nacional CONSOLIDADO/REJEITADO**: confirmado como lacuna normativa real
   (não de pesquisa). Proposta operacional de "novo registro retificador" documentada em
   [WF-BOAT-003], explicitamente rotulada `PROPOSTA-PENDENTE-DE-NORMA` — não deve ser lida como
   recomendação normativa, apenas como opção de produto até posicionamento do CONTRAN/SENATRAN ou
   decisão definitiva do Owner.
4. **SLA de transmissão `T-BOAT-TRANSM`**: a primeira versão desta rodada propunha um valor
   arbitrário (5 dias úteis) na ausência de norma. A rodada LEGAL, em paralelo, produziu
   **[RN-BOAT-106]** com posição mais bem fundamentada — periodicidade **mensal**, apoiada no
   art. 19 §3º do CTB e no art. 8º, V da Res. 808/2020 — e [WF-BOAT-001] §Prazos foi **atualizado
   para adotar essa posição**, descartando o valor arbitrário original. Não usar o valor do
   BATEU-PR (180 dias) — contexto de outro Estado, sem vítima, patrimonial; BOAT trata sinistro
   com possível vítima, presumivelmente mais urgente.
5. **RBAC de "parceiro facultativo" não criado**: mantém-se, nesta rodada, sem perfil de sistema
   dedicado — consistente com a leitura de que a Res. 808/2020 é norma de governança
   interinstitucional, não de modelagem de sistema. Toda submissão de parceiro é modelada como
   passando por um operador humano do DETRAN-AM ([WF-BOAT-002]), não por acesso direto do parceiro
   ao BOAT — decisão revisável pelo Owner caso a onda de parceiro seja priorizada.

## Impacto de produto — captura estruturada 176-178 (detalhamento de campo, ver UC-BOAT-007)

Proposta de campos por `CrashVehicle`/condutor (não normado, sugestão de modelagem):

- `scene_conduct_regime`: enum derivado automaticamente da presença de vítima no sinistro
  (`com_vitima` → art. 176 aplicável; `sem_vitima` → art. 178 aplicável).
- Para `com_vitima`: 5 booleanos/observações correspondentes aos incisos I-V do art. 176 (socorro;
  prevenção de novo risco; preservação do local; remoção quando determinada; identificação ao
  policial) + 1 booleano separado para recusa mediante solicitação da autoridade (art. 177,
  hipótese autônoma, não incluída nos incisos do art. 176).
- Para `sem_vitima`: 1 booleano (remoção adotada quando necessária à fluidez, art. 178).

Este detalhamento é sugestão de campo, não RN — a RN-BOAT-101 (forward-reference) deve formalizar
a regra normativa; o desenho de schema é decisão de engenharia/produto a partir dela.

## Referência cruzada — onde cada mandato específico do briefing foi endereçado

1. Substituição de `evaded`: [UC-BOAT-007], [APP.md] §Modelo de dados, [WF-BOAT-001] §Revisão.
2. Corte de escopo de campo (301/304-305; SAMU/VIVA): [APP.md] §Escopo (Fora).
3. Reuso da doutrina TEAT por referência: [WF-BOAT-002] §Reuso por referência, [UC-BOAT-006]
   (remoção), [UC-BOAT-010] (bodycam) — nenhum re-modelado.
