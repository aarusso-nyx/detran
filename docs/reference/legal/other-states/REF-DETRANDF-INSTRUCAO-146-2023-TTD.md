---
id: REF-DETRANDF-INSTRUCAO-146-2023-TTD
title: DETRAN-DF — Instrução nº 146/2023, homologa a Tabela de Temporalidade e Destinação de Documentos das atividades-fim (benchmark de prazos de guarda para documentos de trânsito)
orgao: DETRAN-DF (Distrito Federal) — benchmark de outro ente
status: vigente no DF (DODF de 07/03/2023); referência comparativa, sem força normativa no AM
url: https://www.sinj.df.gov.br/sinj/Norma/85fb463e227c47159d86d33414bb7738/Instru_o_146_06_03_2023.html
pdf: REF-DETRANDF-INSTRUCAO-146-2023-DODF.pdf (edição do DODF que publica a tabela; extraído com pdftotext -layout)
apps: [boat, rait, teat, pec]
updated: 2026-09-13
---

# O que este arquivo é

Única tabela de temporalidade de **atividades-fim de um DETRAN** localizada publicamente com
prazos por tipo documental. Serve de **valor de referência** para o Plano de Destinação que a CSAD
do DETRAN-AM ([REF-DETRANAM-PORTARIA-NORMATIVA-015-2026]) precisa produzir (DT-049) e para os
defaults `source_pending` dos parâmetros de retenção.

# Linhas relevantes (código — assunto — fase corrente — fase intermediária — destinação)

| Código  | Assunto                                                                                                                                                                | Corrente                   | Intermediária | Destinação        |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------- | ----------------- |
| 411     | Análise de defesa prévia                                                                                                                                               | 1 ano                      | 4 anos        | Eliminação        |
| 412     | Análise de recurso de infração — JARI ou CONTRANDIFE                                                                                                                   | 1 ano                      | 4 anos        | Eliminação        |
| 421–426 | Advertência; cassação de CNH; cassação da permissão; identificação de condutor infrator; **notificações de autuação e de penalidade**; suspensão do direito de dirigir | 1 ano                      | 4 anos        | Eliminação        |
| 427     | Provisão e requerimento de informações (infrações)                                                                                                                     | 1 ano                      | 2 anos        | Eliminação        |
| 322     | Fiscalização de trânsito e controle de tráfego                                                                                                                         | até a aprovação das contas | 10 anos       | Eliminação        |
| 321     | Logística, execução e apoio a fiscalização                                                                                                                             | até a aprovação das contas | 10 anos       | Eliminação        |
| 331     | Produção e análise estatística de trânsito                                                                                                                             | 2 anos                     | 25 anos       | Guarda permanente |
| 221.1   | Análise de exames de aptidão física e mental                                                                                                                           | 5 anos                     | 5 anos        | Eliminação        |
| 221.2   | Análise de junta médica especial                                                                                                                                       | 5 anos                     | 5 anos        | Eliminação        |
| 401/403 | Normas e regulamentações; registro de ações técnicas                                                                                                                   | enquanto vigorar / 2 anos  | 5 anos        | Guarda permanente |

Não há linha própria para **boletim de acidente/sinistro** nem para **imagens de fiscalização ou
bodycam**; a estatística (331) é de guarda permanente porque é agregada.

# Leitura para o sistema

- Defaults propostos (todos `source_pending=true`, `decision_ref=DT-049`): processo de defesa e
  recurso **5 anos após o encerramento** (411/412: 1 + 4); notificações **5 anos**; AIT e
  evidências de fiscalização **10 anos após a aprovação das contas** (322); BAT identificado
  **5 anos** por analogia a 411/412 com dado de saúde eliminado ou anonimizado ao fim; estatística
  agregada **permanente** (331).
- Coincide com a premissa OD-018 do RAIT ("5 anos após o trânsito") e dá base comparativa à
  cédula do Owner.
