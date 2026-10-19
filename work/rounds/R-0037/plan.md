# R-0037 — C1: dependências de execução

Status: rodada ativa; sem autorização de merge ou publicação. Base: `2df548e0ac5227abb64b66994f675dea7ba36a5a`.

## Aprovação e objetivo

Owner, nesta conversa: “Aprovo o pacote C1. Execute-o em nova rodada e PR separado, preservando a R-0036 encerrada, os thresholds e os históricos, sem incluir os demais pacotes nem correções incidentais de produto.”

Remediar somente handlebars, proxy-addr, multer, qs e fast-copy nos caminhos de execução identificados em BL-0013. Preservar DEVAI 2.6.3 e STYNX 1.5.3. BL-0013 permanece aberto enquanto houver resíduos fora deste pacote. Nenhuma tarefa C2–C8 autorizada.

## Ondas e entregas

1. Architect: declarar rodada e escopo; Engineer: conferir manifests dos fornecedores e resolver dependências com substituições limitadas a pai e versão, nunca substituição global. Alterações F2 apenas em package.json/pnpm-lock.yaml; código de produto, DDL, permissões e testes permanecem intactos.
2. Inspector: instalação congelada, build/typecheck e testes existentes das fronteiras HTTP/PDF/logging; Auditor: auditoria completa, security_scan com os thresholds atuais e reconciliação dos caminhos removidos/residuais. Não converter o FAIL global em PASS quando houver resíduos de ferramentas.
3. Engineer: PR separado, sem merge. Nova evidência somente pelos verbos oficiais da R-0037; nenhuma alteração da R-0036 ou cadeia legada.

## Aceitação

- Zero advisories críticos/altos nos cinco caminhos tratados; relatar também moderados/baixos e resíduos de outros pais.
- Reproduzir instalação com lockfile congelado; conferir STYNX pin e binding DEVAI.
- Executar builds, typecheck e suítes pertinentes. Todos os checks obrigatórios devem passar antes de qualquer integração, que não está autorizada neste pacote.
- Hashes dos arquivos da R-0036, thresholds/configuração e backlog iguais à base. Provas antigas intactas, cadeia legada idêntica; cadeia governada apenas com novos apêndices oficiais.

## Bloqueios

Parar a parte dependente se exigir mudança de plataforma, contrato público, DDL, permissão, versão incompatível ou correção incidental de produto. Registrar evidência e adendo proposto; não editar irmãos, relaxar teste, threshold ou gate.

## Retomada

Usar a branch codex/c1-runtime-dependencies-r0037; conferir HEAD e relatórios antes de continuar. A R-0036 continua encerrada em PC-0022. Fechamento da R-0037 exige o fluxo oficial e evidência de integração; não inferir de um PR aberto.

## Leitura

AGENTS.md; constituição artigos 6, 7 e 32; manifests e contratos publicados de @stynx-nyx/pdf/logging 1.5.3; manifests Nest/Express; diagnóstico aprovado em work/planning/2026-10-19-security-remediation-diagnostic/APPROVAL-PACKETS.md no checkout principal (somente C1).
