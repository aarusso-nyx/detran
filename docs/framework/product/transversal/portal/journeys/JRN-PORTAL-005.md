---
id: JRN-PORTAL-005
title: Cidadão adere ao SNE entendendo a troca — desconto maior custa o direito de recorrer, decisão reversível a tempo
status: draft
apps: [portal, rait]
sources: [REF-CONTRAN-931, REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-08-24
---

## Persona e contexto

Dona Raimunda tem uma Kombi que usa para o próprio comércio. Recebeu uma multa e, no PORTAL, viu a
oferta de "pagar com 40% de desconto". Ela não percebeu, à primeira vista, que esse desconto maior
tem uma condição embutida: só existe se ela declarar, pelo SNE, que **não vai apresentar defesa nem
recurso** — reconhecendo a infração ([REF-CTB-extracts-raw] art.284 §1º; [REF-CONTRAN-918] art.21).
É uma decisão real, não um simples "clique aqui para pagar menos" — e esta jornada existe porque
essa distinção é exatamente o tipo de coisa que se perde em letra miúda.

## Narrativa ponta-a-ponta

1. **Dois desabafos que uma tela de SNE precisa separar.** "Aderir ao SNE" (passar a receber
   notificações eletronicamente, [REF-CONTRAN-931] art.2º/art.7º) e "declarar que não vai recorrer
   para pagar com 40% de desconto" ([REF-CTB-extracts-raw] art.284 §1º) são **duas decisões
   diferentes**, frequentemente confundidas na comunicação atual. O PORTAL trata a adesão ao SNE em
   si — passar a receber notificações digitais — como um ato neutro e reversível, sem nenhuma
   implicação sobre direito de recurso; só quando Raimunda, dentro de uma multa específica, escolhe
   pagar pelo valor com 40% de desconto é que a tela mostra a troca real.
2. **A troca, mostrada antes do clique, não depois.** Ao escolher "pagar com 40% de desconto", a
   tela intercepta com uma comparação lado a lado, nunca escondida atrás de termos de uso: "Pagar
   agora por 60% do valor — você declara que não vai se defender nem recorrer desta multa" ao lado de
   "Pagar até o vencimento por 80% do valor — você mantém o direito de se defender ou recorrer". Nenhum
   dos dois caminhos é pré-selecionado ou visualmente favorecido; a decisão é de Raimunda, informada.
3. **A adesão prévia como pré-condição, explicada, não escondida.** O desconto de 40% só existe se a
   adesão ao SNE tiver sido feita **antes do envio da notificação de autuação** ([REF-CTB-
   extracts-raw] art.284 §1º, "desde que a adesão [...] seja realizada antes do correspondente envio
   da notificação"). Se Raimunda ainda não tinha aderido quando a multa foi expedida, a tela explica
   isso diretamente ("Essa opção não está disponível para esta multa porque você ainda não era
   aderente ao SNE quando ela foi expedida — para as próximas multas, já vale") em vez de simplesmente
   omitir o botão sem explicação.
4. **Reversível a tempo, e a tela diz isso.** Enquanto o prazo de defesa/recurso da multa específica
   não venceu, a decisão de pagar com 40% de desconto ainda não foi tomada — Raimunda pode mudar de
   ideia e optar por defender-se em vez de pagar, até o momento em que efetivamente confirma o
   pagamento. A adesão ao SNE em si é cancelável a qualquer momento por livre iniciativa
   ([REF-CONTRAN-931] art.8º, I) — o PORTAL mostra essa saída como uma opção de configuração normal,
   nunca como algo escondido ou de efeito ambíguo sobre notificações já recebidas (as anteriores
   continuam válidas — art.8º §2º).
5. **Consequência do pagamento com 40% — dita sem ambiguidade.** Depois de confirmado, a tela deixa
   claro: "Esta multa está paga e encerrada. Você reconheceu a infração — não é mais possível
   defender-se ou recorrer dela." Nenhuma linguagem que sugira reversibilidade que não existe mais
   depois deste ponto.
6. **O que muda no dia a dia depois de aderir.** A partir da adesão, novas autuações chegam a
   Raimunda pelo canal eletrônico, com ciência contada 30 dias após disponibilização e envio — nunca
   da leitura ([REF-CONTRAN-931] art.4º §6º; mesmo princípio já em `_intake/ux-notes.md` §c). O
   PORTAL reforça essa regra sempre que uma nova notificação chega, não só uma vez no cadastro.
7. **Cadastro atualizado é responsabilidade dela, e o PORTAL lembra disso ativamente.** Como o SNE
   substitui qualquer outra forma de notificação ([REF-CONTRAN-931] art.4º §8º), o PORTAL pede
   confirmação periódica de e-mail/celular de contato (§§4º-5º), em vez de assumir silenciosamente
   que um cadastro de anos atrás ainda está correto.

## Pontos de contato (apps/canais)

PORTAL (adesão, configuração de contato, decisão de pagamento por multa). RAIT (recebe a declaração
de não-recurso, gera a NP sem código de barras equivalente quando aplicável — ver [REF-CONTRAN-918]
art.33 §ú, reaproveitado em [JRN-PORTAL-010]). SNE (canal de notificação em si).

## Métricas de sucesso

Zero relato de "não sabia que pagar com 40% de desconto significava abrir mão do recurso"; % de
adesões ao SNE que não são seguidas, nos primeiros 30 dias, por um pedido de suporte confuso sobre
"por que não posso mais recorrer"; % de cadastros de contato confirmados como atualizados no último
ano; zero caso de desconto de 40% oferecido para multa cuja adesão ao SNE veio depois da expedição.
