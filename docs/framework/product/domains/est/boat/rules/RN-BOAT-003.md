---
id: RN-BOAT-003
title: Dados de vítima têm controle de acesso reforçado, independentemente da gravidade
status: draft
apps: [boat]
sources:
  [
    'teat:docs/framework/product/blueprints/BP-CRASH-RECORDS-001.json',
    'teat:docs/meta/prototypes/docs/RN-1_Regras_de_Negocio_Talonario_Eletronico.md',
    REF-LEI-13709-2018,
    REF-CONTRAN-808-2020,
    REF-SENATRAN-PORTARIA-139-2025,
  ]
updated: 2026-08-24
---

**Regra.** Campos de saúde/destino hospitalar de vítima (`hospital_destination`, `health_notes`)
são classificados como dado pessoal sensível de alta criticidade, com controle de acesso reforçado —
**para toda vítima registrada, independentemente do valor de `severity`**. Não foi encontrada, em
nenhuma fonte lida, uma regra que restrinja a _coleta_ ou a _exibição_ dos campos de vítima com base
na gravidade — a única restrição encontrada com base em gravidade é o gate de completude na
submissão à RENAEST ([RN-BOAT-002]).

**Base legal.** Fechada na revisão LEGAL de 2026-08-24 — a classificação **não decorre apenas de
política interna**, decorre de lei:

- [REF-LEI-13709-2018] art. 5º, II: dado pessoal sensível inclui _"dado referente à saúde"_ vinculado
  a pessoa natural — enquadramento direto de `hospital_destination` e `health_notes`, **e também** de
  `severity`, `medical_care`, `death_at_scene` e `death_at` ([RN-BOAT-122]).
- [REF-LEI-13709-2018] art. 11: o tratamento de dado sensível só é lícito nas hipóteses ali
  taxativas — a **hipótese aplicável não é definida por nenhuma norma de trânsito**; posição
  prudencial adotada em [RN-BOAT-123].
- [REF-LEI-13709-2018] art. 6º, III (necessidade) e art. 46 (segurança) — fundamento do controle de
  acesso reforçado.
- [REF-CONTRAN-808-2020] art. 5º, § 5º: _"No envio de dados e informações [...] entre os órgãos
  integrados ao RENAEST, serão observados os dispositivos da Lei nº 13.709 [...] (LGPD)."_
- [REF-SENATRAN-PORTARIA-139-2025] art. 18, §§ 1º e 2º: minimização reforçada — evitar dado sensível,
  priorizar **validação** e autorizar dado bruto _"somente em caráter excepcional"_ ([RN-BOAT-124]).

**Verificação.** `BP-CRASH-RECORDS-001.json`: `CrashVictim.hospital_destination` e
`CrashVictim.health_notes` marcados `"pii": "high", "retention": "forever"`. Corpus de protótipo
(evidência): RN-SIN-011 "Dados de vítimas devem ter controle de acesso reforçado" (LGPD e
sensibilidade); RN-LGPD-003 "Dados pessoais sensíveis ou de maior risco devem ter controle
reforçado" (vítimas, saúde, imagens, biometria, localização); RN-AUD-005 "Acesso a dados
sensíveis deve ser auditado com finalidade" (vítimas, CNH, CPF, imagens e restrições); regra
geral RN-GER-007 "consultas a RENACH/RENAVAM e dados de vítimas devem ter acesso restrito".

**Nota de revisão — LEGAL, 2026-08-24. CORRIGIDA em um ponto material; confirmada e ampliada no
resto.**

1. **"(fonte pendente)" fechado.** A proteção tem base legal expressa (LGPD arts. 5º, II; 11; 46),
   reforçada por duas normas setoriais ([REF-CONTRAN-808-2020] art. 5º § 5º;
   [REF-SENATRAN-PORTARIA-139-2025] art. 18). Não é "política de privacidade aplicada ao domínio":
   é regime legal.
2. **CORREÇÃO — `"retention": "forever"` é juridicamente insustentável para dado identificado.**
   A LGPD faz da **eliminação** a regra (art. 16) e admite conservação apenas nas quatro hipóteses
   do artigo, sendo a mais ampla condicionada à **anonimização**. A marcação atual deve ser
   substituída por política em duas camadas — registral identificada com prazo, e estatística
   anonimizada sem prazo ([RN-BOAT-125]). Este é o ponto em que a regra anterior estava
   **materialmente errada**, não apenas incompleta.
3. **Ampliação de escopo do campo protegido.** A regra citava dois campos; o regime alcança **todos**
   os dados de saúde da vítima, inclusive `severity` — que é obrigatório e, portanto, torna o núcleo
   do registro sensível por natureza ([RN-BOAT-122]).
4. **Base legal de tratamento continua em aberto** — nenhuma norma indica a hipótese do art. 11
   aplicável. É a lacuna nº 1 do corpus BOAT; posição prudencial e obrigações decorrentes em
   [RN-BOAT-123]. Item 1 de `_intake/legal-assessment.md`.
5. **Acrescentado o desdobramento de acesso**: o papel `auditor` precisa ser limitado a metadados e
   trilha quanto a dado de saúde, com acesso ao dado bruto apenas por ato excepcional justificado —
   mesmo desenho já adotado para bodycam em [RN-TEAT-142] ([RN-BOAT-124], [RN-BOAT-126]).
