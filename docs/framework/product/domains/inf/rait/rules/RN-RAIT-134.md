---
id: RN-RAIT-134
title: Dado sensível revelado incidentalmente na exposição de fatos — o RAIT não tem campo estruturado que o isole, ao contrário do BOAT e do PEC
status: draft
apps: [rait, portal]
sources: [REF-LEI-13709-2018, REF-CONTRAN-900]
updated: 2026-08-26
---

**Regra.** O BOAT isola dado de saúde em campos estruturados próprios (`severity`,
`hospital_destination` — [RN-BOAT-003]) e o PEC faz o mesmo com resultado clínico e biométrico
(`medical_result` — [RN-PEC-150]): a estrutura do dado já sinaliza sensibilidade antes de qualquer
conteúdo ser lido. O RAIT **não tem esse recurso**: o campo central do requerimento é texto livre —
_"exposição de fatos e fundamentos"_ ([RN-RAIT-002]) — e nada impede, nem hoje orienta, o
requerente a relatar espontaneamente uma condição de saúde, deficiência ou outro dado sensível
como parte da narrativa de defesa ("não vi a placa porque tenho baixa visão"; "estava a caminho do
hospital com meu filho"). A LGPD não distingue entre dado sensível **coletado por desenho** e dado
sensível **revelado por acidente de narrativa** — o regime de proteção incide igualmente sobre
os dois.

**Base legal.**

- [REF-LEI-13709-2018] art. 11, § 1º: _"Aplica-se o disposto neste artigo a qualquer tratamento de
  dados pessoais que revele dados pessoais sensíveis e que possa causar dano ao titular,
  ressalvado o disposto em legislação específica."_ — o gatilho é o efeito de revelar, não a
  intenção do campo.
- [REF-LEI-13709-2018] art. 5º, II: dado referente à saúde, deficiência, convicção religiosa,
  filiação sindical, entre outros, é sensível independentemente do formato em que aparece.
- [REF-LEI-13709-2018] art. 6º, III: princípio da necessidade — _"limitação do tratamento ao
  mínimo necessário [...] com abrangência dos dados [...] proporcionais e não excessivos"_ —
  fundamento para **não estimular** a inclusão de dado sensível desnecessário no relato.

**Posição prudencial adotada (interpretação, não conclusão).**

1. **Hipótese aplicável, se e quando o dado sensível aparecer: art. 11, II, "d"** — exercício
   regular de direitos em processo administrativo. É a hipótese mais direta, porque é o próprio
   titular quem inclui o dado, voluntariamente, a serviço do seu próprio direito de defesa — cenário
   mais simples que o do BOAT (onde o titular sensível é um terceiro que não escolheu comunicar
   nada). Não é, porém, base para **coletar ativamente** esse tipo de dado — só para tratá-lo
   licitamente quando o próprio requerente o traz.
2. **O sistema não deve solicitar nem sugerir a inclusão de dado sensível.** O campo de exposição
   de fatos deve trazer instrução textual, no ponto de preenchimento, orientando o requerente a
   não incluir informação de saúde, dado médico ou outro dado sensível além do estritamente
   necessário para fundamentar a defesa — aplicação direta do princípio da necessidade (art. 6º,
   III) ao próprio desenho do formulário, não apenas ao que o órgão faz depois de receber o dado.
3. **Se o dado sensível estiver presente, o mesmo padrão de minimização de acesso do bloco
   BOAT/PEC deve se estender ao requerimento inteiro**, não só ao campo: acesso ao texto livre por
   analista/relator/colegiado segue sendo necessário à instrução do caso (o próprio conteúdo pode
   ser relevante ao mérito), mas cópias, exportações e exibição em telas de terceiros (ex.
   dashboard de acompanhamento) devem tratar o requerimento como potencialmente sensível até
   triagem em contrário — mesma lógica de acesso excepcional justificado de [RN-BOAT-124].

**Verificação.** (a) O formulário de defesa/recurso do PORTAL exibe, junto ao campo de texto
livre, instrução de não inclusão de dado sensível desnecessário. (b) Nenhuma tela de listagem/fila
(worklist, dashboard) exibe o texto integral da exposição de fatos fora do contexto de instrução
do caso específico — evita exposição incidental em telas de gestão que não precisam do conteúdo.
(c) Não há, hoje, mecanismo de detecção ou triagem de dado sensível dentro do texto — greenfield,
não implementado.

**Controvérsia/risco.** _Severidade: MÉDIA-ALTA._ É o achado mais específico do RAIT nesta
avaliação, sem precedente direto no bloco BOAT/PEC: lá, a decisão de tratar dado sensível é do
órgão, que desenha o campo; aqui, a decisão de **revelar** é do cidadão, em campo que o órgão nem
pretendia usar para isso. Perguntas em aberto para validação: (i) instrução textual no formulário é
suficiente, ou o produto precisa de triagem ativa (humana ou automatizada) do conteúdo antes de
qualquer exposição em tela de terceiro?; (ii) se a triagem for automatizada, ela própria vira
tratamento adicional de dado potencialmente sensível, e precisa de base legal e de revisão humana
consistente com [RN-PORTAL-122]. Não decidido nesta rodada — proposta de trabalho registrada em
`_meta/open-issues.md` (DT-052). Ver `_meta/lgpd-assessment.md` §RAIT.
