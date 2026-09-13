---
id: UC-PEC-014
title: Gerenciar retenção e eliminação/devolução do prontuário eletrônico
status: reviewed
apps: [pec]
sources:
  - REF-LEI-13787-2018
  - REF-CONTRAN-927-2022
  - REF-DETRANAM-PORTARIA-005-2021
  - REF-CONTRAN-923-1009-toxicologico
updated: 2026-08-26
---

## Ator e objetivo

Gestor DETRAN (ou DPO, em conformidade LGPD) administra o ciclo de retenção do prontuário
eletrônico do PEC — laudos, adendos, evidências de exame — respeitando o piso legal de retenção
antes de qualquer eliminação ou devolução ao paciente. Motivado pelo achado de maior impacto do
dossiê CRAWLER (`_intake/research-dossier.md` §8, item 3): nenhuma `RN-PEC` trata de retenção,
apesar de existirem três prazos legais capturados para objetos/atores distintos.

## Os três prazos de retenção confirmados (não sobrepostos — objetos/atores diferentes)

| Objeto                                                                                                                | Prazo                                    | Responsável                                                  | Base                                                                                  |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Prontuário eletrônico como um todo (inclusive documentos nascidos eletrônicos — laudo PDF/A)                          | **20 anos**, a partir do último registro | não confirmado — Lei não indica se PEC, DETRAN-AM ou clínica | Lei 13.787/2018 art. 6º, §5º [REF-LEI-13787-2018]                                     |
| Laudos médicos/psicológicos guardados pela entidade credenciada, especificamente **após pedido de descredenciamento** | 5 anos                                   | entidade credenciada (clínica)                               | Portaria DETRAN-AM 005/2021 art. 21, parágrafo único [REF-DETRANAM-PORTARIA-005-2021] |
| Resultado/material biológico do exame toxicológico C/D/E                                                              | 5 anos                                   | laboratório credenciado (externo ao PEC)                     | Res. CONTRAN 923/2022 art. 9º §§1º-2º [REF-CONTRAN-923-1009-toxicologico]             |

Os três prazos podem coexistir sem conflito (ex.: a clínica guarda por 5 anos após
descredenciar-se; o sistema central retém o prontuário por 20 anos no total) — mas **nenhuma
norma capturada define quem é responsável pelo prazo de 20 anos do prontuário como um todo**, nem
se `pec.documents`/`pec.reports` tem qualquer política de retenção implementada hoje. Este é o
item de validação jurídica prioritária nº 3 do dossiê.

## Pré-condições

- Encounter `CLOSED` há tempo suficiente para entrar no escopo de uma política de retenção
  (nenhum gatilho de "último registro" está definido no schema atual — **fonte pendente**).

## Fluxo principal (proposto — sujeito a validação jurídica e de produto)

1. Sistema (ou processo administrativo do DETRAN-AM) identifica prontuários cujo "último
   registro" ultrapassou o piso de 20 anos (Lei 13.787/2018 art. 6º).
2. Antes de eliminar, oferece a alternativa de devolução ao paciente (art. 6º §2º).
3. Se elimina: processo deve resguardar intimidade e sigilo (art. 6º §3º) — trilha de auditoria
   da própria eliminação, distinta da trilha de auditoria de uso.
4. DPO revisa/aprova a eliminação em lote (papel já existente na matriz RBAC do PEC,
   "Conformidade LGPD; consulta trilhas/evidências" — [APP-PEC] §Atores).

## Fluxos alternativos / exceções

- **Retenção estendida por potencial probatório/legal**: a Lei 13.787/2018 art. 6º §1º permite
  prazos diferenciados fixados em regulamento — nenhum regulamento desse tipo foi localizado
  para o contexto de trânsito; tratar 20 anos como o piso vigente até confirmação em contrário.
- **Prontuário de candidato menor de idade, ou com processo em disputa/junta em curso**: casos
  especiais não tratados pela Lei 13.787/2018 nem por nenhuma fonte capturada — recomenda-se
  excluir do lote automático de elegibilidade até revisão jurídica caso a caso.

## Pós-condições

- Prontuários elegíveis identificados; eliminação ou devolução registrada com trilha de
  auditoria própria.
- Nenhuma eliminação executada sem confirmação de que o piso de 20 anos foi atingido.

## Critérios de aceitação

**AC-PEC-014-1 — 20 anos é piso contado do último registro**

- **Dado** um prontuário
- **Quando** sua elegibilidade à eliminação é calculada
- **Então** o marco é o **último registro**, não a abertura, e o piso é de 20 anos
  ([RN-PEC-141], Lei 13.787/2018 art. 6º)

**AC-PEC-014-2 — devolução ao paciente precede a eliminação**

- **Dado** um prontuário elegível
- **Quando** o processo é executado
- **Então** a alternativa de devolução é oferecida antes (art. 6º §2º)

**AC-PEC-014-3 — a eliminação tem trilha própria**

- **Dado** uma eliminação executada
- **Quando** é auditada
- **Então** existe trilha da própria eliminação, distinta da trilha de uso, resguardando
  intimidade e sigilo (art. 6º §3º)

Interpretação do Owner (2026-09-01): para esta rodada, o critério é aceito pela prova executável
negativa de que uma proposta de eliminação persiste uma disposição própria com estado bloqueado
e não emite comando SQL de exclusão. A futura eliminação real continua desabilitada até um
provedor PAdES-LTA real
demonstrar preservação; quando habilitada, deverá produzir a trilha positiva distinta exigida
acima. Esta aceitação não afirma que uma eliminação real já ocorreu.

**AC-PEC-014-4 — DPO aprova o lote**

- **Dado** uma eliminação em lote
- **Quando** é submetida
- **Então** exige aprovação do DPO — nenhuma eliminação automática sem ato humano identificado

**AC-PEC-014-5 — casos especiais saem do lote automático**

- **Dado** prontuário de menor de idade, ou com junta/processo em curso
- **Quando** a elegibilidade é avaliada
- **Então** é excluído do lote e marcado para revisão jurídica caso a caso

**AC-PEC-014-6 — o responsável pela guarda está definido antes de qualquer eliminação**

- **Dado** o regime de retenção
- **Quando** o processo é implantado
- **Então** está definido quem guarda — clínica, DETRAN ou plataforma — e como se dá a
  preservação criptográfica de longo prazo; enquanto isso é pendência (DT-023), nenhuma
  eliminação deve ser executada

## Regras aplicáveis

- (fonte pendente) — nenhuma `RN-PEC` dedicada a retenção hoje; item de validação jurídica
  prioritária nº 3 do dossiê (`_intake/research-dossier.md` §5) — candidato direto a uma nova
  `RN-PEC-1xx` a produzir por LEGAL, incluindo a definição de **quem** é o responsável pelo prazo
  de 20 anos (PEC/DETRAN-AM/clínica).
