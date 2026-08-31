---
id: JRN-PEC-002
title: Jornada do caso divergente — submissão à junta médica e eventual recurso ao CETRAN
status: draft
apps: [pec]
sources:
  - pec:docs/framework/pec/flows/junta-recursos.md
  - pec:database/ddl/02-pec.sql
  - pec:domain/juntas-medical-board/api/src/juntas/juntas.service.ts
  - pec:docs/framework/pec/rbac-matrix.md
  - REF-CONTRAN-927-2022
updated: 2026-08-24
---

## Persona e contexto

Carlos recebeu um resultado de inaptidão (ou de inaptidão temporária) no exame médico e
discorda — ele quer que o caso seja reavaliado. **Achado desta rodada de pesquisa que muda a
moldura da jornada**: [REF-CONTRAN-927-2022] art. 12 trata isso como um **direito do próprio
Carlos**, não como um ato administrativo iniciado por terceiros — "o candidato **poderá
requerer**, no prazo de trinta dias, contados do seu conhecimento, a instauração de Junta
Médica e/ou Psicológica [...], para reavaliação do resultado". A base minerada do PEC
([WF-PEC-002], [UC-PEC-004]) modela a submissão como um ato de Auditor, Gestor ou Gestor
DETRAN — nunca do próprio Carlos diretamente. Essa jornada mantém a mecânica documentada do
sistema (alguém com um desses papéis submete o caso), mas trata isso como um **gap de produto
a validar com LEGAL**, não como uma normalidade: se o requerimento é, por lei, prerrogativa do
candidato, Carlos precisa de um caminho visível para pedir a junta — hoje, pelos documentos
capturados, ele depende inteiramente de alguém internamente decidir montar o dossiê por ele.
Este é, portanto, o caminho menos comum — a maioria dos encounters segue direto para o
encerramento ([JRN-PEC-001]) — mas, ao contrário da versão anterior desta jornada, agora com
uma escada de prazos legais que faz dela, estruturalmente, **os próprios prazos de Carlos**:
o tempo que ele tem para agir e o tempo que o órgão tem para responder, nunca o inverso.

## Narrativa ponta-a-ponta

1. **Carlos discorda do resultado — o relógio começa a correr para ele, não contra ele.**
   A partir do momento em que toma ciência do resultado, Carlos tem **30 dias** para requerer
   a instauração de Junta Médica (art. 12) — o mesmo prazo vale para Junta Psicológica, se o
   resultado divergente for o psicológico. Nos documentos capturados do sistema, quem de fato
   chama `POST /juntas` é um Auditor, Gestor ou Gestor DETRAN — não Carlos diretamente (ver
   nota na Persona acima). A tela/processo que hoje monta esse dossiê precisa, no mínimo,
   tratar o prazo de 30 dias de Carlos como o gatilho de negócio — não o momento em que
   alguém internamente "percebe" o caso.
2. **Submissão à junta.** `POST /juntas` cria o caso em `SUBMITTED`, com um motivo em texto
   livre associado ao `encounterId` — ver [WF-PEC-002]. Não existe hoje uma regra de sistema
   que crie esse caso automaticamente a partir do resultado do exame; é sempre um ato humano
   deliberado.
3. **Efeito colateral imediato:** enquanto o caso da junta não estiver `DECIDED`, o encounter
   de Carlos **não pode ser encerrado** — é um dos itens do gate de fechamento em
   [WF-PEC-001].
4. **O órgão tem 15 dias úteis para designar a Junta — e ela é composta, não monolítica.**
   [REF-CONTRAN-927-2022] art. 14 §1º: o órgão executivo de trânsito estadual deve, **no
   prazo de quinze dias úteis** contados do recebimento do requerimento, designar a Junta
   Médica (art. 12 §1º: **três profissionais médicos** peritos examinadores ou especialistas
   em medicina de tráfego) ou Junta Psicológica (art. 12 §2º: **três psicólogos**,
   equivalente). O RBAC do PEC modela `JUNTA` como papel único, sem esses três assentos
   distintos — a jornada de Carlos, tal como o sistema a executa hoje, não deixa visível
   _quem_, entre três profissionais, está analisando seu caso; é uma lacuna de implementação
   frente a uma composição normativa explícita (ver [WF-PEC-002] §"Composição da junta").
5. **A Junta tem 30 dias, a partir da designação, para decidir.** Art. 14 §3º. `POST
/juntas/:id/decision` registra `APROVADA`, `NEGADA` ou `SOLICITAR_COMPLEMENTO`, assinado
   digitalmente (PAdES) em nome de `'JUNTA'`.
6. **Se a inaptidão for mantida, Carlos tem 30 dias para recorrer ao CETRAN — e o órgão tem 20
   dias úteis para remeter os documentos.** Art. 13 (recurso, 30 dias contados do
   conhecimento da decisão da junta) e art. 14 §2º (remessa dos documentos ao CETRAN, 20 dias
   úteis contados do recebimento do recurso). No sistema, esse recurso hoje **não é um novo
   caso**: quem decide pode marcar `escalateToCetran=true` na mesma chamada de decisão — uma
   re-atribuição de assinatura para `'CETRAN'` sobre a mesma linha de decisão (ver
   [WF-PEC-002]). Não há, nos documentos capturados, um segundo ato humano formal de "abrir
   recurso" com os próprios 30/20 dias como prazos de sistema — é uma divergência relevante
   entre o desenho normativo (um segundo processo, com prazo próprio) e a implementação (um
   flag numa decisão já tomada).
7. **A instância que de fato julga o recurso não é o CETRAN colegiado em si — é uma "Junta
   Especial de Saúde" que o CETRAN designa (art. 15) — achado novo, não modelado em nada do
   sistema.** A norma descreve um terceiro colegiado, distinto tanto da Junta de 1ª instância
   quanto do CETRAN administrativo: "no mínimo, três médicos, sendo dois especialistas em
   Medicina de Tráfego, ou, no mínimo, três psicólogos, sendo dois especialistas em psicologia
   do trânsito". Se essa leitura for confirmada por LEGAL, comunicar a Carlos "o CETRAN
   decidiu" seria impreciso — o correto seria "a Junta Especial de Saúde, designada pelo
   CETRAN, decidiu". Até essa validação, qualquer tela/comunicação ao candidato deveria evitar
   nomear a instância decisória com precisão que o sistema ainda não sustenta — ver anti-
   padrão em `_intake/ux-notes.md`.
8. **Publicação.** A decisão (com ou sem escalonamento a CETRAN) é publicada no
   PEC/RENACH — o campo `escalatedToCetran` viaja no evento de transmissão.
9. **Desbloqueio do encounter.** Com o caso `DECIDED`, o gate de encerramento do encounter de
   Carlos deixa de listar "junta pendente" como impedimento — o encerramento segue o fluxo
   normal de [WF-PEC-001].

## Pontos de contato (apps/canais)

- PEC — módulo `juntas-medical-board` (submissão e decisão).
- Junta médica / Junta Especial de Saúde / CETRAN — atores externos ao dia a dia da clínica,
  mas dentro do RBAC do PEC (a Junta Especial de Saúde, distinta do CETRAN colegiado, hoje sem
  representação própria no sistema — ver passo 7).
- RENACH — recebe o resultado final da decisão como parte da transmissão do encounter.

## Notas de revisão (2026-08-25)

Rodada confirm-extend: a jornada era, na versão anterior, quase toda "fonte pendente" quanto a
prazos e composição — [REF-CONTRAN-927-2022] arts. 12-15 fecha essa lacuna com base legal
federal explícita. Mudanças de fundo: (1) reformulação da Persona para refletir que o
requerimento de junta é, por lei, prerrogativa do próprio candidato, não apenas um ato
administrativo iniciado por terceiros — sinalizado como gap de produto a validar; (2) a escada
completa de cinco prazos (30/15 úteis/30/30/20 úteis dias) substitui "prazos e notificações
orquestrados" genérico; (3) passo novo (7) documentando a "Junta Especial de Saúde" como
terceira instância não modelada, com recomendação explícita de nunca nomeá-la como "CETRAN" em
tela até a modelagem ser resolvida.

## Métricas de sucesso

A escada de prazos de [REF-CONTRAN-927-2022] arts. 12-15 substitui a lacuna "nenhum prazo
numérico encontrado" da versão anterior desta jornada — e deveria ser lida como uma escada de
**direitos de Carlos**, no mesmo espírito de [JRN-RAIT-004] ("prazo do cidadão" vs. "prazo do
órgão"):

| Etapa                           | Prazo                                         | De quem é o relógio |
| ------------------------------- | --------------------------------------------- | ------------------- |
| Requerer instauração de junta   | 30 dias, do conhecimento do resultado         | direito de Carlos   |
| Órgão designar a junta          | 15 dias úteis, do recebimento do requerimento | dever do órgão      |
| Junta decidir                   | 30 dias, da designação                        | dever do órgão      |
| Recorrer ao CETRAN              | 30 dias, do conhecimento da decisão da junta  | direito de Carlos   |
| Remessa de documentos ao CETRAN | 20 dias úteis, do recebimento do recurso      | dever do órgão      |

Zero prazo do órgão (15 dias úteis, 30 dias, 20 dias úteis) estourado sem alerta prévio
registrado; zero comunicação a Carlos que confunda "prazo que ele já cumpriu ao recorrer a
tempo" com "atraso do próprio órgão"; zero tela que nomeie a "Junta Especial de Saúde" (art. 15) como "CETRAN" sem essa distinção estar de fato implementada.
