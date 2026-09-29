---
id: IU-PEC-C-09
title: Solicitação e aprovação dupla de adendo
status: draft
apps: [pec]
sources: [IU-PEC-001]
updated: 2026-09-29
---

# Solicitação e aprovação dupla de adendo

Papel: Architect (transcrição).

## Fonte, identidade e fronteira

- Fontes fechadas: [IU-PEC-001], [UC-PEC-007] e [RN-PEC-001].
- Rota proposta: `/clinico/laudos/:id/adendo`; participam supervisor, administração da clínica e profissional médico ou psicólogo conforme a etapa publicada.
- As operações publicadas criam o adendo, registram as aprovações e assinam após ambas.

## Contrato transcrito

- Supervisor e administração da clínica fazem aprovações distintas; a assinatura é posterior às duas aprovações.
- A tela não antecipa aprovação, assinatura ou estado que pertença ao servidor.
- Se o provedor exigido estiver ausente, a assinatura falha fechada e não emite documento.

## Estados e proteção

- Laudo, adendo e aprovações são sensíveis e respeitam tenant e autorização do servidor.
- Vazio, erro e carregamento são explícitos; não há sucesso simulado.
