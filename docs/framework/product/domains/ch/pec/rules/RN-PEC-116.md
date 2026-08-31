---
id: RN-PEC-116
title: Atendimento em local e horário exclusivos do credenciamento, com janela obrigatória de 08h às 13h em dias úteis (DETRAN-AM)
status: draft
apps: [pec, portal]
sources:
  [
    REF-DETRANAM-PORTARIA-005-2021,
    REF-DETRANAM-PORTARIA-008-2021,
    REF-CFM-1636-2002,
    REF-CTB-147-148-habilitacao,
  ]
updated: 2026-08-27
---

**Regra.** No Amazonas, a agenda da clínica credenciada é **restringida por norma**, não apenas por
capacidade:

1. **Exclusividade de local e horário**: os atendimentos devem ocorrer _"de forma exclusiva, no
   local e horário indicado no requerimento do credenciamento"_, sujeitos a fiscalização. O local e
   o horário são, portanto, **atributos do credenciamento**, não configurações livres da clínica.
2. **Janela obrigatória**: as clínicas médicas e psicológicas de trânsito funcionam
   **obrigatoriamente das 08h00 às 13h00** para agendamento de exame dos candidatos.
3. **Extensão a dias não úteis** é permitida, **mediante comunicação prévia** à Gerência Médica e
   Psicológica do DETRAN-AM — não é livre, mas também não é vedada.

Some-se a regra legal de que o exame de aptidão física e mental deve ser realizado **no local de
residência ou domicílio do examinado** (CTB art. 147, § 2º) — restrição **territorial**,
independente da restrição horária, e igualmente ausente do corpus.

**Base legal.**

- [REF-DETRANAM-PORTARIA-005-2021] art. 6º (redação nova): _"Os atendimentos deverão ocorrer, de
  forma exclusiva, no local e horário indicado no requerimento do credenciamento, devidamente
  fiscalizado [...]."_
- [REF-DETRANAM-PORTARIA-005-2021] art. 40 (redação nova): _"As Clínicas Médicas e Psicológicas de
  Trânsito funcionarão, obrigatoriamente, no horário de 08h00min às 13h00min, para agendamento de
  exame dos candidatos; Parágrafo único. As Clínicas [...] poderão atender em dias não úteis,
  devendo informar do atendimento à Gerência Médica e Psicológica."_
- [REF-CTB-147-148-habilitacao] art. 147, § 2º: exame _"a ser realizado no local de residência ou
  domicílio do examinado"_.
- [REF-CFM-1636-2002] art. 4º (vedação de cota-limite por período — tensão registrada em
  [RN-PEC-114]).

**Verificação.** Fecha a lacuna que [WF-PEC-003] registrava como _"Nenhum prazo/SLA numérico foi
encontrado para o agendamento em si nos documentos do PEC (fonte pendente)"_ e dá conteúdo concreto
ao "controle de sessão única e bloqueio de horário de funcionamento" citado em RF-001/RF-003 do SRS
arquivado. Consequências verificáveis:

1. **A janela é regra de validação de agendamento**, não sugestão de UI: `POST /appointments` fora
   de 08h-13h em dia útil deve ser recusado, salvo comunicação registrada de atendimento em dia não
   útil.
2. **A comunicação ao DETRAN-AM para dia não útil é um ato com destinatário externo** — precisa de
   evidência (quem comunicou, quando, qual janela), não de uma flag.
3. **Local e horário vêm do credenciamento** ([RN-PEC-115]): a agenda da unidade é derivada do ato
   administrativo, e alterá-la é alterar o credenciamento — não uma configuração de tenant.
4. **A restrição de domicílio (CTB art. 147, § 2º)** conflita frontalmente com qualquer desenho de
   distribuição regional livre e precisa ser conciliada com [RN-PEC-113] (P2 — sorteio dentro da
   região do candidato é, aliás, o desenho que melhor concilia as duas).
5. **Impacto de capacidade.** Cinco horas úteis por dia, com dois exames por candidato em muitos
   casos, é um teto operacional duro. É dado de dimensionamento, não apenas de conformidade —
   handoff BPO já registrado no dossiê §6.

**Controvérsia/risco.** _Severidade: média._ A [REF-DETRANAM-PORTARIA-008-2021] foi recuperada e
lida na íntegra: ela rege o credenciamento específico do programa CNH Social e não contém janela
de atendimento, retenção de laudos ou assinatura cruzada, nem revoga a Portaria 001/2019 emendada
pela 005/2021. A leitura textual aponta regimes paralelos, mas a coexistência ainda merece
confirmação institucional e atos supervenientes 005/2023 e 009/2026 ainda não foram capturados.
Permanece também a tensão com o art. 4º da [REF-CFM-1636-2002], tratada em [RN-PEC-114].
