---
id: RN-TEAT-131
title: Alcoolemia — quatro meios de prova não excludentes, com prioridade normativa do etilômetro
status: draft
apps: [teat]
sources: [REF-CTB-165-277-medidas-alcoolemia, REF-CONTRAN-432]
updated: 2026-08-24
---

**Regra.** O condutor **envolvido em sinistro de trânsito ou alvo de fiscalização** poderá ser
submetido a teste, exame clínico, perícia ou outro procedimento que, por meios técnicos ou
científicos, permita certificar influência de álcool ou substância psicoativa. A confirmação da
alteração da capacidade psicomotora dá-se por **pelo menos um** dos quatro procedimentos:
(I) exame de sangue; (II) exames por laboratórios especializados; (III) **teste em etilômetro**;
(IV) **verificação dos sinais** de alteração da capacidade psicomotora. Podem ainda ser usados
**prova testemunhal, imagem, vídeo ou qualquer outro meio de prova em direito admitido**. Nos
procedimentos de fiscalização, **deve-se priorizar o teste com etilômetro**. Havendo sinais ou
comprovação por etilômetro, e havendo encaminhamento para exame de sangue ou clínico, **não é
necessário aguardar o resultado desses exames para fins de autuação administrativa**.

**Base legal.**

- [REF-CTB-165-277-medidas-alcoolemia] art. 277 _caput_: _"O condutor de veículo automotor
  envolvido em sinistro de trânsito ou que for alvo de fiscalização de trânsito poderá ser
  submetido a teste, exame clínico, perícia ou outro procedimento que, por meios técnicos ou
  científicos, na forma disciplinada pelo Contran, permita certificar influência de álcool ou outra
  substância psicoativa que determine dependência."_ · §2º: _"A infração prevista no art. 165
  também poderá ser caracterizada mediante imagem, vídeo, constatação de sinais que indiquem, na
  forma disciplinada pelo Contran, alteração da capacidade psicomotora ou produção de quaisquer
  outras provas em direito admitidas."_
- [REF-CONTRAN-432] art. 3º _caput_ e §§1º a 3º:
  > "Art. 3º A confirmação da alteração da capacidade psicomotora […] dar-se-á por meio de, pelo
  > menos, um dos seguintes procedimentos […]: I – exame de sangue; II – exames realizados por
  > laboratórios especializados…; III – teste em aparelho destinado à medição do teor alcoólico no
  > ar alveolar (etilômetro); IV – verificação dos sinais que indiquem a alteração da capacidade
  > psicomotora do condutor."
  > "§ 1º Além do disposto nos incisos deste artigo, também poderão ser utilizados prova
  > testemunhal, imagem, vídeo ou qualquer outro meio de prova em direito admitido."
  > "§ 2º Nos procedimentos de fiscalização deve-se priorizar a utilização do teste com etilômetro."
  > "§ 3° Se o condutor apresentar sinais de alteração da capacidade psicomotora na forma do art.
  > 5º ou haja comprovação dessa situação por meio do teste de etilômetro e houver encaminhamento
  > do condutor para a realização do exame de sangue ou exame clínico, não será necessário aguardar
  > o resultado desses exames para fins de autuação administrativa."

**Verificação.** O procedimento de etilômetro do TEAT **não pode ser o único meio modelado**. O ato
legal de alcoolemia carrega uma coleção de `meios_de_prova`, **não excludentes**, com pelo menos:
etilômetro, sinais ([RN-TEAT-132]), encaminhamento a exame de sangue/clínico/laboratorial, e
provas complementares (testemunha, imagem, vídeo) tratadas como evidência com hash e custódia
([RN-TEAT-002]). O §3º é decisivo para o desenho de estado: **o AIT é lavrado e finalizado no ato**
— o encaminhamento a exame é um evento apenso, não uma pendência bloqueante. A prioridade do §2º é
regra de **ordem de oferta na UI** e de justificativa: não tendo sido usado o etilômetro, o motivo
deve ficar registrado.

**Controvérsia/risco.** A prioridade do etilômetro é redigida como dever ("deve-se priorizar"), sem
sanção nem definição de quando é lícito não usá-lo. Na prática, as duas hipóteses legítimas são
recusa do condutor ([RN-TEAT-134]) e indisponibilidade/impossibilidade técnica do aparelho
([RN-TEAT-135]) — que têm consequências jurídicas **opostas** e por isso não podem compartilhar
campo. Ver Handoff UX do `_intake/research-dossier.md`, item 4.
