---
id: JRN-RAIT-003
title: Secretaria recebe defesa/recurso por três canais e entrega um único caso digital
status: draft
apps: [rait, portal]
sources: [REF-CONTRAN-900, REF-DETRANAM-SERVICOS, REF-CETRAN-PROCESSO-INTERNO]
updated: 2026-08-24
---

## Persona e contexto

Elis trabalha na secretaria/protocolo do RAIT. Hoje, na operação real do DETRAN-AM, um requerimento
pode chegar de três formas muito diferentes: pelo Protocolo Virtual do Estado (digital), pelos
Correios (carta registrada), ou no balcão físico (Av. Mário Ypiranga 2884) — [REF-DETRANAM-SERVICOS].
O problema que a Elis de hoje enfrenta (fora do RAIT) é que cada canal vira um objeto diferente:
PDF anexado, carta em papel, formulário preenchido à mão no balcão. O RAIT precisa apagar essa
diferença assim que o caso entra — não empurrá-la fila abaixo para o analista.

## Narrativa ponta-a-ponta

1. **Canal digital (Protocolo Virtual / PORTAL).** Já chega estruturado: campos mínimos do
   [RN-RAIT-002] validados na origem, um AIT por requerimento, anexos identificados. Elis não toca
   nesse caso — ele entra direto na fila de triagem do RAIT.
2. **Canal postal (Correios).** A data de postagem, não a de chegada, conta para tempestividade
   ([REF-CONTRAN-900] art.6º) — Elis registra a data do carimbo dos Correios explicitamente no
   sistema, porque essa é a data que o motor de prazos ([RN-RAIT-005]) vai usar; a data de "recebido
   na secretaria" é só metadado operacional, nunca o campo que decide prazo.
3. **Canal balcão.** O requerente traz papel. Aqui está a decisão de desenho central desta jornada,
   inspirada no modelo CETRAN-SP ([REF-CETRAN-PROCESSO-INTERNO]): **a obrigação de digitalizar é do
   órgão, não do cidadão.** Elis digitaliza na hora (scanner do balcão) e cadastra o caso no RAIT como
   qualquer outro — a partir desse ponto, o processo tramita 100% digital, mesmo tendo nascido em
   papel. O papel original vai para custódia física, mas deixa de ser o "processo de trabalho".
4. **Verificação de representação.** Quando há procuração, Elis confere se é reconhecimento por
   autenticidade feito no próprio balcão (suficiente por [REF-DETRANAM-PORTARIA-5046] art.2º §2º —
   não exige cartório) — ela não pede ao cidadão nenhum passo cartorial extra que a norma local não
   exige.
5. **Handoff único.** Independente do canal de origem, o caso que chega à fila do analista
   ([JRN-RAIT-001]) tem a mesma forma: mesmos campos, mesmo checklist de anexos, mesmo dossiê digital.
   O analista nunca precisa saber "isso veio do balcão" para trabalhar diferente.
6. **Ponto cego assumido.** Se o balcão físico ainda usa formulário PDF impresso (prática atual
   registrada em [REF-DETRANAM-SERVICOS] para defesa prévia), a digitalização de Elis é o ponto exato
   onde esse atrito para de se propagar — anti-padrão a evitar é deixar o PDF escaneado circular como
   "o processo" dentro do RAIT.

## Pontos de contato (apps/canais)

RAIT (cadastro/digitalização, triagem). PORTAL (canal digital direto, sem intervenção da secretaria).
Protocolo Virtual do Estado e Correios (canais externos ao ecossistema, cuja saída alimenta o RAIT).

## Métricas de sucesso

100% dos casos, independente do canal de entrada, chegando ao analista no mesmo formato digital;
zero re-solicitação de documento por causa do canal de origem; tempo entre chegada física e
digitalização; % de casos com data de tempestividade corretamente atribuída por canal (postagem vs.
protocolo vs. balcão).
