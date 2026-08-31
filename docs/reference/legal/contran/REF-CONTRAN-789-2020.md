---
id: REF-CONTRAN-789-2020
title: Resolução CONTRAN nº 789, de 18/06/2020 — consolida normas sobre o processo de formação de condutores
orgao: CONTRAN (DOU 24/06/2020, ed. 119, seção 1, p. 83)
status: 'vigente com ressalvas — texto capturado é a publicação ORIGINAL de 2020 (metadados do PDF confirmam criação em 24/06/2020), NÃO uma versão consolidada com as alterações da Res. 1.009/2024 (o novo art. 6º-A não aparece no texto). ⚠ ALÉM DISSO: o art. 4º, caput (validade do exame de aptidão física e mental) reproduz o art. 147 §2º do CTB ANTERIOR à Lei 14.071/2020 e está SUPERADO — prevalece o CTB, ver REF-CTB-147-148-habilitacao e RN-PEC-102. Achado da rodada LEGAL 2026-08-24.'
url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7892020.pdf'
pdf: REF-CONTRAN-789-2020.pdf (+ REF-CONTRAN-789-2020.txt — texto integral via pdftotext; 8 páginas úteis, arquivo com 4540 linhas por causa da diagramação em duas colunas + anexos extensos sobre credenciamento de CFC)
apps: [pec]
sources: []
updated: 2026-08-25
---

# O que este arquivo é

Resolve o item nº 2 do backlog de pesquisa legal de `ch/pec/_intake/proposals.md` — "base do
orquestrador de etapas do PEC". Só os arts. 1º-6º (Capítulo I, "Do Processo de Habilitação do
Condutor") interessam diretamente ao PEC; o restante da resolução (Capítulos II em diante) regula
a formação teórico-prática do condutor (CFC, cursos, provas de direção) — fora do escopo do PEC
por definição ([APP-PEC] §Escopo/Fora: "prova teórica e prática de direção [...] fora").

**Vigência — ressalva importante.** O PDF baixado é a publicação original do DOU de 2020; os
metadados de criação confirmam isso (`CreationDate: 2020-06-24`). A Res. 1.009/2024 alterou esta
resolução (acrescentou o art. 6º-A, sobre cancelamento voluntário da CNH) — esse artigo **não**
aparece no texto abaixo. `ch/pec/_intake/proposals.md` chamava esta norma de "Res. 789/2020
(consolidada 2024)"; essa caracterização está **imprecisa**: não foi localizada uma versão
oficial "texto compilado" da 789/2020 no portal gov.br/transportes — apenas a publicação
original e a resolução alteradora avulsa. Tratar o texto abaixo como vigente **exceto** onde a
Res. 1.009/2024 dispõe em contrário (ver [REF-CONTRAN-923-1009-toxicologico]).

## Excertos úteis

### Art. 2º — ordem legal das etapas do processo de habilitação

> Art. 2º O candidato à obtenção da Autorização para Conduzir Ciclomotor (ACC) e da Carteira
> Nacional de Habilitação (CNH) solicitará [...] a abertura do processo de habilitação [...].
>
> § 1º Para o processo de habilitação de que trata o caput, após o devido cadastramento dos
> dados informativos no [RENACH], o candidato deverá realizar **Avaliação Psicológica, Exame de
> Aptidão Física e Mental, Curso Teórico-técnico, Exame Teórico-técnico, Curso de Prática de
> Direção Veicular e Exame de Prática de Direção Veicular, nesta ordem**.
>
> § 2º O candidato poderá requerer simultaneamente a ACC e a habilitação na categoria B [...],
> submetendo-se a um único Exame de Aptidão Física e Mental e Avaliação Psicológica, desde que
> considerado apto para ambas.
>
> § 3º O processo do candidato à habilitação ficará ativo no órgão [...] pelo **prazo de doze
> meses**, contados da data do requerimento do candidato.

**Anotação (extend/possível contradict de suposição implícita do PEC).** A ordem legal
explícita é **Avaliação Psicológica ANTES de Exame de Aptidão Física e Mental** — nenhum artefato
PEC ([APP-PEC], [WF-PEC-001]) afirma uma ordem entre os dois exames clínicos que compõem o
encounter; o modelo de dados trata os dois como paralelos dentro do mesmo `encounter`
(`exams_medical`/`exams_psych`, ambos opcionais até o fechamento). Se a ordem legal for
vinculante para a UX/orquestração (não apenas para o requerimento administrativo inicial), é uma
informação de produto a validar com LEGAL/BPO — o PEC pode estar certo em tratar os exames como
paralelos (a Resolução não impõe _bloqueio_ de um sobre o outro, apenas lista a sequência de
"processo"), mas o silêncio do PEC sobre essa ordem é notável. O §3º (processo ativo por 12 meses)
também não aparece em nenhum WF-PEC — candidato a um timer de expiração do `renach_process_key`
não modelado. Aplica-se a: [WF-PEC-001], [APP-PEC] (modelo do encontro).

### Art. 4º — validade do exame de aptidão física e mental ⚠ **TEXTO SUPERADO PELA LEI 14.071/2020**

> Art. 4º O Exame de Aptidão Física e Mental será preliminar e **renovável a cada cinco anos**, ou
> **a cada três anos para condutores com mais de sessenta e cinco anos de idade**, no local de
> residência ou domicílio do examinado.
>
> § 1º O condutor que exerce atividade de transporte remunerado de pessoas ou bens terá que se
> submeter à avaliação psicológica complementar, de acordo com o disposto no § 3º do art. 147 do
> CTB.
>
> § 2º Quando houver indícios de deficiência física, mental ou de progressividade de doença que
> possa diminuir a capacidade para conduzir veículo, o prazo de validade do exame poderá ser
> diminuído a critério do perito examinador.

**⚠ Anotação CORRIGIDA na rodada LEGAL (2026-08-24) — NÃO IMPLEMENTAR O PRAZO DESTE ARTIGO.**
A redação original desta anotação tratava o art. 4º como norma vigente e recomendava propagar
"5 anos / 3 para maiores de 65" à tabela de prazos de [WF-PEC-001]. **A recomendação foi rejeitada
pelo especialista LEGAL**: o texto acima reproduz o art. 147, § 2º do CTB **anterior** à Lei
14.071/2020. Esta Resolução é de **24/06/2020**; a Lei 14.071/2020 é de **13/10/2020** e entrou em
vigor em **12/04/2021**, e a resolução **não foi atualizada**. O prazo vigente é o da lei:

| Idade            | Periodicidade (CTB art. 147, § 2º, redação da Lei 14.071/2020) |
| ---------------- | -------------------------------------------------------------- |
| < 50 anos        | **10 anos**                                                    |
| ≥ 50 e < 70 anos | **5 anos**                                                     |
| ≥ 70 anos        | **3 anos**                                                     |

Ver [REF-CTB-147-148-habilitacao] §"Art. 147, § 2º" e a regra [RN-PEC-102], que fixa o prazo
correto e registra o conflito. Implementar o prazo deste artigo produziria **renovação
indevidamente antecipada** da maioria dos condutores.

O **§ 2º** (redução do prazo a critério do perito) **permanece válido** — é compatível com o § 4º do
art. 147 do CTB, que diz o mesmo. O **§ 1º** (avaliação psicológica complementar para transporte
remunerado) também permanece, e reproduz o § 3º do art. 147 do CTB — ver [RN-PEC-103]. Aplica-se a:
[RN-PEC-102] (prazo, **corrigido**), [RN-PEC-103] (§§ 1º-2º).

### Art. 5º — hipóteses de exigência

> Art. 5º O Exame de Aptidão Física e Mental será exigido para: I - obtenção da ACC e da CNH; II -
> renovação [...]; III - adição e mudança de categoria; e IV - substituição do documento de
> habilitação obtido em país estrangeiro.
>
> § 2º A Avaliação Psicológica será exigida nos seguintes casos: I - obtenção da ACC e da CNH; II
>
> - renovação [...], se o condutor exercer atividade de transporte remunerado [...]; III -
>   substituição do documento de habilitação obtido em país estrangeiro; e **IV - por solicitação
>   do perito examinador**.

**Anotação.** O inciso IV do §2º (avaliação psicológica pode ser exigida "por solicitação do
perito examinador", isto é, do médico) é uma hipótese de acionamento cruzado entre as duas
trilhas clínicas que o RBAC/workflow do PEC não contempla — hoje o encounter cobre até um exame de
cada tipo por episódio, sem gatilho de "médico solicita psicológico" fora do fluxo padrão.

## Índice reverso

| Artigo                                                          | RN/WF                                                                             |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| art. 2º §1º (ordem das etapas)                                  | [WF-PEC-001], [RN-PEC-108]                                                        |
| art. 2º §3º (processo ativo por 12 meses)                       | [RN-PEC-108], [WF-PEC-001] (timer não modelado)                                   |
| art. 4º _caput_ (validade 5/3 anos)                             | ⚠ **SUPERADO** — usar [REF-CTB-147-148-habilitacao] art. 147, § 2º e [RN-PEC-102] |
| art. 4º §§1º-2º (psicológico complementar; redução pelo perito) | [RN-PEC-103], [RN-PEC-102]                                                        |
| art. 5º (hipóteses de exigência do exame médico)                | [RN-PEC-101]                                                                      |
| art. 5º §2º (hipóteses da avaliação psicológica)                | [RN-PEC-103]                                                                      |
| art. 5º §2º, IV (psicológico por solicitação do médico)         | [RN-PEC-103] (transição ausente de [WF-PEC-001])                                  |
