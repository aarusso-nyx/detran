---
id: RN-BOAT-124
title: Minimização reforçada do dado sensível — validação em vez de dado bruto, e o problema do campo livre `health_notes`
status: draft
apps: [boat]
sources: [REF-SENATRAN-PORTARIA-139-2025, REF-LEI-13709-2018]
updated: 2026-08-24
---

**Regra.** Sobre o dado sensível incide um **duplo dever de minimização**: o princípio geral da
necessidade (LGPD art. 6º, III — _"limitação do tratamento ao mínimo necessário"_) e a regra
específica da Portaria SENATRAN 139/2025, que manda **evitar a inclusão de dado sensível**,
substituindo-o por outro que atenda à mesma finalidade, e — quando isso não for possível —
**priorizar a validação de dados**, autorizando o acesso ao **dado bruto sensível somente em caráter
excepcional**. Traduzido para o BOAT: a exibição padrão deve ser **derivada e mínima**; o dado bruto
de saúde exige ato deliberado, justificado e registrado.

**Base legal.**

- [REF-SENATRAN-PORTARIA-139-2025] art. 18: _"Os casos de uso que envolvam o acesso a dados pessoais
  sensíveis deverão observar as hipóteses legais de tratamento específicas definidas no art. 11, da
  Lei nº 13.709, de 2018. § 1º O requerente deve, sempre que possível, evitar a inclusão de dados
  pessoais sensíveis nos grupos de informação, substituindo-os por outros dados que atendam à mesma
  finalidade. § 2º Não sendo possível observar o disposto no § 1º, o atendimento à finalidade deverá
  ser priorizado pela **validação de dados**, com o acesso aos dados pessoais sensíveis brutos sendo
  autorizado **somente em caráter excepcional**."_
- [REF-SENATRAN-PORTARIA-139-2025] art. 6º, XIV (definição): _"validação de dados: método de
  confirmação de compatibilidade entre diferentes parâmetros de entrada com os dados dos sistemas
  [...], de forma a indicar a consistência das informações."_ — isto é: responder "confere/não
  confere", em vez de devolver o dado.
- [REF-SENATRAN-PORTARIA-139-2025] art. 23, § 2º: quando o requerimento contém dado sensível, a
  régua de maturidade em segurança da informação **sobe** — o que era satisfatório (nota 4) passa a
  regular, e só a nota 5 é satisfatória.
- [REF-LEI-13709-2018] art. 6º, III (necessidade) e art. 11, II (_"indispensável"_).

**Verificação.** Consequências de desenho, verificáveis:

1. **Visão padrão derivada.** Listagens, relatórios e telas de consulta exibem, por padrão,
   `severity` classificada e indicadores booleanos — **não** `hospital_destination` nem
   `health_notes`. O dado bruto exige um segundo passo explícito, com finalidade declarada e
   registro de acesso ([RN-BOAT-126]).
2. **Validação em vez de leitura.** Onde o objetivo for conferência — "esta vítima consta como
   fatal?" —, a resposta deve ser de compatibilidade, não a devolução do registro clínico.
3. **`health_notes` é o campo mais difícil de sustentar.** Texto livre sobre saúde de terceiro,
   preenchido em campo, sem vocabulário controlado, é justamente o oposto de "mínimo necessário" e
   de "indispensável" ([RN-BOAT-123]). Duas recomendações: **(a)** substituir por campos
   estruturados de finalidade delimitada (natureza da lesão em catálogo, parte do corpo, destino do
   atendimento), reservando texto livre para o que não couber; **(b)** se mantido, exibir orientação
   explícita ao agente de que ali **não** se registram diagnóstico, prontuário, histórico de saúde,
   estado de gravidez, HIV, uso de medicação ou qualquer dado clínico não indispensável ao registro
   do sinistro. É o mesmo problema de sobrecarga do campo Observações já identificado no TEAT
   ([RN-TEAT-109]), aqui com dado sensível dentro.
4. **`hospital_destination`** é dado sobre saúde (revela que houve atendimento e onde) — mas é
   também o elo operacional com o parceiro de saúde ([RN-BOAT-112]). Deve ser tratado como
   **referência institucional** (unidade de destino), nunca como campo de informação clínica.

**Controvérsia/risco.** A Portaria 139/2025 disciplina, em rigor, o **acesso aos sistemas da
SENATRAN** — não o registro local do DETRAN-AM. A extensão do seu art. 18 à coleta e ao acesso
internos do BOAT é **aplicação analógica deliberada**, adotada aqui por dois motivos: é o único
parâmetro normativo concreto de minimização de dado sensível em todo o ecossistema de trânsito, e
seria incoerente que o dado exigisse proteção máxima ao trafegar para a União e proteção indefinida
onde é coletado. A analogia é favorável ao titular e não restringe direito de ninguém — mas é
analogia, e está rotulada como tal.
