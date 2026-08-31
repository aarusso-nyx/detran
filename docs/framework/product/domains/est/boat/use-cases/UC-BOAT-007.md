---
id: UC-BOAT-007
title: Agente captura as três condutas de cena estruturadas (arts. 176-178) em substituição a `evaded`
status: approved
apps: [boat, teat]
sources: [REF-CTB-sinistro-cena-renaest]
updated: 2026-08-26
---

## Ator e objetivo

Agente registra, de forma estruturada, qual dos três regimes de dever da cena do sinistro (CTB
arts. 176, 177 e 178) foi observado por cada condutor/veículo envolvido — substituindo o campo
booleano único `evaded` de `CrashVehicle` por dados que distinguem os três regimes jurídicos
distintos. Este UC é o **refinamento de produto mais consequente** desta rodada BPO (ver
`_intake/bpo-notes.md`).

## Pré-condições

Ao menos um `CrashVehicle` registrado ([UC-BOAT-002]); classificação de gravidade do sinistro já
conhecida ou em captura ([UC-BOAT-003]).

## Fluxo principal

1. Sistema determina o regime aplicável a cada veículo/condutor a partir da presença de vítima no
   sinistro:
   - **Sinistro com vítima** (ao menos uma `CrashVictim` registrada) → regime do **art. 176**
     aplica-se ao condutor envolvido.
   - **Sinistro sem vítima** → regime do **art. 178** aplica-se.
2. Para regime **art. 176** (sinistro com vítima — [RN-BOAT-114]), agente registra, para cada
   condutor, se foram observadas as cinco condutas do caput:
   - I — prestou ou providenciou socorro à vítima, podendo fazê-lo;
   - II — adotou providências para evitar novo perigo no local;
   - III — preservou o local para a perícia;
   - IV — adotou providências para remover o veículo quando determinado por policial/agente;
   - V — identificou-se ao policial e prestou informações para o boletim de ocorrência.

   Omissão em qualquer inciso, podendo o condutor tê-lo feito, caracteriza a infração gravíssima
   do art. 176 (multa 5x + suspensão do direito de dirigir).

3. Registra separadamente se houve **recusa de socorro mediante solicitação expressa da
   autoridade** (art. 177 — [RN-BOAT-115]) — hipótese autônoma e distinta da omissão espontânea do
   inciso I do art. 176: aqui há ordem direta da autoridade, não apenas dever geral de socorro; e o
   sujeito ativo é **qualquer condutor solicitado**, não necessariamente envolvido no sinistro.
4. Para regime **art. 178** (sinistro sem vítima — [RN-BOAT-116]), agente registra apenas se o
   condutor adotou providências para remover o veículo, quando necessário à segurança e fluidez do
   trânsito — dever único e mais leve deste regime (sem exigência de socorro, sem exigência de
   preservação para perícia).
5. Sistema não infere mais evasão a partir de um único booleano — cada conduta observada/omitida é
   um dado próprio, vinculado ao regime correto pela presença ou ausência de vítima no sinistro.

## Fluxos alternativos / exceções

- **1a. Sinistro reclassificado** (ex.: vítima identificada após registro inicial sem vítima):
  regime aplicável muda de art. 178 para art. 176 — sistema deve permitir recaptura das condutas
  sob o novo regime, não apenas manter o dado antigo sob rótulo desatualizado.
- **2a/3a. AIT decorrente.** Observação de omissão (art. 176, 177 ou 178) pode fundamentar
  lavratura de AIT associado ao mesmo atendimento — vínculo por `crash_record_id`, mesmo regime de
  associação de [UC-BOAT-004] (sem FK rígida).
- **Fronteira penal.** O mesmo fato de omissão de socorro pode gerar, em paralelo, o crime do art.
  304 do CTB — **fora do escopo de BOAT** ([APP-BOAT] §Escopo/Fora); BOAT registra a conduta
  observada, não instrui nem julga a responsabilidade penal.

## Pós-condições

Cada veículo/condutor envolvido tem conduta de cena registrada sob o regime jurídico correto (176,
177 ou 178), substituindo o antigo campo único `evaded`; base de dados apta a fundamentar AIT
associado quando cabível.

## Critérios de aceitação

**AC-BOAT-007-1 — o regime aplicável é derivado da presença de vítima, não escolhido**

- **Dado** um sinistro com ao menos uma `CrashVictim`
- **Quando** as condutas de cena são capturadas
- **Então** o sistema aplica o regime do art. 176 ([RN-BOAT-114]); sem vítima, aplica o art. 178
  ([RN-BOAT-116]) — o agente nunca escolhe o regime manualmente

**AC-BOAT-007-2 — as cinco condutas do art. 176 são cinco registros**

- **Dado** o regime do art. 176
- **Quando** o agente registra
- **Então** há veredito individual para os incisos I a V, cada um com a marcação de **se o condutor
  podia tê-lo feito** — a infração gravíssima depende dessa condição, e um booleano agregado a
  destrói

**AC-BOAT-007-3 — o art. 177 é infração autônoma, de sujeito distinto**

- **Dado** uma recusa de socorro mediante solicitação expressa da autoridade
- **Quando** é registrada
- **Então** ocupa campo próprio, separado do inciso I do art. 176 ([RN-BOAT-115]), e o sujeito pode
  ser **qualquer condutor solicitado**, não necessariamente envolvido no sinistro

**AC-BOAT-007-4 — no regime do art. 178 só existe o dever de remoção**

- **Dado** um sinistro sem vítima
- **Quando** as condutas são capturadas
- **Então** o sistema pede apenas a providência de remoção por fluidez ([RN-BOAT-116]) — não
  apresenta campos de socorro nem de preservação, que não são deveres desse regime

**AC-BOAT-007-5 — reclassificar o sinistro força recaptura sob o novo regime**

- **Dado** um sinistro registrado sem vítima, depois reclassificado com vítima
- **Quando** a reclassificação ocorre
- **Então** o sistema exige recaptura das condutas sob o art. 176 e **não** reaproveita silenciosamente
  o dado colhido sob o art. 178 com rótulo novo

**AC-BOAT-007-6 — o BOAT registra o fato, não apura o crime**

- **Dado** uma omissão de socorro registrada
- **Quando** o registro é concluído
- **Então** o sistema não abre, instrui nem classifica persecução penal ([RN-BOAT-121], CTB arts.
  301/304/305) — pode fundamentar AIT associado, o que é outra coisa

## Regras aplicáveis

- [RN-BOAT-114] (regime 1 — deveres do art. 176, sinistro com vítima)
- [RN-BOAT-115] (regime 2 — recusa de socorro mediante solicitação da autoridade, art. 177,
  infração autônoma e de sujeito distinto)
- [RN-BOAT-116] (regime 3 — art. 178, sinistro sem vítima, dever único de remoção por fluidez)
- [RN-BOAT-117] (o booleano `evaded` não comporta os três regimes — captura deve ser por dever
  descumprido; formaliza o refinamento de produto deste UC)
- [RN-BOAT-118] (tensão entre preservar o local para a perícia e liberar a via — sem critério
  normativo de precedência)
- [RN-BOAT-004] (dados mínimos para encerramento)

## Nota de modelagem (decisão do Owner)

Esta mudança de dado (`evaded: boolean` → captura estruturada por regime) tem impacto de schema
em `CrashVehicle`/`CrashPerson` e de UI nas telas "Veículos envolvidos" (UX-MOB-063) e "Dinâmica"
(UX-MOB-066) — ver `_intake/bpo-notes.md` §Impacto de produto para o detalhamento de campo
proposto e a avaliação de esforço.
