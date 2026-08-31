---
id: IU-BOAT-001
title: Inventário de telas do BOAT — mobile de campo, web de retaguarda e propostas
status: reviewed
apps: [boat, portal]
sources:
  [
    REF-CONTRAN-808-2020,
    REF-SENATRAN-PORTARIA-139-2025,
    REF-CTB-sinistro-cena-renaest,
    REF-DETRANAM-TALAO-BODYCAM,
  ]
updated: 2026-08-26
---

Promovido de `_intake/ux-notes.md` §a na rodada de endurecimento de 2026-08-26, com três correções
sobre a versão de intake: a tela de veículos **não** captura mais `evaded` (substituído pela captura
estruturada de [UC-BOAT-007]); a tela de dinâmica ganhou o UC que a governa; e duas telas foram
acrescentadas para casos de uso que existiam sem superfície ([UC-BOAT-012] e o dever de resposta ao
titular de [RN-BOAT-126]).

O BOAT compartilha o aplicativo de campo do TEAT — as telas mobile vivem no grupo `sinistros` da
matriz oficial de 67 telas (ver [IU-TEAT-001]), e as regras transversais de [IU-TEAT-001] §D valem
aqui também. Este inventário cobre o que é específico do domínio de sinistro.

## A — Mobile, grupo `sinistros` (11 existentes + 1 nova)

| id       | Tela                              | `screenId`         | Jornada                        | UC / estado                                                              |
| -------- | --------------------------------- | ------------------ | ------------------------------ | ------------------------------------------------------------------------ |
| S-01     | Novo sinistro                     | `crash-start`      | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-001] — `RASCUNHO`→`EM_ATENDIMENTO`                              |
| S-02     | Local e horário                   | `crash-location`   | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-001] — `occurred_at` ≠ `recorded_at` (AC-BOAT-001-3)            |
| S-03     | Condições                         | `crash-conditions` | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-001] — as quatro condições são obrigatórias (AC-BOAT-001-4)     |
| S-04     | Veículos envolvidos               | `crash-vehicles`   | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-002] — **sem campo `evaded`** (AC-BOAT-002-2)                   |
| S-05     | Pessoas envolvidas                | `crash-people`     | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-002]                                                            |
| S-06     | Vítimas                           | `crash-victims`    | [JRN-BOAT-001]                 | [UC-BOAT-003] — tela mais sensível do app, ver §C                        |
| S-07     | Condutas de cena (176/177/178)    | `crash-dynamics`   | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-007] — regime derivado da presença de vítima (AC-BOAT-007-1)    |
| S-08     | Croqui                            | `crash-sketch`     | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-004]                                                            |
| S-09     | Evidências do sinistro            | `crash-evidence`   | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-004] — "fotografar a cena, não o sofrimento"                    |
| S-10     | AITs e medidas vinculados         | `crash-ait-links`  | [JRN-BOAT-001]                 | [UC-BOAT-004], [UC-BOAT-006]                                             |
| S-11     | Revisão do sinistro               | `crash-review`     | [JRN-BOAT-001], [JRN-BOAT-002] | [UC-BOAT-005] — gate de encerramento                                     |
| **S-12** | **Danos materiais e testemunhas** | _(nova)_           | [JRN-BOAT-002]                 | [UC-BOAT-012] — promovido de stub nesta rodada; sem superfície até agora |

## B — Web, grupo `crashes` (4 existentes + 1 nova)

| id       | Tela                                                               | Jornada        | Estado(s)                                                                   |
| -------- | ------------------------------------------------------------------ | -------------- | --------------------------------------------------------------------------- |
| W-01     | Lista de sinistros                                                 | [JRN-BOAT-004] | agregado — `PENDENTE_COMPLEMENTO`, `REGISTRADO`, `INTEGRADO`                |
| W-02     | Detalhe de sinistro                                                | [JRN-BOAT-004] | qualquer estado local                                                       |
| W-03     | Complementação                                                     | [JRN-BOAT-004] | `PENDENTE_COMPLEMENTO`→`REGISTRADO`/`VALIDADO`                              |
| W-04     | Cascata de validação e integração RENAEST                          | [JRN-BOAT-004] | [WF-BOAT-003] completo + submáquina nacional ([UC-BOAT-009], [UC-BOAT-011]) |
| **W-05** | **Atendimento a pedido do titular (acesso, correção, eliminação)** | _(nova)_       | transversal — [RN-BOAT-126], AC-BOAT-003-7                                  |

## C — A tela de vítimas é o ponto de maior risco do app

`crash-victims` (S-06) concentra todo o dado sensível do domínio e merece regras próprias, não só
as transversais:

1. **Todos os campos de vítima são dado de saúde** — `severity`, `medical_care`, `death_at_scene`,
   `death_at`, `hospital_destination`, `health_notes` ([RN-BOAT-122]). A marcação hoje restrita a
   dois deles está incompleta (AC-BOAT-003-1).
2. **A tela não é acessível por padrão** — abre sob perfil e finalidade, e cada abertura é auditada
   ([RN-BOAT-003], [RN-BOAT-126]).
3. **Nada de "observações livres" convidando a excesso.** `health_notes` deve orientar ao mínimo
   necessário; a minimização reforçada da Portaria 139/2025 art. 18 é regra de tela, não só de API
   ([RN-BOAT-124]).
4. **Gravidade tem vocabulário federal** — o seletor usa o enum sob competência da SENATRAN
   ([RN-BOAT-111]), compatível com `SEM_VITIMA | COM_VITIMA_FERIDA | COM_VITIMA_FATAL`.
5. **Nenhum campo exibe prazo de retenção "permanente"** — não existe retenção sem prazo
   ([RN-BOAT-125]); enquanto o Owner não define os prazos (DT-049), a tela não deve afirmar
   permanência.

## D — Requisitos transversais

1. **"Sinistro", nunca "acidente"** ([RN-BOAT-110]) — inclusive em rótulos herdados do protótipo.
2. **Ergonomia de cena adversa** — chuva, noite, risco de atropelamento, uma mão livre, interrupção
   constante. Ver `_intake/ux-notes.md` §b, que segue sendo a fonte dessas regras.
3. **Linguagem simples nas três capturas de dever** — o agente precisa distinguir 176, 177 e 178 sob
   pressão; a tela S-07 carrega essa carga cognitiva e deve nomear o regime ativo, não presumir que
   o agente o deduza ([RN-BOAT-114] a [RN-BOAT-116]).
4. **O indicador de bodycam é o mesmo do TEAT** ([IU-TEAT-001] §C) — atendimento a sinistro é
   hipótese nominal de uso obrigatório ([RN-BOAT-129]).
5. **Nada bloqueia por falta de rede** — a cena raramente tem conectividade.

## E — Propostas sem superfície confirmada

| Proposta                                                                                           | Jornada        | Estágio                                                                                        |
| -------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------- |
| Console de complemento de parceiro hospitalar (busca por chave natural + campos mínimos de vítima) | [JRN-BOAT-003] | onda futura — depende de adesão institucional; Owner manteve como visão futura (steering F.31) |
| PORTAL — busca e consulta do BAT pelo cidadão envolvido                                            | [JRN-BOAT-005] | proposta — nenhum artefato escrito em `transversal/portal/**`                                  |
| PORTAL — download do documento oficial do BAT                                                      | [JRN-BOAT-005] | proposta, mesmo escopo                                                                         |

As duas propostas de PORTAL têm relação direta com W-05: o atendimento a pedidos do titular pode
ser a via pela qual o cidadão obtém seu próprio BAT, o que evitaria construir duas superfícies para
o mesmo direito. Decisão de produto pendente.

## F — Pendências de desenho

- **S-06 e W-05 dependem dos prazos de retenção** (DT-049) e da publicação da hipótese legal
  (DT-047). Nenhuma das duas deve ir a produção antes dessas decisões.
- **S-12** cobre um UC recém-promovido de stub; o desenho não tem precedente no protótipo.
- **W-04** exibe estados terminais nacionais sem caminho de correção — a tela precisa dizer isso
  explicitamente (AC-BOAT-011-5), o que é decisão de conteúdo, não de layout.
