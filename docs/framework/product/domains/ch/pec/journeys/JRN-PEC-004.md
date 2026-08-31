---
id: JRN-PEC-004
title: Candidato com resultado "apto com restrições" — entender o que significa, ver como marca a CNH, saber como contestar
status: draft
apps: [pec]
sources:
  - REF-CONTRAN-927-2022
  - RN-PEC-006
  - JRN-PEC-001
  - JRN-PEC-002
updated: 2026-08-24
---

## Persona e contexto

Diego passou pelo exame médico de renovação da CNH categoria B. O laudo não diz "reprovado" —
diz "apto com restrições". Para o sistema, isso é uma linha em `pec.encounter_restrictions`
vinculada a um `medical_result` que, internamente, o schema chama `'CONDICIONADO'`
[RN-PEC-006]. Para Diego, é uma frase que ele não escolheu e que vai aparecer impressa na sua
CNH — e ele não sabe, no momento em que a lê, o que ela muda na prática: pode dirigir amanhã?
Só com óculos? Só de dia? A lacuna que esta jornada cobre não é jurídica (a nomenclatura legal
já está correta desde [JRN-PEC-001]) — é de **tradução para a vida de Diego**, o tipo de
lacuna que nenhuma regra de negócio (`RN-PEC-*`) resolve sozinha porque é inteiramente de
experiência de leitura.

## Narrativa ponta-a-ponta

1. **O resultado chega, e a primeira leitura é ansiosa por natureza.** "Apto com restrições"
   soa, para quem não conhece o jargão, mais perto de reprovação do que de aprovação — é
   preciso que a primeira tela/comunicação que Diego vê deixe claro, na primeira frase, que
   ele **está apto para dirigir** e que "com restrições" descreve uma condição registrada, não
   uma reprovação parcial. [REF-CONTRAN-927-2022] art. 8º, II: "apto com restrições - quando
   houver necessidade de registro na CNH de qualquer restrição referente ao condutor ou
   adaptação veicular" — a norma em si já enquadra a restrição como uma característica do
   registro, não como um grau de reprovação.
2. **O que a restrição diz, especificamente, o PEC (nesta pesquisa) não sabe dizer.** O
   parágrafo único do art. 8º remete os códigos de restrição ao "Anexo XV" da Resolução — um
   anexo que, segundo o dossiê de pesquisa desta rodada, **não foi capturado** ("os Anexos
   I-XXII [...] ficam publicados separadamente [...], não embutidos no PDF do DOU"). Isso é um
   limite real de conteúdo: a tela de resultado de Diego pode e deve mostrar o **código**
   exato que consta do seu laudo, mas **não deve inventar ou parafrasear** o que aquele código
   significa até que o Anexo XV seja capturado e um mapa código→significado exista como fonte
   confiável — mostrar uma explicação errada é pior que admitir "significado detalhado deste
   código: consulte o profissional que assinou seu laudo" enquanto o Anexo não é modelado.
3. **Como isso aparece na CNH física/digital.** A restrição consta impressa no documento —
   Diego vai carregá-la, mostrá-la em blitz, e ela é visível a terceiros (policial,
   fiscalização). A tela do PEC/RENACH que explica o resultado a Diego deveria antecipar essa
   exposição: "este código também aparece na sua CNH" evita que ele seja pego de surpresa
   depois, numa abordagem de trânsito, por algo que já sabia mas não relacionou.
4. **Prazo de validade pode ser diferente do resultado "apto" comum.** Se a restrição vier
   acompanhada de um comprometimento temporariamente sob controle (mais comum no lado
   psicológico, art. 9º §2º, mas o princípio de "restrição implica prazo próprio" vale em
   espírito para o lado médico também), o prazo de validade da habilitação pode ser menor que
   o padrão — a tela precisa mostrar esse prazo específico com a mesma proeminência do
   resultado em si, não como letra miúda.
5. **Contestar — o mesmo caminho de Carlos, não um caminho à parte.** Se Diego discordar da
   restrição em si (ex.: acha que a condição que a motivou não existe mais), o mecanismo é
   exatamente o de [JRN-PEC-002]: requerer Junta Médica, **30 dias** a partir do conhecimento
   do resultado ([REF-CONTRAN-927-2022] art. 12). Esta jornada não deveria propor um segundo
   fluxo de contestação — deveria apontar Diego, com clareza, para o mesmo botão/caminho que
   qualquer resultado divergente usa. A diferença de tom é que "apto com restrições" já é uma
   aptidão — contestar aqui é sobre a restrição específica, não sobre "ser aprovado".
6. **Fim da jornada no PEC.** Como em [JRN-PEC-001], Diego não gerencia esse dossiê
   diretamente no PEC — a leitura definitiva do resultado e da CNH emitida está no
   RENACH/DETRAN. O que o PEC (ou o portal que vier a expor esse dossiê) pode e deve fazer é
   garantir que, no momento em que Diego lê "apto com restrições" pela primeira vez, ele saia
   dessa leitura sabendo três coisas: que pode dirigir, o que o código diz (ou a admissão
   honesta de que o PEC ainda não tem o significado detalhado), e como contestar se discordar.

## Pontos de contato (apps/canais)

- PEC/RENACH — origem do resultado e do código de restrição.
- Eventual portal de acompanhamento do candidato (não confirmado como artefato existente —
  proposta, ver `_intake/ux-notes.md`).
- CNH física/digital — onde a restrição efetivamente aparece a terceiros.

## Métricas de sucesso

- Zero tela que apresente "apto com restrições" sem a frase inicial deixando claro que o
  candidato está apto para dirigir.
- Zero significado de código de restrição inventado/parafraseado sem fonte (Anexo XV não
  capturado — ver passo 2); cobertura de códigos com significado confiável é métrica de
  conteúdo a evoluir quando o Anexo for pesquisado.
- 100% das telas de resultado com restrição apontando para o mesmo caminho de contestação de
  [JRN-PEC-002], nunca um fluxo duplicado.
