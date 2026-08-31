---
id: RN-PORTAL-116
title: CRLV-e — documento suficiente que dispensa via impressa, mas condicionado à quitação de débitos e à ausência de restrição
status: draft
apps: [portal]
sources: [REF-CONTRAN-809-2020, REF-CONTRAN-918, REF-CTB-280-290]
updated: 2026-08-24
---

**Regra.** O CRLV-e unifica, em documento digital único, o CRV e o CLA. No PORTAL ele obedece a
quatro comandos:

1. **É documento suficiente e dispensa a via impressa.** Basta para o cumprimento do art. 133 do CTB;
   pode ser apresentado na fiscalização em versão digital nos aplicativos oficiais **ou** impresso em
   papel A4 branco comum. A impressão é faculdade do cidadão, nunca requisito.
2. **Só é expedido após quitação.** A expedição pressupõe quitação de tributos, encargos, multas de
   trânsito e ambientais vinculados ao veículo, e o pagamento do Seguro DPVAT.
3. **Restrição administrativa ou judicial que limite a circulação impede a expedição** — hipótese
   distinta e cumulativa com a de débito, e que o PORTAL deve distinguir na tela: "há débito a pagar"
   e "há restrição que impede a emissão" são situações com desfechos diferentes para o cidadão.
4. **É verificável por QR Code dinâmico**, gerado a partir dos dados do veículo no RENAVAM, por
   sistema disponibilizado pelo órgão máximo executivo de trânsito da União — o PORTAL exibe o
   documento **com** o QR Code, e não uma representação visual própria sem ele.

**Consequência de arquitetura.** O CRLV-e é **documento condicionado**: a tela de emissão é
funcionalmente dependente do módulo de pagamento ([RN-PORTAL-125]). O produto deve refletir esse
estado explicitamente — mostrar o que falta quitar, com valor e link de pagamento — em vez de um erro
genérico de indisponibilidade. Há um caminho de saída expresso na própria norma de arrecadação: a
aprovação e efetivação do parcelamento por cartão **libera o licenciamento e a emissão do CRLV-e**
([RN-PORTAL-126]).

**Base legal.**

- [REF-CONTRAN-809-2020] art. 2º: institui o CRLV-e, _"que conterá, vinculados em um único documento,
  o Certificado de Registro de Veículo (CRV) e o Certificado de Licenciamento Anual (CLA), conforme
  disposto nos arts. 121 e 131 do CTB"_.
- [REF-CONTRAN-809-2020] art. 4º: _"O CRLV-e somente será expedido após a quitação dos débitos
  relativos a tributos, encargos e multas de trânsito e ambientais, vinculados ao veículo, bem como o
  pagamento do Seguro Obrigatório de Danos Pessoais causados por Veículos Automotores de Via
  Terrestres (Seguro DPVAT)."_ Parágrafo único: _"A existência de restrições administrativas ou
  judiciais que restrinjam a circulação do veículo impedem a expedição do CRLV-e."_
- [REF-CONTRAN-809-2020] art. 6º: _"O CRLV-e é documento suficiente para fim de cumprimento do que
  dispõe o caput do art. 133 do CTB."_ § 1º: _"Para fins de fiscalização, o CRLV-e pode ser
  apresentado na versão digital por meio dos aplicativos oficiais do Governo Federal ou na versão
  impressa em papel A4 branco comum."_ § 2º: _"A expedição do CRLV-e dispensa a obrigatoriedade da
  versão impressa."_
- [REF-CONTRAN-809-2020] art. 7º: validação por _"código de barras bidimensionais dinâmico (Quick
  Response Code - QRCode) inserido no documento"_, gerado a partir de dados do RENAVAM.
- [REF-CONTRAN-918] art. 27, § 9º: _"A aprovação e efetivação do parcelamento por meio do cartão de
  crédito pela operadora de cartão de crédito libera o licenciamento do veículo e a respectiva
  emissão do Certificado de Registro e Licenciamento do Veículo em meio digital (CRLV-e)."_
- [REF-CTB-280-290] art. 286, _caput_: o recurso pode ser interposto _"sem o recolhimento"_ do valor
  da multa — ver Controvérsia.

**Verificação.** (a) A tela de emissão consulta e exibe, item a item, as pendências que bloqueiam
(débitos por natureza + restrições), com valor e caminho de resolução para cada uma. (b) A distinção
`bloqueio_por_debito` × `bloqueio_por_restricao` existe no modelo e na mensagem ao cidadão. (c) O
documento entregue contém o QR Code do art. 7º; um PDF gerado pelo PORTAL sem o QR Code oficial não é
CRLV-e e não pode ser rotulado como tal. (d) Nenhuma tela pode sugerir que a impressão é necessária.

**Controvérsia/risco (relevante — o cruzamento com o direito de recorrer).** O art. 4º condiciona a
emissão à **quitação de multas**, enquanto o art. 286 do CTB garante recorrer **sem recolher** o
valor, e o recurso tempestivo tem **efeito suspensivo automático** ([RN-RAIT-108]). A tensão é real e
o PORTAL precisa resolvê-la de forma expressa: **multa cuja exigibilidade está suspensa por recurso
tempestivo não é "débito" para efeito do art. 4º** — tratá-la como tal converteria a impossibilidade
de licenciar em coação indireta ao pagamento, esvaziando a garantia do art. 286. A leitura é
sistemática e prudencial, **não** há dispositivo que a diga literalmente, e nenhuma resolução
localizada trata do ponto. É item de validação jurídica: se o parecerista discordar, a consequência
de produto é grave (o cidadão que recorre fica impedido de licenciar), e a tela precisa dizer isso com
todas as letras antes de ele decidir entre pagar e recorrer. Ver `_intake/legal-assessment.md`.

Risco secundário: o art. 4º menciona o **Seguro DPVAT**, cujo regime sofreu alterações legislativas
posteriores à Res. 809/2020 não capturadas neste corpus. Antes de implementar a verificação de
quitação do seguro, confirmar qual é o encargo vigente e quem o apura.
