---
id: UC-PORTAL-007
title: Cidadão adere ao Sistema de Notificação Eletrônica (SNE)
status: reviewed
apps: [portal]
sources: [REF-CONTRAN-931, REF-CTB-extracts-raw, REF-DECRETO-10543-2020]
updated: 2026-08-26
---

## Revisão BPO (2026-08-24) — nível de assinatura e ponte para WF-PORTAL-003

Rodada CRAWLER (`_intake/research-dossier.md`) classifica a adesão ao SNE como ato de
**autocadastro** (Decreto 10.543/2020 art.4º, II, "d") — nível **simples a avançada**, dependendo do
grau de garantia de identidade que o DETRAN-AM decidir exigir na adesão (o efeito jurídico da
adesão, ciência ficta em 30 dias, recomenda o nível avançado). Ver matriz completa em
[WF-PORTAL-002]. O ciclo de vida da notificação em si (disponibilização, ciência ficta, retenção)
passou a ser modelado em [WF-PORTAL-003] — este UC descreve apenas o ato de adesão; o pós-adesão é
reuso por referência, não remodelado aqui.

## Ator e objetivo

Proprietário/condutor adere ao SNE para receber notificações eletronicamente e, caso opte por
reconhecer futuras infrações sem apresentar defesa nem recurso, pagar com o maior desconto disponível
(60% do valor — [REF-CONTRAN-931] art.9º §1º I; [REF-CTB-extracts-raw] art.284 §1º).

## Pré-condições

- Cidadão autenticado no PORTAL (gov.br).
- Cadastro com e-mail e celular válidos para recebimento de alertas ([REF-CONTRAN-931] art.4º §5º).

## Fluxo principal

1. Cidadão acessa "Adesão ao SNE" (disponível tanto em fluxo dedicado quanto como oferta contextual
   na tela de uma autuação — [REF-CONTRAN-931] art.7º permite adesão junto ao órgão executivo
   estadual ou "outros mecanismos", base legal para oferecer isso direto no PORTAL).
2. Sistema explica em linguagem direta o que muda: notificações passam a ser só digitais (o SNE é o
   único meio tecnológico hábil de notificação — art.2º § único); o prazo de ciência conta 30 dias
   após a disponibilização + envio, não da leitura efetiva (art.4º §6º) — cidadão precisa entender que
   "não abri o app" não pausa o prazo.
3. Sistema explica o efeito prático nos valores: reconhecer futura infração sem defesa/recurso dá 60%
   de desconto; manter a defesa/recurso facultativos mantém o desconto padrão de 80% até o vencimento
   (art.9º §1º I-II) — apresentado como comparação lado a lado, não como texto corrido.
4. Cidadão confirma a adesão; sistema registra e atualiza o cadastro (mantê-lo atualizado é dever do
   aderente — art.4º §4º).
5. Confirmação exibida com opção de cancelamento a qualquer momento (art.8º I).

## Fluxos alternativos / exceções

- **1a.** Cadastro sem e-mail/celular válidos: sistema bloqueia a adesão até completar o cadastro.
- **4a.** Cidadão cancela a adesão depois: notificações já disponibilizadas antes do cancelamento
  permanecem válidas para todos os efeitos (art.8º §2º) — sistema explicita isso na tela de
  cancelamento para não gerar falsa expectativa de "apagar" notificações passadas.
- **5a.** Venda/transferência do veículo após adesão: vínculo entre proprietário anterior e o veículo
  é cancelado automaticamente (art.8º §1º); cidadão é informado.

## Pós-condições

Cadastro com adesão ativa ao SNE; notificações futuras exclusivamente eletrônicas; desconto de 60%
disponível para reconhecimento de infração sem defesa/recurso, em qualquer fase até o vencimento.

## Critérios de aceitação

**AC-PORTAL-007-1 — a ciência ficta é explicada antes da adesão, não depois**

- **Dado** a tela de adesão ao SNE
- **Quando** é apresentada
- **Então** diz claramente que o prazo passa a contar **30 dias após a disponibilização**, e não
  da leitura — "não abri o aplicativo" não pausa nada ([RN-PORTAL-123], [RN-RAIT-124])

**AC-PORTAL-007-2 — os quatro efeitos da adesão são apresentados juntos**

- **Dado** o consentimento
- **Quando** é colhido
- **Então** os efeitos de [RN-PORTAL-123] aparecem lado a lado, não diluídos em texto corrido —
  consentimento informado exige que o cidadão veja o que muda

**AC-PORTAL-007-3 — desconto e defesa são decisões separadas**

- **Dado** as faixas de 80% e 60%
- **Quando** são comparadas
- **Então** a tela deixa explícito que a de 60% pressupõe reconhecer a infração sem defesa nem
  recurso ([RN-PORTAL-128]) — aderir ao SNE **não** é, por si, renunciar a nada

**AC-PORTAL-007-4 — cancelar a adesão é sempre possível, e visível**

- **Dado** um aderente
- **Quando** consulta suas preferências
- **Então** o cancelamento está disponível a qualquer tempo (CONTRAN-931 art.8º I)

**AC-PORTAL-007-5 — o PORTAL distingue os dois canais eletrônicos**

- **Dado** uma notificação eletrônica
- **Quando** é entregue
- **Então** o sistema identifica se ela corre pelo SNE ou pelo canal próprio do PORTAL
  ([RN-PORTAL-124]) — são juridicamente distintos e produzem efeitos distintos

## Regras aplicáveis

- (fonte: [REF-CONTRAN-931] arts. 4º, 7º, 8º, 9º — a adesão ao SNE é regida por [RN-RAIT-124] e [RN-RAIT-125]; regra dedicada ao **ato de adesão
  pelo cidadão no PORTAL**
  ainda não redigida; backlog para o especialista BPO/LEGAL)
