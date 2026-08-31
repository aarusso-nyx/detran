---
id: UC-BOAT-008
title: Parceiro de saúde credenciado submete dado de sinistro/vítima
status: reviewed
apps: [boat]
sources: [REF-CONTRAN-808-2020, WF-BOAT-002]
updated: 2026-08-26
---

## Ator e objetivo

Um parceiro facultativo já credenciado (secretaria de saúde estadual/municipal, SAMU, corpo de
bombeiros ou polícia civil — CTB/Res. 808/2020 art. 6º §1º, II-IV) submete dado de sinistro ou de
vítima ao DETRAN-AM, que o concilia com o registro BOAT correspondente, quando existir.

## Pré-condições

Parceiro em estado `CREDENCIADO`/`APTO_SUBMISSAO` de [WF-BOAT-002] — convênio/credenciamento já
formalizado com o DETRAN-AM (via órgão estadual, art. 6º §5º).

## Fluxo principal

1. Parceiro submete dado de sinistro/vítima ao canal disponibilizado pelo DETRAN-AM — formato de
   payload não normado nesta rodada (**PROPOSTA OPERACIONAL**, ver [WF-BOAT-002]).
2. Processing-operator do DETRAN-AM recebe a submissão e tenta conciliá-la com um `CrashRecord`
   existente, por chave natural (uf, município, instante, órgão) — mesma chave usada na submissão
   nacional RENAEST.
3. **Caso haja correspondência**: dado do parceiro complementa `CrashVictim`/`CrashPerson` do
   registro já aberto (ex.: destino hospitalar, evolução clínica) — sujeito ao mesmo controle de
   acesso reforçado de [RN-BOAT-003], independentemente da origem do dado.
4. **Caso não haja correspondência**: processing-operator decide, conforme critério de produto
   ainda não fixado, entre abrir novo `CrashRecord` com origem=parceiro ou registrar a submissão
   como pendente de conciliação manual.
5. Processing-operator confirma a incorporação; submissão do parceiro move a `INCORPORADO_
REGISTRO_EXISTENTE` ou `NOVO_REGISTRO_ORIGEM_PARCEIRO` ([WF-BOAT-002]).

## Fluxos alternativos / exceções

- **2a. Conciliação ambígua.** Mais de um `CrashRecord` compatível com a chave natural: fluxo
  exige decisão manual do processing-operator — nenhuma regra de desempate normada.
- **Dado de saúde sensível.** Todo dado clínico recebido do parceiro observa a minimização
  reforçada do art. 18 da Portaria SENATRAN 139/2025 — visão validada/resumida por padrão, acesso
  ao dado bruto apenas em caráter excepcional.

## Pós-condições

Dado do parceiro incorporado (a um registro existente ou a um novo registro), sob o mesmo regime
de controle de acesso de dado sensível de vítima já vigente em BOAT.

## Critérios de aceitação

**AC-BOAT-008-1 — o parceiro nunca acessa o BOAT diretamente**

- **Dado** um parceiro facultativo credenciado
- **Quando** submete dado
- **Então** a integração ocorre **através do DETRAN-AM** ([RN-BOAT-112], Res. 808/2020 art. 6º §5º)
  — não existe credencial de parceiro com acesso direto ao registro estadual

**AC-BOAT-008-2 — a integração de parceiro é facultativa, e o sistema não a pressupõe**

- **Dado** um sinistro qualquer
- **Quando** percorre seu ciclo
- **Então** nenhuma etapa depende de submissão de parceiro ([RN-BOAT-112]) — o nível de parceiro é
  fonte adicional, jamais caminho obrigatório

**AC-BOAT-008-3 — compartilhar dado de saúde com parceiro é o caso mais sensível do domínio**

- **Dado** uma conciliação que exponha dado de vítima a parceiro de saúde
- **Quando** ocorre
- **Então** opera sob o regime público↔público do art. 26 da LGPD com finalidade específica
  declarada ([RN-BOAT-128]), envia **validação em vez de dado bruto** onde possível
  ([RN-BOAT-124]), e cada exposição é auditada ([RN-BOAT-126])

**AC-BOAT-008-4 — o DETRAN-AM age como hub estadual, e isso tem consequência de papel**

- **Dado** dado recebido de parceiro
- **Quando** é conciliado
- **Então** o DETRAN-AM figura como **controlador do registro estadual** ([RN-BOAT-127],
  [RN-BOAT-113]) — a divergência da Portaria 139/2025 art.7º §3º está registrada como pendência
  (DT-048) e não é resolvida em código

**AC-BOAT-008-5 — conciliação nunca sobrescreve o registro de campo em silêncio**

- **Dado** dado de parceiro que conflita com o registro do agente
- **Quando** a conciliação ocorre
- **Então** ambos são preservados com origem identificada e a divergência é explícita ao operador

## Regras aplicáveis

- [RN-BOAT-003] (controle de acesso reforçado, qualquer origem do dado de vítima)
- [RN-BOAT-105] (Coordenador de RENAEST — incentiva a integração de parceiros, entre suas
  atribuições)
- [RN-BOAT-112] (natureza facultativa da integração de parceiro e mediação pelo DETRAN estadual)

## Nota de escopo (decisão do Owner)

Este UC depende de adesão institucional externa ao DETRAN-AM (o parceiro precisa optar por
integrar, art. 6º §1º/§3º) — não é fluxo que a engenharia do BOAT possa "ligar" isoladamente. Ver
handoff BPO em `_intake/bpo-notes.md`.
