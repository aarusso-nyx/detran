---
id: RN-PORTAL-118
title: O titular vê o próprio dado sem máscara — mascaramento é controle de acesso de terceiros, nunca do titular
status: draft
apps: [portal, rait, boat, pec, teat]
sources: [REF-LEI-13709-2018, REF-LEI-9784-1999, REF-LEI-13460-2017]
updated: 2026-08-24
---

**Regra.** Mascaramento (`***`, truncamento de CPF, ocultação de endereço, supressão de campo) é uma
técnica de **proteção contra terceiros**. Aplicada ao próprio titular, ela não protege ninguém: apenas
frustra o direito de acesso e degrada a qualidade do dado, porque impede o titular de **perceber e
pedir a correção** do erro. Portanto:

1. **Sessão autenticada do titular exibe o dado do titular por inteiro.** CPF completo, endereço
   completo, dados da CNH, pontuação, histórico de infrações, peças do processo — sem máscara.
2. **Máscara é decidida pela relação entre quem olha e de quem é o dado**, nunca pela sensibilidade
   do campo em abstrato. O mesmo campo é aberto para o titular e mascarado para um terceiro
   interessado no mesmo processo.
3. **A única supressão legítima na vista do titular é o dado de terceiro** — e é supressão de
   **campo**, não de documento inteiro ([RN-PORTAL-112], [RN-BOAT-126]).
4. **A regra não afrouxa a segurança de acesso.** Ela pressupõe autenticação forte e auditoria: quanto
   mais aberto o dado na sessão do titular, mais rigorosos o controle de identidade
   ([RN-PORTAL-101]), o registro do acesso e a proteção contra sequestro de sessão.
5. **A regra não vale para o operador do órgão.** O servidor que analisa um processo continua sujeito
   à minimização — o padrão de acesso excepcional justificado de [RN-BOAT-124] e [RN-TEAT-142]
   permanece intacto. Titular e agente público são regimes diferentes, e confundi-los é o erro que
   esta regra existe para evitar.

**Base legal.**

- [REF-LEI-13709-2018] art. 18, II: direito do titular a _"acesso aos dados"_ — sem qualificação
  restritiva; III: direito a _"correção de dados incompletos, inexatos ou desatualizados"_, que
  pressupõe a possibilidade material de conferi-los.
- [REF-LEI-13709-2018] art. 19: _"A confirmação de existência ou o acesso a dados pessoais serão
  providenciados, mediante requisição do titular: I - em formato simplificado, imediatamente; ou II -
  por meio de declaração clara e completa, que indique a origem dos dados, a inexistência de registro,
  os critérios utilizados e a finalidade do tratamento [...]"_; § 1º: _"Os dados pessoais serão
  armazenados em formato que favoreça o exercício do direito de acesso."_
- [REF-LEI-13709-2018] art. 6º, V: princípio da _"qualidade dos dados"_ — exatidão, clareza,
  relevância e atualização; o titular é o verificador mais eficiente dessa qualidade, e mascará-lo é
  trabalhar contra o princípio.
- [REF-LEI-9784-1999] art. 46: vista do processo e cópias, _"ressalvados os dados e documentos de
  **terceiros** protegidos por sigilo ou pelo direito à privacidade, à honra e à imagem"_ — a ressalva
  é expressamente sobre terceiros, e não sobre o próprio interessado.
- [REF-LEI-13460-2017] art. 5º, IV: vedação de restrições não previstas na legislação — mascarar o
  dado do titular é restrição sem previsão.

**Verificação.** (a) A camada de apresentação recebe o par (`sujeito_da_sessao`, `titular_do_dado`) e
só aplica máscara quando forem distintos; máscara aplicada por tipo de campo, sem consultar essa
relação, é bug. (b) Teste de regressão obrigatório por serviço: o titular autenticado enxerga cada um
dos seus campos por extenso. (c) Toda supressão exibida ao titular carrega motivo visível ("informação
de outra pessoa envolvida") — supressão silenciosa é indistinguível de erro de sistema e destrói a
confiança na completude do que se vê. (d) Acesso do titular ao próprio dado **é registrado** como
evento de tratamento (art. 37), como qualquer outro acesso.

**Delta frente ao bloco [RN-BOAT-122] a [RN-BOAT-129].** Aquele bloco resolve o problema do **dado
sensível de terceiro** (vítima de sinistro) sob a ótica do órgão controlador. Esta regra resolve o
problema simétrico e distinto: o **acesso do próprio titular**. Não há conflito — [RN-BOAT-126] já
aponta o portal como canal natural de exercício dos direitos, e a solução de trabalho lá adotada
(fornecer o registro com supressão dos campos de saúde de terceiros, sem negar o registro inteiro) é
exatamente a aplicação conjunta das duas regras.

**Controvérsia/risco.** (a) O caso limite é o **coautor ou corresponsável**: no registro de sinistro,
na indicação de condutor e na infração com responsabilidade solidária, os dados de duas pessoas se
entrelaçam no mesmo documento, e a linha entre "meu dado" e "dado do outro" não é sempre nítida — o
nome do outro condutor é dado dele, mas o fato de ele ter sido indicado por mim é fato do meu
processo. A regra prática proposta: **dado identificador de terceiro** (documento, endereço, telefone,
dado de saúde) é suprimido; **fato processual** que envolve o terceiro permanece visível ao
interessado, porque integra o próprio processo e é pressuposto do contraditório. É interpretação
prudencial, não texto expresso. (b) Superfície de ataque: a regra concentra dado completo numa tela
autenticada, o que aumenta o impacto de um comprometimento de conta. A mitigação é o par
autenticação forte + auditoria de acesso, e é por isso que ela não pode ser implementada sem
[RN-PORTAL-101] e sem o registro de operações do art. 37. Item 5 de `_intake/legal-assessment.md`.
