---
id: JRN-PORTAL-001
title: Condutor/proprietário recorre de uma multa até a decisão final
status: draft
apps: [portal, rait]
sources:
  [
    REF-CONTRAN-900,
    REF-CONTRAN-918,
    REF-CONTRAN-931,
    REF-CTB-extracts-raw,
    REF-BENCH-ESTADOS,
    REF-DECRETO-10543-2020,
    REF-LEI-14129-2021,
    REF-LEI-13460-2017,
  ]
updated: 2026-08-24
---

## Nota de revisão (rodada UX transversal, 2026-08-24)

Revisão a partir do `research-dossier.md` desta rodada. Três acréscimos, doutrina preservada:
(1) o passo 2 agora nomeia o **nível de assinatura eletrônica** exigido para protocolar defesa/
recurso — **avançada**, por força expressa do [REF-DECRETO-10543-2020] art. 4º, II, "h" — e
desenha a elevação de nível de conta como um **momento guiado dentro do próprio wizard**, nunca
como um muro que interrompe a tarefa em curso; (2) a regra de "nunca pedir documento que o órgão
já tem" ganha uma segunda âncora, mais forte: [REF-LEI-14129-2021] art. 3º, XIII e art. 26
(presunção de autenticidade de documento assinado eletronicamente) elevam o princípio de "boa
prática" para "provável dever estatutário" — **condicionado a confirmação de que o Amazonas aderiu
formalmente à Lei 14.129/2021** (gap ainda aberto, ver dossiê §1); enquanto não confirmado, tratar
como parâmetro fortemente recomendável, nunca anunciar ao cidadão como garantia legal fechada; (3)
o passo 1 explicita que **apenas consultar** a autuação não exige elevação alguma — nível de conta
básico (bronze) já basta, e isso deveria ser óbvio para Maria desde a primeira tela, sem qualquer
sugestão de que ela precisa "verificar a identidade" só para olhar o que a autuação diz.

## Persona e contexto

Maria, proprietária e condutora, recebeu a Notificação de Autuação de um AIT lavrado em fiscalização.
Ela acredita que a sinalização estava encoberta e quer contestar sem ir ao balcão. Ela não sabe o
jargão do processo administrativo — "defesa prévia", "NP", "JARI" não significam nada para ela na
primeira visita; o PORTAL precisa carregar esse vocabulário para ela aos poucos, no momento certo,
nunca de uma vez.

## Narrativa ponta-a-ponta

1. **Ciência — sem elevação de identidade exigida.** Maria entra no PORTAL (gov.br) só com login
   básico (conta nível bronze já basta para consultar) e vê a autuação com status em linguagem
   simples ("Você pode se defender até DD/MM" em vez de "prazo de defesa prévia" cru — [REF-
   CONTRAN-918] art.4 §2º) e três caminhos igualmente visíveis, sem viés visual para "pagar":
   defender-se, indicar outro condutor, ou pagar com desconto. A escolha de valores já aparece lado a
   lado — 80% pagando até o vencimento, 60% se reconhecer a infração e aderir ao SNE ([REF-CONTRAN-931]
   art.9º §1º; [REF-CTB-extracts-raw] art.284 §1º) — como uma decisão explícita e reversível-a-tempo,
   não como desconto escondido em letra miúda. Nada nesta tela pede confirmação de identidade além do
   login já feito.
2. **Defesa da autuação (1º circuito) — a elevação de nível como passo guiado, não muro.** Ela
   preenche o requerimento guiado (campos mínimos do [REF-CONTRAN-900] art.3º — um AIT por
   requerimento), anexa fotos e CNH (checklist art.5º; o PORTAL nunca pede documento emitido pelo
   próprio órgão — art.5º §ú, reforçado por [REF-LEI-14129-2021] art.3º XIII, condicionado à
   confirmação de adesão do AM à lei — ver nota de revisão). Só no momento de assinar e protocolar o
   PORTAL confirma o nível da conta de Maria: protocolar defesa/recurso exige **assinatura eletrônica
   avançada**, por determinação expressa do [REF-DECRETO-10543-2020] art.4º, II, "h". Se a conta de
   Maria estiver em nível básico, a tela não a manda para um fluxo genérico de "verificação de
   identidade" à parte — o próprio wizard explica, no ponto exato em que ela precisaria disso ("para
   assinar seu recurso você precisa confirmar sua identidade com um passo a mais — leva menos de dois
   minutos"), e a leva por um passo de validação biográfica ou biométrica embutido na mesma tela (art.
   5º, II do mesmo Decreto), sem perder o que já preencheu. Documentos enviados por upload assinado
   eletronicamente têm presunção de autenticidade ([REF-LEI-14129-2021] art.26) e nunca exigem
   reconhecimento de firma, salvo dúvida fundada ([REF-LEI-13460-2017] art.5º, IX). Ao concluir, Maria
   assina e protocola eletronicamente (art.6º §4º da 900). Recebe protocolo e acompanha o andamento
   com status em linguagem cidadã (ver ux-notes, mapa de estados).
3. **Bastidores (RAIT).** O caso entra na fila de defesa; um analista faz o juízo de admissibilidade
   ([RN-RAIT-001]) e a autoridade julga o mérito (918 art.9º) — ver [JRN-RAIT-001]. Se precisar de
   mais provas, o RAIT abre diligência com prazo (900 art.9º) e Maria é notificada no PORTAL com prazo
   próprio para responder, claramente distinto do prazo de julgamento do órgão.
4. **Resultado da defesa.** Acolhida → AIT cancelado, nada a pagar (918 art.9 §1º) — jornada encerra
   com uma tela de encerramento clara ("Multa cancelada. Nada a pagar."), não um status genérico.
   Indeferida → penalidade aplicada; Maria recebe a NP com a data-limite que vale ao mesmo tempo para
   pagar com desconto ou recorrer (918 art.12) — o PORTAL explicita que é a MESMA data para as duas
   ações, risco real de confusão se apresentado como dois prazos.
5. **Recurso à JARI (2º circuito — efeito suspensivo automático).** Maria interpõe recurso no PORTAL
   até o vencimento da NP; o recurso tem efeito suspensivo automático por lei ([REF-CTB-extracts-raw]
   art.285 _caput_) — o PORTAL mostra isso de forma proativa e visível ("Sem restrição no seu veículo
   enquanto o recurso tramita" — 918 art.13), inspirado no diferencial de confiança do modelo PR
   ([REF-BENCH-ESTADOS]), em vez de deixar Maria descobrir isso por conta própria ou temer bloqueio.
   Ela pode desistir por escrito até o julgamento (900 art.11) — ex.: para pagar com desconto SNE a
   qualquer momento antes da decisão.
6. **A espera — o prazo do cidadão já acabou, o prazo do órgão é outro.** Enquanto o recurso tramita,
   o PORTAL nunca mostra "24 meses" como se fosse o tempo normal de espera — esse é o teto legal de
   prescrição por inércia do órgão ([REF-CTB-extracts-raw] art.285 §6º, art.289-A), não uma expectativa
   de atendimento. O que Maria vê é o SLA operacional real do DETRAN-AM (30 dias úteis, meta interna —
   [REF-DETRANAM-SERVICOS]) e o andamento efetivo do caso.
7. **Julgamento colegiado.** A JARI julga em sessão — ver [JRN-RAIT-002]; Maria é informada da decisão
   no mesmo dia (918 art.17). Provido → multa cancelada (se a autoridade recorrer, ela é informada —
   art.17 §ú). Negado → ela pode recorrer ao CETRAN em 30 dias da publicação/notificação
   ([REF-CTB-extracts-raw] art.288).
8. **Segunda instância.** CETRAN decide em última instância administrativa ([REF-CTB-extracts-raw]
   art.290) — irrecorrível administrativamente. O RAIT já anexa de ofício o parecer e conclusão da
   JARI ao processo de 2ª instância — Maria nunca precisa reunir e reenviar documentos que o órgão já
   tem ([RN-RAIT-003]; achado de atrito em [REF-DETRANAM-SERVICOS]). Negado → multa consolidada, juros
   contam apenas do encerramento da instância (918 art.23 §4º); pontuação vai ao RENACH só agora (918
   art.18). Provido → multa cancelada; se já paga, restituição corrigida ([REF-CTB-extracts-raw] art.
   286 §2º).

## Pontos de contato

PORTAL (web/mobile) — consulta, interposição, anexos, acompanhamento, notificações, desistência,
adesão ao SNE. RAIT — todo o processamento interno ([JRN-RAIT-001], [JRN-RAIT-002]). SNE — adesão e
desconto de 60%. DASHBOARD — prazos e filas.

## Métricas de sucesso

Protocolo 100% digital sem retrabalho; zero perda de prazo por notificação; tempo mediano de decisão
por circuito; % processos com diligência; % decisões comunicadas no mesmo dia; % de cidadãos que
entendem, sem contato humano, a diferença entre "prazo para agir" e "prazo do órgão" (medido por
volume de contatos de dúvida sobre os 24 meses).
