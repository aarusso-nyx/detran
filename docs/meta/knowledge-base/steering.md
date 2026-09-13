# Steering — perguntas abertas para o Owner

Compilado em 2026-08-24 a partir de todo o corpus do repositório. Diferente de
`_meta/backlog.md` (que rastreia **pesquisa pendente** — `(fonte pendente)`: achar um
documento, confirmar uma vigência), este arquivo reúne apenas itens que **exigem uma decisão
ou resposta do Owner** — calibração de processo, escopo de produto, ou risco jurídico que só
o Owner pode aceitar/encaminhar. Fontes: `_meta/backlog.md` (seções "Decisões do owner"),
`inf/rait/_intake/legal-assessment.md` §4, `inf/rait/_intake/bpo-notes.md` §2-3, e
"decisões de produto" marcadas nos workflows de domínio.

**Status: respondido em conversa de steering (2026-08-24) e propagado aos artifacts de
origem.** As 33 perguntas abaixo foram apresentadas ao Owner em formato de múltipla escolha,
todas têm resposta registrada, e cada resposta foi gravada sob `## Decisões`/nota "Decisão"
no artifact correspondente (workflows e regras RAIT; TEAT; BOAT; shared/actors.md;
REF-DETRANAM-SERVICOS.md), promovendo o status para `reviewed` onde o item era o único
pendente do documento (convenção de `CONVENTIONS.md`). Ver lista de arquivos tocados no fim
deste documento. ⚠️ **Itens marcados `[BLOQUEIA]` (C.13-C.17) foram respondidos diretamente
pelo Owner, sem parecer jurídico formal** — tratar como leitura de trabalho aceita pelo
negócio, não como validação de um advogado; risco de reversão permanece até parecer formal,
especialmente C.13 (aplicabilidade da Lei 9.873 ao órgão estadual). Alguns itens (C.16, C.22,
C.17) tiveram apenas resolução **parcial** — ver notas nas próprias regras RN-RAIT
correspondentes e a seção "Pontos que a múltipla escolha não fechou" abaixo.

---

## A. RAIT — calibração operacional (BPO)

1. **Limiares da escada de alertas de prescrição** ([WF-RAIT-002] §4) — marcos propostos:
   12/18/21/23 meses (relógio B); 24/30/33 meses de paralisação (relógio C); 50/75/90% dos
   prazos de 180/360 dias (relógio A).
   **Resposta: Aprovar como proposto.**
2. **Desenho de pools de trabalho** ([WF-RAIT-002] §1) — 3 pools base (defesa/JARI/CETRAN) com
   segmentação opcional.
   **Resposta: Manter 3 pools base, sem segmentação adicional.**
3. **Mecanismo de sorteio de relator** ([WF-RAIT-002] §3).
   **Resposta: Usar o round-robin já existente na plataforma de worklist.**
4. **Regimento interno JARI-AM/CETRAN-AM** (quorum, convocação, sustentação oral, prazo de
   voto, desempate) — não localizado publicamente.
   **Resposta: Formalizar as propostas deste corpus (combo CETRAN-ES + CETRAN-SP) como
   desenho de fato, sujeito a validação jurídica antes de `approved`.**
5. **Accountability por atraso de relator** (`ADVERTIDO`→`AFASTADO_TEMP`, [WF-RAIT-002] §5).
   **Resposta: Adotar o modelo CETRAN-ES como proposto.**
6. **Fonte do calendário de feriados** ([RN-RAIT-005] / [WF-RAIT-002] §7).
   **Resposta: Combinar calendário nacional + estadual (AM).**
7. **Prazo de diligência (T-DIL)** — sem piso/teto legal; proposta 15 dias úteis, prorrogável
   1x.
   **Resposta: Aprovar 15 dias úteis, prorrogável 1x.**
8. **Assinatura digital de ata/decisão** ([WF-RAIT-003]) — proposta PAdES+TSA.
   **Resposta: Adotar PAdES+TSA.**

## B. RAIT — dados de capacidade

9. Existe uma única JARI-AM, ou mais de uma?
   **Resposta: Uma única JARI-AM.**
10. Quantos conselheiros o CETRAN-AM tem hoje para quorum?
    **Resposta: 8 (mesmo piso do benchmark CETRAN-ES) — confirmar número exato depois.**
11. Volume mensal de defesas prévias + recursos JARI + recursos CETRAN?
    **Resposta: Alto (> 500/mês).**
12. Número de analistas/revisores do 1º circuito hoje alocados?
    **Resposta: 6-15.**

    ⚠️ **Nota de dimensionamento:** volume alto (>500/mês) com equipe de 6-15 analistas e uma
    única JARI-AM/CETRAN com quorum de 8 é uma combinação que merece checagem de capacidade
    real antes de travar a escada de SLA do item A.1 — o BPO pediu esses números
    explicitamente porque "uma escada calibrada em meses só é útil se o throughput do
    colegiado for suficiente para zerar a fila antes do teto" (`bpo-notes.md` §3). Recomenda-se
    validar throughput real (casos julgados/mês) antes de tratar A.1 como fechado.

## C. RAIT — validação jurídica prioritária

13. **[BLOQUEIA]** A Lei 9.873/1999 rege o processo administrativo de trânsito estadual do
    DETRAN-AM?
    **Resposta: Sim, aplicar** (via extensão da Res. 918 art. 36). _Sem parecer jurídico
    formal — ver aviso acima._
14. **[BLOQUEIA]** Qual relógio governa o SLA quando o teto do CTB (até 48m) excede a
    prescrição por paralisação de 3 anos?
    **Resposta: O mais curto (3 anos, Lei 9.873 art.1º §1º) governa.**
15. **[BLOQUEIA]** A prescrição do art. 289-A é automática e declarável de ofício?
    **Resposta: Sim, o sistema declara de ofício.**
16. **[BLOQUEIA]** Recurso da autoridade contra decisão de provimento (CTB art. 288 §1º):
    discricionário ou vinculado?
    **Resposta: Vinculado** — a autoridade é obrigada a recorrer sempre que a decisão for de
    provimento. _(Ainda em aberto: qual autoridade do DETRAN-AM o exerce, qual prazo, se há
    contrarrazões — não coberto pela múltipla escolha; precisa de detalhamento em nova
    conversa ou parecer jurídico.)_
17. **[BLOQUEIA]** Desconto de 40% sem adesão ao SNE (CTB 284 §6º pós-2023 × Res.918/931).
    **Resposta: Aplicar o desconto mesmo sem adesão ao SNE**, seguindo a lei mais recente.
    _(Procedimento operacional para emitir o documento de arrecadação fora do SNE ainda não
    está definido — ver nota abaixo.)_
18. Termo inicial da decadência em autuações não flagranciais (CTB 282 §6º-A).
    **Resposta: Usar "data do cometimento" (Res. 918 art. 9º §2º) como marco.**
19. Vigência da Res. CONTRAN 357/2010 (JARI).
    **Resposta: Assumir vigente e seguir com o desenho atual.**
20. Regulamento do CONTRAN sobre "força maior" (CTB art. 290-A) — não localizado.
    **Resposta: Suspensão de prazo só por ato administrativo motivado e auditado, nunca
    automática.**
21. Termo inicial da defesa: "expedição" × "notificação".
    **Resposta: Expedição.**
22. Revisão pós-encerramento da instância (Lei 9.784 art. 65) e vedação de _reformatio in
    pejus_.
    **Resposta: Não oferecer canal de revisão pós-encerramento** — decisão do CETRAN tratada
    como definitiva.
23. Critério de "pedido incompatível com a situação fática" (Res. 900 art. 4º, IV).
    **Resposta: Restringir a ausência formal de pedido** — nunca aplicar por juízo de
    conteúdo.
24. Prevalência entre "publicação" e "notificação" da decisão da JARI (CTB art. 288).
    **Resposta: Sempre a publicação prevalece.**
25. Índice de correção da restituição (CTB art. 286 §2º, UFIR extinta).
    **Resposta: Usar o índice fiscal padrão de correção de débitos do estado do AM.**
26. Efeito da desistência da defesa sobre o prazo estendido de 360 dias.
    **Resposta: Desistência não restaura os 180 dias.**
27. Confirmar assinatura/vigência da Portaria DETRAN-AM 5046/2018 (OCR ambíguo).
    **Resposta: Citar como está — risco aceito, sem confirmação adicional por ora.**

## D. Ação de conformidade de baixo risco / alto impacto

28. Autorizar correção imediata das cartas de serviço do DETRAN-AM (endosso cartorial e
    juntada do parecer da JARI, ambos sem base legal).
    **Resposta: Sim, autorizar agora**, sem esperar validação jurídica formal.

## E. TEAT — decisão de produto

29. Comportamento do dispositivo quando o pacote normativo expira em campo, offline.
    **Resposta: Continuar com aviso** (não bloquear a lavratura).

## F. Escopo e papéis — decisões cross-domínio

30. `shared/actors.md`: espelhar os 9 papéis granulares do TEAT ou manter visão agregada?
    **Resposta: Espelhar os 9 papéis.**
31. "Parceiro conveniado" (BOAT): visão futura ou remover da missão?
    **Resposta: Manter como visão de produto futura.**
32. Papéis de protótipo sem RBAC (Suporte, Fiscal de contrato, DPO): ondas futuras ou fora do
    escopo?
    **Resposta: Ondas futuras** — mantidos no escopo, não implementados agora.
33. UC-1.245/1.246 e UC-1.251 (BOAT): UC próprio ou extensão?
    **Resposta: UC próprio e dedicado.**

---

## G. RAIT — plataforma, papéis e vocabulário persistido (2026-09-12)

34. Substrato de plataforma do frontend e do backend: manter STYNX 1.1.1 / Angular 21 ou adotar
    STYNX@latest? **Resposta: adotar STYNX 1.3.1 (latest), com o Angular correspondente (22.x)
    e o DEVAI correspondente (1.4.5, já pinado).** Registro em ADR-0013; migração dos pins do
    workspace no pacote de trabalho WP-0 (`docs/framework/arch/rait-build-pack.md`).
35. Papéis do RAIT: manter só a visão agregada de `shared/actors.md` ou estender o catálogo
    canônico? **Resposta: estender** — dez códigos `rait-*` em `roles.ts`, no DDL
    (`auth.role_catalog`) e em `shared/actors.md` §Papéis granulares RAIT.
36. Vocabulário da máquina de estados [WF-INF-003] no banco: só no futuro blueprint do agregado
    ou já como referência persistida? **Resposta: já no DDL**, como tabelas de referência
    (`inf.infraction_*_ref`, `14-inf-lifecycle-vocabulary.sql`) verificadas contra o workflow
    (`pnpm verify:lifecycle-vocabulary`); o blueprint do agregado referencia-as por FK.

---

37. Fronteiras dos módulos transversais do escopo de infrações (ADR-0014 infração e
    notificação; ADR-0015 arrecadação; ADR-0016 documentos e assinatura como substrato;
    ADR-0017 domínio `portal`; ADR-0018 projeções): aceitar como propostas pelo Architect?
    **Resposta: todas aceitas (2026-09-13).** Ordem de construção sugerida: 0014 e 0016, depois
    0015 e 0018, e 0017 por último.

## Pontos que a múltipla escolha não fechou — precisam de mais uma rodada

- **Item 16**: definido que o recurso da autoridade é _vinculado_, mas falta definir **qual
  autoridade** dentro do DETRAN-AM o exerce, **qual prazo** e se há **contrarrazões** do
  cidadão — sem isso o fluxo em [WF-RAIT-001]/[RN-RAIT-130] não pode ser modelado por
  completo.
- **Item 17**: aprovado aplicar o desconto de 40% sem SNE, mas o **procedimento** para emitir
  o documento de arrecadação fora do SNE continua indefinido — é um desenho técnico a ser
  produzido, não apenas uma confirmação de política.
- **Item B**: throughput real do colegiado (casos julgados/mês) não foi perguntado
  diretamente — recomendo uma pergunta de acompanhamento antes de travar a escada de SLA do
  item A.1 em produção.
- **Item 22 (companion de C.22)**: a vedação de _reformatio in pejus_ em 2ª instância
  ([RN-RAIT-132], legal-assessment item 20) não foi perguntada especificamente — C.22 cobriu
  apenas a revisão pós-encerramento. Segue como recomendação de precaução, sem decisão.

## Arquivos atualizados na propagação (2026-08-24)

**RAIT:** [WF-RAIT-001.md](../../framework/product/domains/inf/rait/workflows/WF-RAIT-001.md),
[WF-RAIT-002.md](../../framework/product/domains/inf/rait/workflows/WF-RAIT-002.md) (→ `reviewed`),
[WF-RAIT-003.md](../../framework/product/domains/inf/rait/workflows/WF-RAIT-003.md) (→ `reviewed`),
[RN-RAIT-005](../../framework/product/domains/inf/rait/rules/RN-RAIT-005.md), [RN-RAIT-101](../../framework/product/domains/inf/rait/rules/RN-RAIT-101.md),
[RN-RAIT-103](../../framework/product/domains/inf/rait/rules/RN-RAIT-103.md), [RN-RAIT-105](../../framework/product/domains/inf/rait/rules/RN-RAIT-105.md),
[RN-RAIT-111](../../framework/product/domains/inf/rait/rules/RN-RAIT-111.md), [RN-RAIT-112](../../framework/product/domains/inf/rait/rules/RN-RAIT-112.md),
[RN-RAIT-113](../../framework/product/domains/inf/rait/rules/RN-RAIT-113.md), [RN-RAIT-114](../../framework/product/domains/inf/rait/rules/RN-RAIT-114.md),
[RN-RAIT-116](../../framework/product/domains/inf/rait/rules/RN-RAIT-116.md), [RN-RAIT-119](../../framework/product/domains/inf/rait/rules/RN-RAIT-119.md),
[RN-RAIT-121](../../framework/product/domains/inf/rait/rules/RN-RAIT-121.md), [RN-RAIT-122](../../framework/product/domains/inf/rait/rules/RN-RAIT-122.md),
[RN-RAIT-123](../../framework/product/domains/inf/rait/rules/RN-RAIT-123.md), [RN-RAIT-127](../../framework/product/domains/inf/rait/rules/RN-RAIT-127.md),
[RN-RAIT-129](../../framework/product/domains/inf/rait/rules/RN-RAIT-129.md), [RN-RAIT-130](../../framework/product/domains/inf/rait/rules/RN-RAIT-130.md)
(parcial), [RN-RAIT-132](../../framework/product/domains/inf/rait/rules/RN-RAIT-132.md) (parcial),
[legal-assessment.md](../../framework/product/domains/inf/rait/_intake/legal-assessment.md) (→ `reviewed`, nova §5),
[bpo-notes.md](../../framework/product/domains/inf/rait/_intake/bpo-notes.md).

**Outros domínios:** [WF-TEAT-003.md](../../framework/product/domains/inf/teat/workflows/WF-TEAT-003.md),
[shared/actors.md](../../framework/product/shared/actors.md) (→ `reviewed`),
[est/boat/APP.md](../../framework/product/domains/est/boat/APP.md),
[est/boat/use-cases/INDEX.md](../../framework/product/domains/est/boat/use-cases/INDEX.md),
est/boat/use-cases/UC-BOAT-012.md (novo, stub),
[REF-DETRANAM-SERVICOS.md](../../reference/legal/detran-am/REF-DETRANAM-SERVICOS.md).

**`_meta/backlog.md`**: checklists "Decisões do owner" marcados `[x]` com referência a este
arquivo.

## Fora deste documento (para referência)

Itens de pesquisa pura (`(fonte pendente)`) continuam em `_meta/backlog.md`. Débito técnico já
endereçado à equipe do monorepo está em `_meta/backlog.md` §"Handoffs de engenharia" e não foi
duplicado aqui.
