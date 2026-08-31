---
id: UC-PORTAL-004
title: Proprietário indica o condutor infrator
status: approved
apps: [portal, rait]
sources: [REF-CONTRAN-918, REF-CETRAN-PROCESSO-INTERNO, REF-DECRETO-10543-2020]
updated: 2026-08-26
---

## Revisão BPO (2026-08-24) — confirma nível de assinatura

Rodada CRAWLER (`_intake/research-dossier.md`) confirma, com base normativa federal explícita, que
este ato exige **assinatura eletrônica avançada** (Decreto 10.543/2020 art.4º, II, "f" — "declaração
que constitui reconhecimento de fato ou assunção de obrigação"). O passo 3 abaixo (assinatura
remota gov.br ou upload assinado) já implementava esse nível na prática; agora tem base normativa
citável. Ver a matriz completa em [WF-PORTAL-002]. Nenhuma mudança de fluxo — apenas confirmação.

## Ator e objetivo

Proprietário do veículo (PF/PJ) ou possuidor equiparado (arrendamento/comodato/aluguel ≥180 dias —
[REF-CONTRAN-918] art.8º) indica o condutor que efetivamente praticou a infração, para que a
responsabilidade e a pontuação recaiam sobre o condutor correto.

## Pré-condições

- Autuação visível no PORTAL com prazo de indicação em aberto (formulário acompanha a NA —
  [REF-CONTRAN-918] art.5º _caput_).
- Proprietário autenticado (gov.br) como parte legítima do veículo.

## Fluxo principal

1. Proprietário abre a autuação e escolhe "Indicar condutor".
2. Sistema exibe formulário pré-preenchido com os campos que já conhece (órgão, placa, nº do AIT,
   dados do proprietário) e pede apenas os dados do condutor indicado — conteúdo mínimo dos incisos
   I-X do [REF-CONTRAN-918] art.5º.
3. Sistema oferece dois caminhos de assinatura do condutor indicado: (a) condutor com conta gov.br
   assina remotamente no PORTAL; (b) upload de documento físico assinado por ambas as partes.
4. Antes de confirmar, sistema exibe aviso direto sobre a consequência de indicação irregular: gera
   novos AITs por infração distinta e fica registrada no RENACH para averiguação de reincidência
   ([REF-CONTRAN-918] art.5º §§2º,6º).
5. Proprietário confirma; sistema protocola a indicação e registra a data de protocolo como termo
   inicial da nova contagem de prazo (equivalência digital reconhecida no modelo PR —
   [REF-CETRAN-PROCESSO-INTERNO]).
6. Condutor indicado (se cadastrado no PORTAL) recebe sua própria notificação com os três caminhos
   de resposta (defender-se, indicar outro condutor se aplicável, pagar) — ver [JRN-PORTAL-001].

## Fluxos alternativos / exceções

- **3a.** Condutor indicado não tem conta gov.br: fluxo segue pelo caminho (b), com orientação clara
  de que a assinatura de ambas as partes é obrigatória para validade da indicação.
- **5a.** Assinatura do condutor pendente (fluxo remoto iniciado mas não concluído): indicação fica
  em rascunho, com alerta de prazo, até a segunda assinatura ser coletada.
- **6a.** Indicação recusada por dado incompleto ou incompatível: sistema devolve ao proprietário com
  o campo específico destacado, sem exigir reinício completo do formulário.

## Pós-condições

Nova notificação dirigida ao condutor indicado, com prazo próprio contando do protocolo da
indicação; painel do proprietário (frota, se aplicável) atualizado com o novo status do caso.

## Critérios de aceitação

**AC-PORTAL-004-1 — o formulário pede só o que falta**

- **Dado** uma indicação de condutor
- **Quando** o formulário abre
- **Então** órgão, placa, nº do AIT e dados do proprietário já vêm preenchidos; pede-se apenas o
  condutor ([RN-PORTAL-106])

**AC-PORTAL-004-2 — a assinatura do condutor tem caminho digital real**

- **Dado** um condutor com conta gov.br
- **Quando** assina
- **Então** o faz remotamente no PORTAL, sem exigir documento físico com firma reconhecida
  ([RN-PORTAL-104]) — o upload assinado em papel é alternativa, não o caminho padrão

**AC-PORTAL-004-3 — a consequência da indicação irregular é dita antes, não depois**

- **Dado** a confirmação da indicação
- **Quando** é apresentada
- **Então** o aviso sobre novo AIT por infração distinta e registro no RENACH aparece **antes** do
  ato, de forma direta (CONTRAN-918 art.5º §§2º,6º)

**AC-PORTAL-004-4 — o condutor indicado é notificado com seus caminhos**

- **Dado** um condutor indicado cadastrado
- **Quando** a indicação é protocolada
- **Então** recebe notificação própria com as opções que lhe cabem — aceitar, contestar, ou nada
  fazer, com as consequências de cada uma

## Regras aplicáveis

- [RN-RAIT-002] (conteúdo mínimo, por analogia ao requerimento — aplicação ao formulário de
  indicação)
- [RN-RAIT-005] (contagem de prazos)
