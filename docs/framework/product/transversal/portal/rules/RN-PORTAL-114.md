---
id: RN-PORTAL-114
title: Guia, boleto e comunicação de cobrança em formato acessível mediante solicitação
status: draft
apps: [portal]
sources:
  [REF-LEI-13146-2015-acessibilidade, REF-CONTRAN-918, REF-LEI-13460-2017]
updated: 2026-08-24
---

**Regra.** A pessoa com deficiência tem direito a receber **em formato acessível**, mediante
solicitação, contas, boletos, recibos, extratos e cobranças de tributos. No PORTAL isso alcança
diretamente: o **documento de arrecadação da multa**, a guia de taxa de serviço, o comprovante de
pagamento e a comunicação de cobrança/vencimento. Três consequências:

1. **Não basta o PDF padrão.** Um documento de arrecadação é, tipicamente, um PDF gerado como imagem
   ou com estrutura de tabela ilegível por leitor de tela, e com o valor e a data embutidos em código
   de barras. "Exportar em PDF" **não** satisfaz o art. 62 — o formato acessível precisa expor
   valor, vencimento, linha digitável e identificação do débito como **texto estruturado**.
2. **A solicitação é do titular e deve ser persistente.** O direito é exercido _"mediante
   solicitação"_, mas a solicitação não pode ser repetida a cada emissão: registrada como preferência
   no perfil ([RN-PORTAL-111], item 4), passa a valer para todas as emissões futuras, em todos os
   serviços.
3. **Nenhum custo e nenhum atraso.** Formato acessível não pode implicar taxa nem prazo de entrega
   maior que o do formato padrão — seria converter um direito de acessibilidade em desvantagem.

**Base legal.**

- [REF-LEI-13146-2015-acessibilidade] LBI art. 62: _"É assegurado à pessoa com deficiência, mediante
  solicitação, o recebimento de contas, boletos, recibos, extratos e cobranças de tributos em formato
  acessível."_
- [REF-LEI-13146-2015-acessibilidade] LBI art. 63 e Decreto 5.296/2004 art. 47: obrigação geral de
  acessibilidade do sítio — ver [RN-PORTAL-113]; o art. 62 é a especialização dela para o documento
  de cobrança.
- [REF-CONTRAN-918] art. 24: os órgãos estaduais _"deverão utilizar o documento próprio de
  arrecadação de multas de trânsito estabelecido pelo órgão máximo executivo de trânsito da União"_ —
  o **leiaute** do documento é padronizado nacionalmente, o que limita a liberdade do PORTAL de
  redesenhá-lo (ver Controvérsia).
- [REF-LEI-13460-2017] art. 5º, XIV: linguagem simples e compreensível — aplicável também ao texto da
  cobrança, e não só às telas de processo.

**Verificação.** (a) O perfil do usuário guarda `formato_acessivel_documentos: bool`, respeitado por
todo emissor de documento financeiro do PORTAL. (b) Quando ativo, além do documento padrão o PORTAL
entrega uma versão em texto estruturado, testada com leitor de tela, contendo no mínimo: identificação
do débito (AIT/serviço), valor a pagar, data de vencimento, linha digitável e a informação de qual
faixa de desconto está aplicada ([RN-PORTAL-128]). (c) Teste de igualdade: o tempo entre a solicitação
e a disponibilização é o mesmo nos dois formatos, e o valor cobrado é idêntico.

**Controvérsia/risco.** O art. 24 da Res. 918/2022 impõe o **documento próprio de arrecadação
estabelecido pelo órgão máximo executivo de trânsito da União**, cujo leiaute o DETRAN-AM não define
— e o PORTAL não pode substituí-lo, porque é ele que garante o repasse automático ao FUNSET. A leitura
harmônica é que a versão acessível **acompanha** o documento padronizado como representação
alternativa do seu conteúdo, sem substituí-lo para fins de arrecadação: o cidadão paga pelo documento
oficial, e lê pela versão acessível. Não foi localizada norma que trate expressamente da versão
acessível do documento de arrecadação de trânsito — é lacuna normativa, e a solução acima é
interpretação prudencial, não texto. Ver `_intake/legal-assessment.md`.
