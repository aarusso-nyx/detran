---
id: JRN-TEAT-002
title: Supervisor configura operação, faixa de numeração e catálogo normativo
status: draft
apps: [teat]
sources:
  [
    'teat:docs/framework/product/blueprints/BP-MOBILE-OPERATIONS-001.json',
    'teat:docs/framework/product/blueprints/BP-OFFLINE-SYNC-001.json',
    'teat:docs/framework/product/blueprints/BP-NORMATIVE-CATALOG-001.json',
    'teat:docs/framework/product/workflows/normative-catalog.md',
    REF-SENATRAN-997,
    REF-DETRANAM-TALAO-BODYCAM,
  ]
updated: 2026-08-24
---

**Revisão 2026-08-24 (rodada UX/field context — confirmação/extensão):** narrativa confirmada;
dois pontos passam a ter base normativa nova. Primeiro, a homologação tem **dois níveis
distintos** que o passo 3 hoje trata como um só: a homologação do **software** do talão
eletrônico perante a SENATRAN (laudo técnico independente, renovação a cada 4 anos —
[REF-SENATRAN-997] art. 5º) é diferente do controle interno do órgão sobre qual
**dispositivo+versão** está autorizado a operar ([RN-TEAT-003]). O supervisor de campo só
enxerga/confirma o segundo; o primeiro é responsabilidade de agency-admin/technical-admin e não
deveria aparecer na mesma tela de checklist operacional, sob risco de confundir o supervisor
sobre o que ele de fato está autorizado a verificar. Segundo, se a equipe inclui policiais do
BPTRAN em convênio operando dispositivo próprio da corporação (achado local,
[REF-DETRANAM-TALAO-BODYCAM] §3), a verificação de homologação do passo 3 precisa cobrir também
esse parque de aparelhos externos ao DETRAN-AM — não é um caso à parte.

## Persona e contexto

Supervisor de campo (field-supervisor) e administrador do órgão (agency-admin), preparando uma
operação de fiscalização programada (ex.: blitz) para uma equipe de agentes.

## Narrativa ponta-a-ponta

1. **Planejamento da operação.** Agency-admin ou field-supervisor cria `Operation`
   (`operation_type`, `planned_start_at`/`planned_end_at`, `objectives`, `status = planned`).
2. **Composição de equipe.** Agentes são vinculados via `Team`/`TeamAgent`; viatura de patrulha
   (`PatrolVehicle`) é designada.
3. **Homologação verificada.** Supervisor confirma que os dispositivos que participarão da
   operação estão com `OperationalDevice.status = authorized` e versão de aplicativo vinculada a
   homologação vigente ([RN-TEAT-003]) — inclui o parque de dispositivos do BPTRAN quando a
   equipe é mista (convênio, [REF-DETRANAM-TALAO-BODYCAM] §3). Esta tela **não** mostra o status
   da homologação SENATRAN do software em si (renovação quadrienal, [REF-SENATRAN-997] art. 5º) —
   isso é responsabilidade de agency-admin/technical-admin, fora do checklist do supervisor de
   campo.
4. **Catálogo normativo.** Agency-admin/technical-admin publica (ou confirma vigente) o catálogo
   normativo aplicável e o pacote mobile correspondente ([WF-TEAT-003]); pacote fica disponível
   via `sync-metadata` para os dispositivos da equipe. Se a operação exige uma versão de
   aplicativo recém-alterada em funcionalidade, agency-admin/technical-admin deveria confirmar
   antes que a nova homologação SENATRAN, quando exigida, já foi obtida — alteração de
   funcionalidade pode levar até 60 dias para ser rehomologada ([REF-SENATRAN-997] Anexo VII, a) —
   risco de planejamento a não deixar para a véspera de uma operação grande.
5. **Reserva de numeração.** Supervisor reserva faixas de numeração para os dispositivos da
   equipe, cobrindo o volume esperado de autuações da operação ([WF-TEAT-002]) — a norma confirma
   que essa numeração sequencial pré-estabelecida é mandato legal, não só controle técnico interno
   ([REF-SENATRAN-997] art. 3º, I).
6. **Abertura da operação.** Operação muda de `planned` para execução; agentes selecionam a
   operação ao abrir turno (`operation-select` → `shift-context`).
7. **Acompanhamento em tempo real.** Supervisor acompanha turnos ativos e mapa de
   agentes/equipes na retaguarda web (`active-shifts`, `operations-map`) — inclui, se a operação
   for uma blitz de alcoolemia ou envolver remoção de veículos, os pontos de atenção específicos
   de [JRN-TEAT-003] e [JRN-TEAT-004] (ex.: fila de espera por reboque, disponibilidade de
   etilômetro homologado por ponto de bloqueio).
8. **Encerramento.** Ao final, supervisor revisa resumo da operação: AITs lavrados, medidas
   aplicadas, sinistros registrados, itens ainda em sincronização ou conflito.

## Pontos de contato (apps/canais)

Backoffice web TEAT (`/v1/mobile-operations`, `/v1/normative-catalog`, `/v1/offline-sync`);
aplicativo mobile dos agentes da equipe.

## Métricas de sucesso

100% dos dispositivos da operação homologados antes do início (incluindo dispositivos BPTRAN em
equipes mistas); faixa de numeração suficiente para o volume da operação sem esgotamento em
campo; catálogo normativo vigente instalado em todos os dispositivos antes da abertura de turno;
zero operações iniciadas com homologação SENATRAN do software pendente de renovação.
