---
id: RN-TEAT-111
title: Sessão do agente é exclusiva por dispositivo — registros concorrentes NÃO são processados e geram apuração
status: draft
apps: [teat]
sources: [REF-SENATRAN-997]
updated: 2026-08-24
---

**Regra.** **O agente de trânsito não pode estar logado simultaneamente em mais de um
equipamento.** Se, na transmissão dos dados para processamento, for apurada a existência de
registros feitos **pelo mesmo agente, dentro de um mesmo intervalo de tempo, em aparelhos
diferentes**, esses registros **não devem ser processados** e o fato **deve ser apurado pela
autoridade de trânsito**. São, portanto, **duas obrigações distintas e ambas vinculadas**:
(1) prevenção — a plataforma impede sessão concorrente do mesmo agente; (2) contenção — detectada
a concorrência apesar da prevenção, o efeito normativo é **bloqueio de processamento**, não
alerta, não fila de revisão opcional, não aceite com ressalva. A abertura de apuração pela
autoridade é consequência obrigatória, não facultativa.

**Base legal.** [REF-SENATRAN-997] Anexo II, h):

> "O agente de trânsito não poderá estar logado simultaneamente em mais de um equipamento. Quando
> da transmissão dos dados para processamento, apurada a existência de registros realizados por um
> mesmo agente de trânsito, dentro de um mesmo intervalo de tempo, em aparelhos diferentes, esses
> registros não deverão ser processados e o fato deve ser apurado pela autoridade de trânsito."

**Verificação.** Regra **nova**, ausente de [RN-TEAT-001] (que trata de idempotência de reenvio —
problema diferente: mesmo ato reenviado do **mesmo** dispositivo). Implementação em duas camadas:

- **Prevenção (sessão):** o bootstrap de sessão do turno vincula `agent_id` a um único
  `device_id` ativo; nova autenticação do mesmo agente em outro dispositivo encerra a sessão
  anterior e **invalida a reserva de numeração** pendente daquele dispositivo ([WF-TEAT-002]),
  para que não subsistam dois dispositivos aptos a emitir.
- **Contenção (recepção):** `POST /v1/offline-sync/sync-batches` executa, por lote e contra o
  acervo já recebido, a detecção `mesmo agent_id + device_id distintos + janela de tempo
sobreposta`; os atos assim identificados entram em estado terminal de **não processamento** e
  abrem uma ocorrência de apuração dirigida a `traffic-authority`. Não devem transitar para
  `VALIDANDO` em [WF-TEAT-001] — o bloqueio é **anterior** à validação de conteúdo.

**Controvérsia/risco — alto.** A norma **não define "mesmo intervalo de tempo"**. Qualquer janela
que o produto adote (segundos? minutos? o turno inteiro?) é parâmetro **inventado pelo
implementador** com consequência jurídica direta: janela curta demais deixa passar a fraude que a
norma quer apanhar; longa demais anula atos legítimos de um agente que trocou de aparelho por
defeito no meio do turno. Não há cenário de defeito de equipamento tratado pela norma. **Este é o
parâmetro de maior exposição do TEAT que não tem resposta no texto normativo** — precisa de
decisão da autoridade de trânsito, formalizada e versionada como dado do órgão, nunca como
constante de código. Item 10 de `_intake/legal-assessment.md`, priorizado para validação jurídica.
