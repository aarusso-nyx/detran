---
id: ARCH-PEC-FRONTENDS
title: Arquitetura dos consoles web PEC
status: draft
apps: [pec, portal]
updated: 2026-09-29
---

# Consoles PEC — contrato de implementação

Este blueprint especifica as 12 telas clínicas A e as 7 telas regulatórias B de
[IU-PEC-001] para `apps/pec/web` (`@detran/pec-web`). As sete telas P pertencem
ao Portal em R-0032 (OD-PW-001); esta rodada entrega somente seus contratos e
fixtures. Nenhuma tela PEC está comprovada como artefato de origem. O manifesto
`work/rounds/R-0031/route-manifest.md` é a lista fechada de rotas de UI e
operações HTTP; os contratos versionados `BP-CH-*.commands.openapi.json` e os
CRUDs gerados definem payloads. Nenhuma página chama operação fora dessas
fontes, inventa endpoint ou usa `HttpClient` diretamente.

## Base de montagem e confirmação em O9

O alvo é Angular 22, STYNX e `@detran/ui` conforme ADR-0034, com
`provideDetranAuthenticatedApp`, shell, interceptors de sessão/tenant,
`authGuard`, guardas de permissão, componentes standalone `OnPush`, signals,
facades e clientes gerados de `packages/api-clients`. Tabela, paginação,
banner, carregamento, erro, diálogo e toast reutilizam o kit. O namespace
`pec.` é namespace decidido **somente de i18n** (OD-PW-004), nunca prefixo de
parâmetro. A UI usa mensagens do catálogo; não escreve dados sensíveis em
URL, armazenamento local, log ou telemetria.

R-0024 e `docs/framework/arch/frontend-wiring-pattern.md` ainda não estão em
`origin/main`. Na retomada O9, após sua chegada ao branch, confirmar a API
exata de bootstrap, rotas lazy, facade, cliente gerado, tratamento de erro,
guards, polling e configuração de testes contra esse padrão. O9 materializa o
scaffold, instala as dependências e registra o lockfile antes dos testes da
TASK-0013, conforme `plan.md` §M5. Este blueprint fixa comportamento e
fronteiras; não cria variante local do padrão ausente nem aplicativo nesta
sessão. R-0022 também precisa chegar antes da implementação de assinatura.

## Módulos e fronteiras

| Módulo de UI         | Telas                 | Dependências e responsabilidade                                                                             |
| -------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| Shell e acesso       | Todas                 | Sessão, tenant, navegação, guardas e estados comuns pelo kit; autorização final sempre no servidor.         |
| Agenda e biometria   | C-01–C-04             | Agenda, check-in, falha e exceção. Sorteio é do servidor; captura passa por `BiometricCapturePort`.         |
| Atendimento          | C-05–C-07, C-10, C-12 | Facades de encounter, exames, devolutiva, encerramento e restrição; trilhas médica e psicológica separadas. |
| Laudos               | C-08–C-09             | Emissão, assinatura e adendo com duas aprovações distintas e falha fechada.                                 |
| Transmissões         | C-11                  | Exibição de ACK/erro somente quando existir consulta HTTP contratada no backend.                            |
| Juntas e prazos      | R-01–R-04             | Fila, parecer, recurso e escada de prazos calculada pelo backend. Junta Especial é colegiado distinto.      |
| Rede clínica         | R-05                  | Leitura e comandos existentes de `clinical-network`; ações sem UC bloqueadas (OD-PW-005).                   |
| Auditoria e retenção | R-06–R-07             | Auditoria somente leitura; retenção condicionada e eliminação desabilitada.                                 |

A navegação é uma projeção de `PEC_ROLES` (`roles.ts`) e das chaves de
`DETRAN_POLICY_MATRIX`/`permissionsForRoles` (`policy.ts`), nunca um novo
catálogo de papéis. `ADMIN`, `ADMIN_CLINICA`, `MEDICO`, `PSICOLOGO`,
`RECEPCAO`, `TECNICO_BIOMETRIA`, `AUDITOR`, `GESTOR`, `SUPERVISOR`,
`GESTOR_DETRAN`, `JUNTA`, `CETRAN`, `DPO`, `SUPORTE` e `CANDIDATO` são os 15
códigos existentes; `CANDIDATO` não ganha console A/B nem se confunde com
`CIDADAO` do Portal. Papéis administrativos com `*` seguem a política real,
mas a UI não usa esse atalho para contornar vínculo do recurso, tenant, guarda
de comando ou a restrição `ch:retention:review` exclusiva de `DPO`.

## Rotas A/B e guardas

Cada rota aplica autenticação e a chave indicada para entrada; cada botão e
requisição exige também a chave da operação específica do manifesto. Havendo
várias operações na mesma tela, uma permissão de leitura não concede comando.
`403` esconde a ação e apresenta estado sem permissão; o backend mantém a
decisão autoritativa e o isolamento de tenant. Os papéis abaixo identificam o
ator do inventário, sujeitos à política efetiva.

| Tela | Rota UI                                 | Guarda de entrada / ator efetivo                                                 | Condição especial                                                    |
| ---- | --------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| C-01 | `/clinico/agenda`                       | `ch:appointment:list` · `RECEPCAO`                                               | Polling da consulta existente; distribuição e ordem no servidor.     |
| C-02 | `/clinico/check-in`                     | `ch:biometric:capture` · `TECNICO_BIOMETRIA`                                     | Porta biométrica e homologação visível.                              |
| C-03 | `/clinico/biometria/excecoes/nova`      | `ch:biometric-exception:request` · `TECNICO_BIOMETRIA`                           | Falha explícita; nenhum bypass.                                      |
| C-04 | `/clinico/biometria/excecoes/:id`       | `ch:biometric-exception:approve` · `SUPERVISOR`                                  | Decisão auditável.                                                   |
| C-05 | `/clinico/atendimentos/:id/medico`      | `ch:encounter:read` e `ch:exam:create` · `MEDICO`                                | Taxonomia médica.                                                    |
| C-06 | `/clinico/atendimentos/:id/psicologico` | `ch:encounter:read` e `ch:exam:create` · `PSICOLOGO`                             | Taxonomia psicológica.                                               |
| C-07 | `/clinico/atendimentos/:id/devolutiva`  | `ch:candidate-dossier:feedback-schedule/feedback-complete` · `PSICOLOGO`         | `MEDICO` consta do inventário, mas não tem essas concessões hoje.    |
| C-08 | `/clinico/atendimentos/:id/laudo`       | `ch:report:create` e `ch:biometric:capture` · `MEDICO`/`PSICOLOGO`               | Assinatura fail-closed.                                              |
| C-09 | `/clinico/laudos/:id/adendo`            | `ch:report:addendum-*` por etapa · profissional, `SUPERVISOR`, `ADMIN_CLINICA`   | Aprovações distintas antes da assinatura.                            |
| C-10 | `/clinico/atendimentos/:id/encerrar`    | `ch:encounter:read/close` · `MEDICO`/`PSICOLOGO`                                 | ACK é guarda do backend.                                             |
| C-11 | `/clinico/transmissoes`                 | `ch:transmission:read` · `GESTOR`                                                | Sem GET de ACK/erro contratado; `ADMIN_CLINICA` não tem grant atual. |
| C-12 | `/clinico/atendimentos/:id/resultado`   | `ch:restriction:read/create` e `ch:exam:create` · `MEDICO`                       | `bloqueado_por_decisao` para rótulos residuais (DT-022/OD-PW-002).   |
| R-01 | `/regulatorio/juntas`                   | `ch:junta:list` · `AUDITOR`/`GESTOR`                                             | Criação exige `ch:junta:create`.                                     |
| R-02 | `/regulatorio/juntas/:id/parecer`       | `ch:junta:read/decide` · `JUNTA`                                                 | Parecer do colegiado designado.                                      |
| R-03 | `/regulatorio/juntas/:id/recurso`       | `ch:junta:appeal/designate-special/forward` por etapa · `CETRAN`/`GESTOR_DETRAN` | Junta Especial distinta; conferir grant por comando.                 |
| R-04 | `/regulatorio/juntas/:id/prazos`        | `ch:junta:read` · `JUNTA`/`GESTOR`                                               | `ch:process-parameter:read` só ao gestor; datas vêm do servidor.     |
| R-05 | `/regulatorio/credenciamento`           | `ch:clinic:read`, `ch:professional:read` · `GESTOR_DETRAN`                       | Ação sem UC `bloqueado_por_decisao` (OD-PW-005).                     |
| R-06 | `/regulatorio/auditoria`                | `platform:audit:read` · `AUDITOR`; `ch:operational-control:read` · `GESTOR`      | Somente leitura; `DPO` do inventário não tem grant nesses endpoints. |
| R-07 | `/regulatorio/retencao`                 | `ch:retention:read` · `DPO`; `review` só `DPO`                                   | `bloqueado_por_decisao` (DT-023/OD-PW-002); sem eliminação.          |

Chaves com `/` ou `*` na tabela são abreviações de leitura; a implementação
usa cada chave literal de `policy.ts` e cada operação do manifesto, sem criar
uma permissão agregada. A entrada de C-11 pode mostrar indisponibilidade de
consulta, mas não tenta ler por `POST /v1/ch/transmissions/dispatch` nem pelo
callback. Nenhum navegador chama callback de integração ou RENACH diretamente.
Quando houver uma consulta real, sua rota e contrato devem entrar primeiro no
manifesto e nos clientes; só então C-11 poderá fazer polling de leitura via
`v1/ch/transmissions`. O backend usa `packages/senatran-adapter`.

## Estados de tela e decisões

O contrato de estado de apresentação é `carregando`, `vazio`, `pronto`,
`erro`, `sem_permissao` ou `bloqueado_por_decisao`. O último carrega
obrigatoriamente o ID da decisão (`DT-021`, `DT-022`, `DT-023` ou
`OD-PW-005`), o resíduo legível e a ação desabilitada; não é um token de
estado do domínio. C-12 bloqueia os rótulos/códigos ainda sem fonte além do
mapeamento médico `CONDICIONADO` → “apto com restrições”; R-07 bloqueia a
disposição final; ações de R-05 sem UC ficam bloqueadas. P-01 e P-07 são de
R-0032 e continuam bloqueadas conforme ADR-0034 §5 até OD-PW-002. A ausência
de consulta C-11 é indisponibilidade de contrato, apresentada como erro
explicado, sem inventar dado ou endpoint. `source_pending` identifica prazo,
código, mapeamento ou estado sem fonte. Um erro de assinatura deixa o laudo
não emitido e mostra indisponibilidade explícita.

## Critérios transversais D1–D6

| Critério | Comportamento verificável                                                                                                                                                                                                                                                                                             |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1       | Resultado visível usa apenas “apto”, “apto com restrições”, “inapto temporário” e “inapto” quando há mapeamento confirmado. `CONDICIONADO` e `PENDENTE` nunca surgem no DOM do candidato. O primeiro mapeia só na trilha médica; o segundo é estado de processo. As taxonomias médica e psicológica não são fundidas. |
| D2       | Titular lê o próprio dossiê sem máscara; `SUPORTE` recebe dados mascarados quando autorizado. A ponte de identidade `CIDADAO`→`CANDIDATO` é de R-0032, não uma concessão desta UI.                                                                                                                                    |
| D3       | Agenda e Portal nunca oferecem escolha de clínica ou perito; sob DT-021/P2, região e data seguem ao servidor, que distribui.                                                                                                                                                                                          |
| D4       | Antes da emissão, a UI mostra o nível de assinatura aplicada, avançada ou qualificada, e seu motivo conforme RN-PEC-142; sem política/provedor real disponível, não confirma assinatura nem emite laudo.                                                                                                              |
| D5       | Todo o núcleo é sensível: mínimo necessário por papel, sem dados clínicos em URL, log, cache persistente ou notificação; tenant e RLS no servidor (RN-PEC-150/151).                                                                                                                                                   |
| D6       | Prazo aparece ao candidato como “até quando você pode agir”, derivado do servidor; não se calcula prazo no navegador nem se exibe número sem fonte.                                                                                                                                                                   |

## Portas e atualizações

`BiometricCapturePort` isola captura e validação de presença do navegador e
do provedor. A implementação de homologação só existe no perfil de
homologação e exibe faixa persistente “Homologação — captura biométrica
simulada” em C-02 e C-08. Falha ou ausência de porta nunca vira captura
válida. O driver real está fora de R-0031. Laudos e pareceres usam a política
de documentos da ADR-0018; sem PAdES/TSA/provedor exigido, a operação falha
fechada, sem documento emitido, com estado explícito e sem sucesso simulado.
Os adaptadores de assinatura de `clinical-reports` e `juntas` permanecem sob
R-0022. OD-PW-007 difere envelopes `PEC.*` até caracterização HTTP viável;
o frontend preserva os status e corpos publicados sem supor código novo.

OD-PW-003 mantém polling do padrão para C-01. C-11 só poderá usar o mesmo
polling quando houver consulta HTTP contratada; não se cria stream `ch` nem
SSE local. Frequência, cancelamento e tratamento de erro serão confirmados
com `frontend-wiring-pattern.md` na retomada O9, sem literal de intervalo
inventado. O navegador não calcula fila, prazo, estado RENACH ou retry.
