---
id: RN-PORTAL-115
title: CNH em meio físico ou digital, a critério do condutor — paridade jurídica plena, fé pública e equivalência a documento de identidade
status: draft
apps: [portal, pec]
sources: [REF-CONTRAN-809-2020, REF-CTB-147-148-habilitacao, REF-LEI-14129-2021]
updated: 2026-08-24
---

**Regra.** Desde a redação dada ao art. 159 do CTB pela **Lei nº 15.428/2026**, a CNH:

- **pode ser emitida em meio físico ou digital, à escolha do candidato ou do condutor** — a escolha é
  dele, não do órgão, e o PORTAL deve oferecê-la explicitamente em vez de presumir um dos meios;
- **tem fé pública e equivale a documento de identidade** em todo o território nacional, em **ambos**
  os meios;
- deve conter fotografia, nome, **CPF** e os demais requisitos do CONTRAN — o que confirma
  [RN-PORTAL-103].

Isso é mais do que a dispensa de porte já trazida pela Lei 14.071/2020 (§ 1º-A): não se trata de
tolerar a ausência do plástico quando há consulta eletrônica, e sim de **paridade formal de status
jurídico** entre os dois meios. Para o PORTAL:

1. Exibir a CNH digital do titular é exibir **um documento**, não uma consulta de situação — o que
   eleva os requisitos de integridade, autenticação local e verificabilidade por terceiro.
2. O PORTAL **não pode** rotular a versão digital como "cópia", "espelho", "consulta informativa" ou
   equivalente. Rótulo que sugira inferioridade jurídica contradiz o inciso III.
3. Dois avisos legais devem acompanhar o documento, porque continuam vigentes e são frequentemente
   ignorados: **o porte é obrigatório na direção** (§ 1º, dispensado apenas na hipótese do § 1º-A), e
   **renovação ou segunda via só após quitação de débitos do prontuário** (§ 8º).
4. O aviso de **vencimento com 30 dias de antecedência**, que o órgão estadual deve enviar por meio
   eletrônico a todo condutor cadastrado no RENACH (§ 12), é dever legal do DETRAN-AM e um caso de uso
   natural da caixa do cidadão ([WF-PORTAL-003]) — não uma notificação opcional de produto.

**Base legal.**

- [REF-CONTRAN-809-2020] / CTB art. 159 _(Redação dada pela Lei nº 15.428, de 2026)_:
  > _"Art. 159. A Carteira Nacional de Habilitação: I - **poderá ser emitida em meio físico ou
  > digital, a critério do candidato ou do condutor**; II - deverá conter fotografia, nome, número de
  > inscrição no Cadastro de Pessoas Físicas (CPF) e demais requisitos estabelecidos pelo Contran; e
  > III - **terá fé pública e equivalerá a documento de identidade no território nacional**."_
- CTB art. 159, § 1º: _"É obrigatório o porte da Permissão para Dirigir ou da Carteira Nacional de
  Habilitação quando o condutor estiver à direção do veículo."_; § 1º-A _(Incluído pela Lei nº 14.071,
  de 2020)_: _"O porte do documento de habilitação será dispensado quando, no momento da fiscalização,
  for possível ter acesso ao sistema informatizado para verificar se o condutor está habilitado."_
- CTB art. 159, § 5º: _"A Carteira Nacional de Habilitação e a Permissão para Dirigir somente terão
  validade para a condução de veículo quando apresentada em original."_
- CTB art. 159, § 8º: renovação ou nova via _"somente será realizada após quitação de débitos
  constantes do prontuário do condutor"_; § 12: aviso eletrônico de vencimento com **30 dias** de
  antecedência a todos os condutores cadastrados no RENACH.
- [REF-LEI-14129-2021] art. 28, § 1º, X: o CPF deve constar da CNH — convergente com o inciso II.

**Verificação.** (a) O fluxo de emissão/renovação registra `meio_emissao ∈ {fisico, digital}` como
**escolha explícita do condutor**, com valor padrão nenhum — nunca inferido. (b) A tela do documento
digital exibe os elementos do inciso II e não usa vocabulário de subordinação ("cópia", "espelho").
(c) O aviso de vencimento de 30 dias é um job com evidência de envio por condutor, auditável — é
dever legal e, portanto, indicador de conformidade do DASHBOARD, não métrica de engajamento. (d) A
tela informa a regra do § 8º **antes** de o condutor iniciar a renovação, e não como erro ao final.

**Controvérsia/risco.**

1. **O § 5º ("somente [...] quando apresentada em original") permanece na redação vigente**, ao lado
   dos novos incisos I e III. A leitura harmônica — e a única compatível com a paridade do inciso I —
   é que a **versão digital oficial, no aplicativo oficial, é ela própria o "original"**, e o que o
   § 5º exclui é a _cópia_ (fotocópia, foto da CNH na galeria, captura de tela). A consequência de
   produto é forte: uma imagem exportada ou um screenshot do documento **não** é o documento, e o
   PORTAL não deve oferecer "salvar como imagem" sem essa distinção explícita.
2. **Texto muito recente (2026), pouco sedimentado.** A maior parte das fontes secundárias ainda
   descreve a redação de 2020. Recomenda-se ao parecerista verificar se a Lei 15.428/2026 impacta
   outros artefatos do corpus que citam a CNH — notadamente a identificação do condutor
   ([RN-RAIT-120]) e os documentos de identificação exigidos em defesa/recurso
   ([REF-CONTRAN-900] art. 5º, III), onde a equivalência a documento de identidade pode dispensar
   exigências hoje praticadas.
3. **Instrumento técnico do aplicativo não localizado.** Não foi encontrada resolução ou portaria
   autônoma dedicada à "Carteira Digital de Trânsito"/app "CNH do Brasil" enquanto sistema; a
   [REF-CONTRAN-809-2020], apontada por fontes de imprensa, trata exclusivamente de CRLV-e/ATPV-e.
   Se o PORTAL optar por **superficiar** o documento em vez de encaminhar ao app oficial, estará
   fazendo-o sem norma técnica de referência sobre leiaute, mecanismo de verificação e revogação —
   risco de implementação, não de direito. Pistas não confirmadas: Res. CONTRAN 1.020/2025 e
   1.027/2026. Ver `refs/INDEX.md`, gaps da rodada, e `_intake/legal-assessment.md`.
