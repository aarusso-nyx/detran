---
id: IU-PEC-P-07
title: Meus direitos sobre os dados do PEC
status: draft
apps: [portal]
sources: [IU-PEC-001, UC-PEC-014, RN-PEC-150, RN-PEC-151, RN-PEC-153]
updated: 2026-09-30
---

# Meus direitos sobre os dados do PEC

Papel: Architect (transcrição).

## Identidade e rota

Ficha de [IU-PEC-001] §C, tela 07. Módulo `exames`; rota `exames/meus-direitos`. App `portal`.

## Acesso

Consulta de texto/links sob `consulta_exame`; qualquer dado do titular exige autenticação e vínculo.

## Dados e comandos

Apresentar informação de acesso ao próprio dossiê, correção cadastral/factual e diferença entre contestação do juízo pericial e correção cadastral. Eliminação do prontuário não é oferecida: a retenção obrigatória é de 20 anos; explicar a base e limites conforme RN-PEC-153.

Ações de acesso clínico, ciência, devolutiva, correção, exportação ou eliminação não são ativadas por esta ficha. Endpoint de privacidade não está montado (OD-P17); encaminhar apenas por rota/canal efetivamente disponível. Não prometer devolução antes do fim da retenção.

## Estados e conteúdo

Texto e links; carregando; conteúdo indisponível; erro. P-07 permanece bloqueada para ações por OD-PW-002. Não prometer exportação, correção via endpoint ou eliminação ainda indisponíveis.

## Prazo e linguagem

Distinguir o prazo preclusivo da junta, contado pelo dono somente após ciência comprovada, do direito de correção LGPD, que não tem esse prazo de 30 dias. Não inventar prazo público de resposta; indicar que o prazo de resposta depende de definição formal. Explicar bloqueios com ids DT/OD.

## Acesso e proteção

A sessão exige CIDADAO e CPF verificado; a guarda técnica `*` não substitui a identidade cidadã. O vínculo é `portal.entitlement` do titular, criado somente a partir de evento do dono com `subjectCpfHash` correspondente e tenant igual ([RN-PEC-153]; contrato CTG-0002). A falta de vínculo responde como não encontrado; nível insuficiente é negado. O navegador consome somente `v1/portal/*`; não chama `v1/ch/*`.

Dados de saúde são sensíveis ([RN-PEC-150], [RN-PEC-151]). Não persistir em cache, URL, telemetria, logs ou SSE. Estados de carregamento, vazio, falha, sem vínculo, nível insuficiente e indisponibilidade são distintos. Usar componentes do kit, títulos hierárquicos, foco visível, rótulos associados e anúncios acessíveis; atender WCAG 2.1 AA e eMAG ([IU-PEC-001] §D).
