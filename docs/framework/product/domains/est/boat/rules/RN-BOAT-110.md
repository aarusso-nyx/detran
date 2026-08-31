---
id: RN-BOAT-110
title: Terminologia obrigatória "sinistro" desde a Lei 14.599/2023 — e o uso residual de "acidente" onde a norma citada assim o nomeia
status: draft
apps: [boat, teat, portal, dashboard]
sources:
  [
    REF-CTB-sinistro-cena-renaest,
    REF-CONTRAN-808-2020,
    REF-SENATRAN-PORTARIA-139-2025,
  ]
updated: 2026-08-24
---

**Regra.** A Lei 14.599/2023 substituiu "acidente de trânsito" por **"sinistro de trânsito"** em
todo o CTB e introduziu a definição do Anexo I ([RN-BOAT-109]). A terminologia legal vigente é
**sinistro**, e é ela que deve ser usada em interface, documento emitido, nomenclatura de domínio e
comunicação ao cidadão. "Acidente" permanece legítimo em **dois casos apenas**: (a) na **citação
literal** de norma que assim o nomeia — notadamente a Res. CONTRAN 808/2020 e o nome do documento
**BAT (Boletim de Ocorrência de Acidente de Trânsito)**, que é designação normativa vigente; (b) em
**nome próprio de sistema ou documento** de terceiro. Fora disso, "acidente" é terminologia
superada.

**Base legal.**

- [REF-CTB-sinistro-cena-renaest]: todos os dispositivos capturados — arts. 19 (XI, XXXII), 20 (IV,
  VII, XIII), 21 (IV), 22 (IX), 24 (IV), 176, 177, 178, 279, 279-A, 301, 304, 305 e Anexo I —
  trazem, no texto compilado oficial, a anotação _(Redação dada pela Lei nº 14.599, de 2023)_ ou
  _(Incluído pela Lei nº 14.599, de 2023)_, confirmando que a substituição terminológica foi
  promovida por instrumento único e alcança o Código inteiro.
- [REF-CTB-sinistro-cena-renaest] art. 19, XXXII: _"organizar e manter o Registro Nacional de
  **Sinistros** e Estatísticas de Trânsito (Renaest)"_.
- [REF-CONTRAN-808-2020] arts. 1º, 2º e 4º: mantêm _"Registro Nacional de **Acidentes** e
  Estatísticas de Trânsito"_ e _"Boletim de Ocorrência de **Acidente** de Trânsito (BAT)"_ —
  regulamentação de 2020, **não atualizada** após 2023.
- [REF-SENATRAN-PORTARIA-139-2025] art. 7º, § 1º: _"Registro Nacional de **Sinistros** e
  Estatísticas de Trânsito - Renaest"_ — norma de 2025 já usando a designação legal nova para o
  mesmo sistema.

**Verificação.** Higiene de citação, com efeito prático em três lugares do corpus: (1) o título de
[APP-BOAT] ("Boletim de **Acidentalidade** de Trânsito") e a expansão do acrônimo RENAEST usada na
sua §Missão ("Registro Nacional de Acidentes...") refletem a nomenclatura anterior — a expansão
deveria seguir o CTB; o nome próprio do produto é decisão do Owner; (2) o glossário compartilhado
deve registrar **sinistro** como termo principal e "acidente" como termo histórico, com a data da
alteração; (3) documentos emitidos ao cidadão e rótulos de UI devem usar "sinistro", exceto o nome
do BAT.

**Controvérsia/risco.** A dissonância não é meramente estética: enquanto a Res. 808/2020 não for
atualizada, coexistem no ordenamento uma **lei** que nomeia o sistema como "de Sinistros" e a
**resolução que o institui e regulamenta** nomeando-o "de Acidentes" — sem instrumento que amarre
formalmente as duas designações ([RN-BOAT-102] §Controvérsia). Consequência de citação: ao invocar a
Res. 808/2020, **transcrever "acidente" como está no texto** e anotar a correspondência; "corrigir"
a citação para "sinistro" seria adulterar fonte. Item 9 de `_intake/legal-assessment.md`.
