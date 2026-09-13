---
id: UC-BOAT-003
title: Agente registra vítimas e classifica gravidade
status: reviewed
apps: [boat, teat]
sources:
  [
    'teat:docs/framework/product/blueprints/BP-CRASH-RECORDS-001.json',
    'teat:docs/framework/product/workflows/crash-records.md',
    'teat:docs/framework/product/ux-parity/mobile-matrix.json',
    'senatran:docs/framework/contracts/openapi-transactional.yaml',
  ]
updated: 2026-09-13
---

## Ator e objetivo

Agente registra cada vítima do sinistro, classificando gravidade e circunstâncias de
atendimento, com controle de acesso reforçado aos dados sensíveis coletados.

## Pré-condições

Ao menos uma `CrashPerson` registrada ([UC-BOAT-002]).

## Fluxo principal

1. Agente registra vítima a partir de uma pessoa envolvida (`crash-victims`, UX-MOB-065):
   `CrashVictim.crash_person_id`.
2. Classifica gravidade (`severity`, obrigatório) — [RN-BOAT-001].
3. Registra óbito no local, se aplicável (`death_at_scene`, `death_at`).
4. Registra se houve atendimento médico (`medical_care`).
5. Registra destino de remoção hospitalar, se houver (`hospital_destination` — dado de alta
   sensibilidade, retenção permanente).
6. Registra observações de saúde relevantes (`health_notes` — mesma sensibilidade).

## Fluxos alternativos / exceções

- **2a.** Sinistro será posteriormente classificado com gravidade `COM_VITIMA_FERIDA` ou
  `COM_VITIMA_FATAL` na transmissão à RENAEST: o sistema deve garantir que ao menos uma vítima
  esteja registrada antes da transmissão, sob pena de rejeição nacional por dados incompletos
  ([RN-BOAT-002]).
- **Acesso.** Consulta/exibição dos campos de vítima é restrita por perfil e finalidade,
  independentemente da gravidade classificada ([RN-BOAT-003]).

## Pós-condições

Vítima(s) registrada(s) com gravidade classificada; dados sensíveis protegidos por controle de
acesso reforçado; registro apto a compor a transmissão nacional ([UC-BOAT-005]).

## Critérios de aceitação

**AC-BOAT-003-1 — todo dado de vítima é dado pessoal sensível, não só dois campos**

- **Dado** os campos de vítima
- **Quando** o modelo é implementado
- **Então** `severity`, `medical_care`, `death_at_scene`, `death_at`, `hospital_destination` e
  `health_notes` são **todos** marcados como dado referente à saúde ([RN-BOAT-122]) — a marcação
  hoje restrita a `hospital_destination`/`health_notes` está incompleta e é bug de produto, não
  refinamento futuro

**AC-BOAT-003-2 — a hipótese legal de tratamento é declarada, não presumida**

- **Dado** o tratamento de dado de saúde da vítima
- **Quando** o sistema o realiza
- **Então** opera sob a hipótese prudencial do art. 11, II, "a"/"b" da LGPD ([RN-BOAT-123]) e essa
  hipótese está **publicada** — a exclusão de segurança pública do art. 4º, III **não alcança** o
  BOAT, cuja finalidade é registral-administrativa e estatística ([RN-BOAT-122])

**AC-BOAT-003-3 — validação em vez de dado bruto, onde couber**

- **Dado** um campo sensível cujo uso a jusante é apenas verificar uma condição
- **Quando** o dado é transmitido ou exposto
- **Então** trafega a **validação** e não o dado bruto ([RN-BOAT-124], minimização reforçada da
  Portaria SENATRAN 139/2025 art. 18)

**AC-BOAT-003-4 — retenção permanente é proibida**

- **Dado** qualquer campo de vítima
- **Quando** sua política de retenção é definida
- **Então** existe prazo — `retention: forever` é juridicamente insustentável ([RN-BOAT-125]) e o
  sistema não deve ser implantado com esse valor; o prazo concreto é pendência do Owner (DT-049)

**AC-BOAT-003-5 — gravidade segue o padrão técnico federal**

- **Dado** a classificação de gravidade
- **Quando** o agente a informa
- **Então** usa o enum sob competência da SENATRAN ([RN-BOAT-111]) e compatível com
  `SEM_VITIMA | COM_VITIMA_FERIDA | COM_VITIMA_FATAL` do registro nacional — o BOAT não cria
  vocabulário próprio de gravidade

**AC-BOAT-003-6 — acesso é por perfil e finalidade, e é auditado**

- **Dado** uma consulta a campos de vítima
- **Quando** ocorre
- **Então** é autorizada por perfil **e** finalidade, independentemente da gravidade
  ([RN-BOAT-003]), e cada acesso é registrado em trilha auditável ([RN-BOAT-126])

**AC-BOAT-003-7 — direitos do titular têm caminho, mesmo que o atendimento seja externo**

- **Dado** um titular que solicita acesso, correção ou eliminação
- **Quando** o pedido chega
- **Então** existe procedimento definido e prazo de resposta ([RN-BOAT-126]); a interface com o
  cidadão é do PORTAL, mas o BOAT tem de expor a operação — hoje **nenhum caso de uso a cobre**,
  gap registrado em `APP.md` §Residual

## Regras aplicáveis

- [RN-BOAT-001] (gravidade sempre obrigatória)
- [RN-BOAT-002] (RENAEST exige dados de vítima quando gravidade indica vítima)
- [RN-BOAT-003] (controle de acesso reforçado, independente da gravidade)

**Atualização (2026-09-13, steering.md H.44, H.45).** Prazos de retenção e hipótese legal
decididos pelo Owner ([RN-BOAT-123], [RN-BOAT-125]); a restrição de implantação registrada acima
está atendida — o valor de retenção é 5 anos com anonimização, nunca permanente.
