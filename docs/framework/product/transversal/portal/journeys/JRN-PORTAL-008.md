---
id: JRN-PORTAL-008
title: Candidato consulta o resultado do exame de aptidão — "apto com restrições" explicado, nunca renomeado
status: draft
apps: [portal, pec]
sources:
  [REF-CONTRAN-927-2022, REF-DETRANAM-PORTARIA-005-2021, REF-LEI-14063-2020]
updated: 2026-08-24
---

## Persona e contexto

Elza fez os exames médico e psicológico para renovar a CNH categoria B. Ela está ansiosa porque usa
óculos de grau alto e teme "reprovar". O resultado sai do PEC (prontuário clínico), mas o lugar onde
ela vai lê-lo é o PORTAL — esta jornada é a ponte entre os dois apps, e herda integralmente a
doutrina de vocabulário e mascaramento já fixada em `ch/pec/_intake/ux-notes.md` §c/§d: **traduzir
o rótulo legal, nunca renomeá-lo ou inventar um termo de produto novo**.

## Narrativa ponta-a-ponta

1. **O resultado usa o rótulo legal federal, sempre — nunca o nome interno do schema.** Se o exame
   deu "apto com restrições", é exatamente isso que Elza lê — nunca "condicionado" (nome interno do
   campo `medical_result` do PEC) e nunca "pendente" (nomenclatura estadual da Portaria DETRAN-AM
   005/2021 art.34 §9º, cujo significado exato ainda não tem confirmação jurídica suficiente para
   aparecer a candidato — [ch/pec/_intake/ux-notes.md] §c). A tela nunca inventa um rótulo de produto
   que pareça mais amigável — traduz o rótulo legal para linguagem simples, mas preserva o termo.
2. **Explicação vem junto, no mesmo lugar, não como link para outra página.** "Apto com restrições"
   aparece com a explicação ao lado: "você pode dirigir; uma condição específica (ex.: uso de
   lentes corretivas) vai constar na sua CNH." O significado exato do código de restrição vem do
   Anexo XV da Resolução 927/2022 — se esse anexo não estiver disponível na base de conhecimento
   usada pelo produto, a tela não inventa a explicação do código específico; mostra o texto genérico
   e direciona para o canal humano certo, em vez de arriscar uma explicação incorreta.
3. **Nenhum resultado em lista pública ou compartilhada — só no acesso privado de Elza.** O resultado
   nunca aparece num painel, notificação com prévia visível na tela de bloqueio, ou qualquer lugar que
   outra pessoa possa ver por cima do ombro — mesmo princípio de "nenhum resultado em painel
   público/monitor compartilhado" já fixado em [ch/pec/_intake/ux-notes.md] §b, estendido à
   experiência do PORTAL (notificação neutra, "seu resultado está disponível", conteúdo só dentro do
   app autenticado).
4. **Entrevista devolutiva — o momento humano, sempre oferecido, nunca escondido.** Se o resultado
   não é "apto" simples, a tela oferece diretamente o caminho para solicitar a entrevista devolutiva
   com o profissional que avaliou ([REF-CFP-01-2019] art.2º §22, herdado pelo PEC) — um botão de
   primeira classe, não um link de rodapé; o momento de entender o resultado com um humano não deveria
   ter mais fricção do que o resto do fluxo.
5. **Se inapto (ou inapto temporário), o próximo passo já está na tela.** "Inapto temporário" mostra
   o prazo registrado no RENACH para nova avaliação, com a explicação de que o motivo é considerado
   tratável — nunca como um beco sem saída. "Inapto" explica que a via administrativa seguinte é
   solicitar Junta Médica/Psicológica dentro do prazo de recurso aplicável — a mesma decisão informada
   de exercer ou não esse direito, sem jargão de processo cru (ver [JRN-PEC-002]/[JRN-PEC-005] para o
   desenho completo do lado da junta, referenciado aqui como ponte, não repetido).
6. **Nada de contador de pressão, nada de prazo inventado.** Se existe prazo legal confirmado (ex.:
   validade reduzida de "apto com comprometimento sob controle"), ele aparece; se não existe base
   normativa para um prazo, a tela não inventa um — mesmo anti-padrão já fixado no PEC (item 11 dos
   anti-padrões de `ch/pec/_intake/ux-notes.md`).

## Pontos de contato (apps/canais)

PORTAL (tela de resultado, solicitação de entrevista devolutiva, ponte para junta). PEC (fonte do
dado clínico, mascarado por padrão para todo papel exceto o próprio titular — [ch/pec/_intake/
ux-notes.md] §d.2, que já trata "o candidato vendo o próprio dossiê" como a exceção confirmatória à
regra de mascaramento).

## Métricas de sucesso

Zero rótulo interno de schema (`CONDICIONADO`, "PENDENTE" não confirmado) exposto a candidato; % de
candidatos com resultado não-apto que usam o botão de entrevista devolutiva sem precisar ligar para
o órgão; zero resultado clínico visível em notificação de tela de bloqueio ou lugar compartilhado;
zero prazo exibido sem base normativa confirmada.
