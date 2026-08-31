---
id: JRN-PORTAL-010
title: Cidadão paga a multa com desconto sem perder o direito de recorrer
status: draft
apps: [portal, rait]
sources: [REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-08-24
---

## Persona e contexto

Adelson quer o carro liberado logo (financiamento, revenda) mas também acha que a multa está errada
e quer recorrer. Ele hesita: "se eu pagar agora, perco o direito de contestar?" A resposta legal é
não — o pagamento antecipado, distinto do desconto de 40% de [JRN-PORTAL-005] (que exige declarar
que não vai recorrer), pode ser feito **sem prejuízo da continuidade do processo**
([REF-CONTRAN-918] art.33) — mas essa distinção nunca aparece clara nas telas de pagamento comuns, e
é exatamente o que esta jornada precisa deixar evidente.

## Narrativa ponta-a-ponta

1. **Duas ofertas de pagamento, nunca confundidas na mesma tela.** Quando Adelson escolhe "pagar", o
   PORTAL sempre separa visualmente duas ofertas distintas: (a) "pagar por 80%, mantendo o direito de
   defender-se/recorrer" (art.284 caput/ [REF-CONTRAN-918] art.20) — o caminho de Adelson; (b) "pagar
   por 60%, reconhecendo a infração e abrindo mão do recurso" ([JRN-PORTAL-005]). O botão de Adelson
   não pode estar rotulado apenas "pagar", ambíguo entre os dois — precisa dizer explicitamente
   "pagar sem abrir mão do recurso".
2. **Confirmação explícita antes de processar.** Antes de finalizar, a tela confirma em uma frase:
   "Você está pagando esta multa agora. Isso não impede você de continuar se defendendo ou recorrendo
   — o processo continua normalmente" ([REF-CONTRAN-918] art.33, caput). Nenhuma letra miúda faz esse
   trabalho — é a frase principal da tela de confirmação.
3. **O comprovante reflete a mesma garantia, para reter e para provar depois.** O comprovante de
   pagamento antecipado mostra o texto de que o processo continua e, quando aplicável, a data-limite
   para o recurso — mesmo padrão do art.33 §ú, que determina que a NP expedida depois de pagamento
   antecipado venha "com a indicação do prazo para interposição do recurso e sem código de barras
   para pagamento" (porque já está pago). O PORTAL espelha essa mesma clareza na tela digital: uma NP
   que chega depois mostrando só o prazo de recurso, nunca um boleto residual confuso de algo já
   quitado.
4. **Se o recurso é provido depois, a restituição é automática de anunciar, não um segredo a
   descobrir.** A mesma tela de pagamento antecipado já planta a expectativa correta: "Se seu recurso
   for aceito depois, o valor pago será devolvido, corrigido" ([REF-CTB-extracts-raw] art.286 §2º) —
   Adelson sabe disso antes de pagar, não descobre por acaso meses depois. Esta é a mesma garantia já
   modelada em [JRN-PORTAL-003] passo 4 para quem paga e depois tem a multa cancelada; aqui ela é
   mostrada de forma proativa, no momento da decisão de pagar, não só no momento do resultado.
5. **Continuar o recurso depois de já ter pago é o mesmo wizard, sem gambiarra.** Se Adelson decide
   seguir com a defesa/recurso depois de já ter pago, o wizard de [JRN-PORTAL-001] funciona
   normalmente — o sistema não trata "já pago" como um estado que bloqueia ou complica a interposição;
   a garantia legal do art.33 precisa ser real no produto, não só na letra da tela.
6. **Meio de pagamento é uma escolha à parte, sem hierarquia de recomendação enviesada.** Cartão de
   crédito/débito em parcelas conforme o plano comercial da credenciadora — sem teto normativo
   fixado pela [REF-CONTRAN-918] art. 27 — e demais meios do SPB
   aparecem como opções equivalentes — o PORTAL não empurra Adelson para um meio específico com
   destaque visual desproporcional; a escolha é dele.

## Pontos de contato (apps/canais)

PORTAL (tela de pagamento, comprovante, ponte para o wizard de recurso). RAIT (registra pagamento
antecipado sem encerrar o processo; gera restituição se provido). Meio de pagamento (cartão/SPB,
fora do sistema).

## Métricas de sucesso

Zero relato de "achei que perderia o direito de recorrer ao pagar"; % de pagamentos antecipados
seguidos de interposição de defesa/recurso sem erro no fluxo; % de restituições processadas sem o
cidadão precisar abrir chamado à parte (mesma métrica de [JRN-PORTAL-003]); zero confusão entre a
oferta de 80% (mantém recurso) e a de 60% (abre mão do recurso) medida por contato de suporte.
