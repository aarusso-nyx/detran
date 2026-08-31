---
id: RN-BOAT-122
title: Dado de vítima de sinistro é dado pessoal sensível e a LGPD incide integralmente — a exclusão de segurança pública não alcança o BOAT
status: draft
apps: [boat]
sources:
  [REF-LEI-13709-2018, REF-CTB-sinistro-cena-renaest, REF-CONTRAN-808-2020]
updated: 2026-08-24
---

**Regra.** Os dados de vítima coletados pelo BOAT — `severity`, `death_at_scene`, `death_at`,
`medical_care`, `hospital_destination`, `health_notes` — são **dado pessoal sensível** na definição
legal, por serem _"dado referente à saúde"_ vinculado a pessoa natural identificável. O tratamento
**submete-se integralmente à LGPD**: a exclusão do art. 4º, III (segurança pública, defesa nacional,
segurança do Estado, investigação e repressão penal) **não alcança** o registro de sinistro, cuja
finalidade legal declarada é registral-administrativa e estatística. Em consequência, todo o regime
da lei incide — hipótese legal de tratamento ([RN-BOAT-123]), minimização ([RN-BOAT-124]), término e
eliminação ([RN-BOAT-125]), direitos do titular e governança ([RN-BOAT-126]).

**Base legal.**

- [REF-LEI-13709-2018] art. 5º, II: _"dado pessoal sensível: dado pessoal sobre origem racial ou
  étnica, convicção religiosa, opinião política, filiação a sindicato ou a organização de caráter
  religioso, filosófico ou político, **dado referente à saúde** ou à vida sexual, dado genético ou
  biométrico, quando vinculado a uma pessoa natural"_.
- [REF-LEI-13709-2018] art. 4º: _"Esta Lei não se aplica ao tratamento de dados pessoais: [...]
  III - realizado para fins **exclusivos** de: a) segurança pública; b) defesa nacional; c) segurança
  do Estado; ou d) atividades de investigação e repressão de infrações penais"_; § 1º: o tratamento
  do inciso III _"será regido por legislação específica, que deverá prever medidas proporcionais e
  estritamente necessárias ao atendimento do interesse público"_.
- [REF-CONTRAN-808-2020] art. 2º, parágrafo único: a base nacional existe _"de modo a subsidiar o
  desenvolvimento de estudos, pesquisas e ações que visem à melhoria da segurança no trânsito no
  país"_ — finalidade **estatística e de política pública**, não de segurança pública no sentido do
  art. 4º, III.
- [REF-CONTRAN-808-2020] art. 5º, § 5º: _"No envio de dados e informações de que trata o caput entre
  os órgãos integrados ao RENAEST, serão observados os dispositivos da Lei nº 13.709, de 14 de agosto
  de 2018, a Lei Geral de Proteção de Dados Pessoais (LGPD)."_ — a própria norma de trânsito afirma
  a incidência.

**Verificação.** Três consequências verificáveis no produto:

1. `hospital_destination` e `health_notes` **já** estão marcados `"pii": "high"` no blueprint
   ([RN-BOAT-003]) — a marcação estava certa, faltava-lhe fundamento; agora tem. Mas a marcação
   deve alcançar também `severity`, `medical_care`, `death_at_scene` e `death_at`, que são
   igualmente dado de saúde e hoje **não** aparecem classificados como tal.
2. `severity` é dado de saúde **e** campo obrigatório do registro ([RN-BOAT-001]) **e** determinante
   da gravidade transmitida ao RENAEST ([RN-BOAT-002]) — ou seja, o sistema não tem a opção de
   "não coletar dado sensível": o núcleo do registro é sensível por natureza. Isso desloca a questão
   de _se_ tratar para _sob qual base legal e com quais salvaguardas_.
3. A demarcação do art. 4º, III é **favorável** à proteção, não ao órgão: nada aqui autoriza regime
   atenuado. Onde o atendimento produzir dado que sirva simultaneamente à persecução penal (art.
   304/305 — [RN-BOAT-121]), esse uso é de outra autoridade, sob outro regime, e não converte o
   registro do BOAT em base de segurança pública.

**Controvérsia/risco.** A exclusão do art. 4º, III exige finalidade **exclusiva**. Um argumento
possível — e que deve ser antecipado — sustentaria que o registro de sinistro serve também à
apuração de infrações e à instrução de eventual persecução penal, atraindo o inciso III. **Não é a
leitura adotada aqui**, por três razões textuais: a finalidade declarada pela norma que institui o
sistema é estatística (Res. 808/2020 art. 2º, p.ú.); a competência do CTB é de _"coletar dados
estatísticos e elaborar estudos"_ (art. 22, IX); e o próprio [APP-BOAT] exclui a apuração penal do
seu escopo. Ainda que a tese contrária prevalecesse, o § 1º do art. 4º exigiria **legislação
específica** com medidas proporcionais — que não existe. Em qualquer cenário, portanto, o regime
protetivo se aplica. Item 1 de `_intake/legal-assessment.md`.
