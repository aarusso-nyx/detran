---
id: RN-BOAT-106
title: Não existe prazo vigente de transmissão de sinistro ao RENAEST — o prazo legal foi suprimido em 2023 e a regulamentação delegada nunca foi editada
status: draft
apps: [boat]
sources:
  [REF-LEI-13614-2018, REF-CTB-sinistro-cena-renaest, REF-CONTRAN-808-2020]
updated: 2026-08-28
---

**Regra.** **Não há, hoje, prazo normativo vigente para a transmissão de um sinistro individual ao
RENAEST.** Isso não é lacuna de pesquisa: é **vazio normativo com causa documentada**. O prazo
existia — 1º de março de cada ano, para consolidação e repasse estadual — na redação original do
art. 326-A, § 9º do CTB, dada pela Lei 13.614/2018. A **Lei 14.599/2023 suprimiu a data do texto
legal** e a substituiu por remissão a _"regulamentação do Contran"_. A regulamentação existente
(Res. CONTRAN 808/2020, anterior à alteração) **não fixa prazo por registro** — apenas o prazo de
**integração institucional** de 4 de janeiro de 2022. Nenhum ato CONTRAN posterior a 2023
restabelecendo prazo periódico foi localizado. Enquanto isso perdurar, o BOAT **não pode ter um
timer com fundamento legal**; qualquer prazo adotado é **decisão do órgão**, e deve ser assim
rotulado.

**Base legal — a evolução, lado a lado.**

- [REF-LEI-13614-2018] art. 326-A, § 9º, **redação de 2018 (não mais vigente)**: _"Os dados
  estatísticos coletados em cada Estado e no Distrito Federal serão tratados e consolidados pelo
  respectivo órgão ou entidade executivos de trânsito, que os repassará ao órgão máximo executivo de
  trânsito da União **até o dia 1º de março**, por meio do **sistema de registro nacional de
  acidentes e estatísticas de trânsito**."_
- [REF-CTB-sinistro-cena-renaest] art. 326-A, § 9º, **redação vigente**: _"Os dados estatísticos
  coletados em cada Estado e no Distrito Federal serão tratados e consolidados pelos respectivos
  órgãos ou entidades executivos de trânsito, que os repassarão ao órgão máximo executivo de
  trânsito da União, **conforme regulamentação do Contran**."_ _(Redação dada pela Lei nº 14.599, de 2023)_
- [REF-CONTRAN-808-2020] art. 16: _"Os órgãos e entidades que compõem o SNT deverão se integrar ao
  RENAEST até 4 de janeiro de 2022."_ — único marco temporal do domínio; é de **integração
  institucional**, não de transmissão por registro.

**Marcos temporais correlatos que existem — e que não são este prazo (não confundir).**

- [REF-CTB-sinistro-cena-renaest] art. 19, § 3º: _"Os órgãos e entidades executivos de trânsito e
  executivos rodoviários da União, dos Estados, do Distrito Federal e dos Municípios fornecerão,
  obrigatoriamente, **mês a mês**, os dados estatísticos para os fins previstos no inciso X."_ —
  periodicidade **mensal obrigatória**, mas vinculada ao inciso X (estatística geral), não
  nominalmente ao inciso XXXII/RENAEST.
- [REF-CONTRAN-808-2020] art. 8º, V: dever da União de _"publicar, **atualizar mensalmente** e
  promover a divulgação das informações"_ — pressupõe fluxo mensal a montante, sem impô-lo
  expressamente ao Estado.
- [REF-CTB-sinistro-cena-renaest] art. 326-A, § 12: _"Os índices serão divulgados oficialmente até o
  dia 30 de abril de cada ano."_ — prazo de **divulgação federal do índice**, não de envio estadual.

**Posição prudencial adotada (rotulada como interpretação, não como norma).** Na ausência de prazo
próprio, o BOAT deve adotar **periodicidade mensal** como parâmetro de trabalho — leitura sustentada
pela combinação do art. 19, § 3º do CTB (fornecimento mensal obrigatório de dado estatístico pelos
mesmos órgãos) com o art. 8º, V da Res. 808/2020 (atualização mensal da base nacional), ambos
apontando para um ciclo mensal já existente no ecossistema. Três condições para que essa adoção seja
defensável: (1) o parâmetro é **configuração versionada do órgão**, jamais constante de código;
(2) a interface e a documentação **não** devem apresentá-lo como "prazo legal"; (3) o atraso não
gera, hoje, consequência jurídica identificável — logo **não deve produzir bloqueio de operação**,
apenas alerta e indicador de conformidade.

**Verificação.** Substitui o "(fonte pendente)" de [WF-BOAT-001] §Prazos e timers: o gap está
**explicado, não fechado** — a pesquisa não encontra prazo porque ele foi revogado e a delegação não
foi cumprida. O `WF-BOAT-001` deve registrar o timer como **parâmetro do órgão** com essa nota.

**Decisão do Owner (2026-08-28, `_meta/open-issues.md` DT-017).** Confirmada a periodicidade
**mensal** como SLA operacional — a posição prudencial acima deixa de ser proposta e passa a ser
parâmetro adotado. As três condições já registradas continuam valendo (configuração versionada do
órgão, nunca apresentada como "prazo legal", atraso gera alerta e não bloqueio de operação).

**Controvérsia/risco.** _Severidade: alta para governança institucional; média para produto._ O
efeito prático de um vazio assim é ambíguo: sem prazo, não há inadimplemento datável do DETRAN-AM —
mas também não há critério objetivo de regularidade, e o Pnatrans depende desse fluxo para apurar a
meta anual de redução de mortes ([REF-CTB-sinistro-cena-renaest] art. 326-A _caput_ e § 12).
Recomenda-se que o DETRAN-AM **consulte formalmente a SENATRAN** sobre a periodicidade esperada, em
vez de fixá-la unilateralmente — e que a resposta, quando vier, seja anexada a este REF como fonte.
Item 10 de `_intake/legal-assessment.md`.
