---
id: USER-DOCS-CONVENTION
title: Convenção de documentação de usuário
status: reviewed
apps: [rait, teat, boat, portal, dashboard, pec]
updated: 2026-09-29
---

# Convenção de documentação de usuário

Fonte: C-0002 §3.5–§3.6, plano R-0030, anexo
`work/rounds/R-0030/availability-manifest.schema.md` e ADR-0011. O manifesto de
disponibilidade descreve o código integrado; a ficha de produto descreve a intenção.
Em divergência, o texto de usuário não promete a intenção como capacidade entregue.

## 1. IA e caminhos

Os manuais ficam em `docs/adopters/manuais/<perfil>/`, com índice em
`docs/adopters/manuais/index.md`, FAQ único em `docs/adopters/manuais/faq.md` e
glossário em `docs/adopters/manuais/glossario.md`. A seção é **Adotantes** na IA de
sete seções de `docs/_ia/categories.json`; `docs/roles/` permanece reservado aos
papéis constitucionais dos agentes. **OD-UD-001 foi resolvida pelo Owner em
2026-09-29:** o caminho `docs/adopters/manuais/` permanece na seção Adotantes.
Os perfis `clinico` e `regulatorio` entram em R-0031.

Cada superfície tem um arquivo
`docs/framework/arch/availability/<surface>.availability.json`, validado pelo
esquema `docs/framework/schemas/availability-manifest.schema.json`. As seis
superfícies de R-0030 são `rait-web`, `dashboard-web`, `portal-web`, `boat`,
`teat-web` e `teat-mobile`. `pec-web` é acrescentada em R-0031.

## 2. Perfis e papéis

Cada um dos 36 códigos de `DETRAN_ROLES` em
`backend/domains/shared/src/roles.ts` pertence a exatamente um perfil. O gate lê o
catálogo e acusa código ausente, adicional ou duplicado; papel novo exige OD
(ADR-0034). `profiles` da rota é o conjunto derivado de `roles`, sem repetição.
Rotas `publico` ou `cidadao` incluem `cidadao`, mesmo sem papel; `roles` vazio
só é admitido para `publico`.

| Perfil                 | Rótulo                               | Papéis canônicos                                                                                                                          |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `cidadao`              | Cidadão                              | `CIDADAO`, `CANDIDATO`                                                                                                                    |
| `agente-transito`      | Agente de trânsito                   | `field-agent`, `field-supervisor`                                                                                                         |
| `colegiado-secretaria` | JARI, CETRAN e secretaria            | `rait-analyst`, `rait-coordinator`, `rait-secretary`, `rait-signing-authority`, `rait-central-authority`, `rait-rapporteur`, `rait-chair` |
| `operador`             | Operador                             | `processing-operator`, `traffic-authority`, `integration-operator`, `dash-operator`                                                       |
| `gestor`               | Gestor e painel de monitoramento     | `rait-manager`, `rait-hr`, `rait-finance`, `GESTOR_DETRAN`, `dash-duty-owner`, `bi-analyst`                                               |
| `auditor-dpo`          | Auditor e encarregado de dados (DPO) | `AUDITOR`, `DPO`                                                                                                                          |
| `administrador`        | Administrador                        | `agency-admin`, `technical-admin`, `ADMIN`, `SUPORTE`                                                                                     |
| `clinico`              | Clínica credenciada (PEC)            | `RECEPCAO`, `TECNICO_BIOMETRIA`, `MEDICO`, `PSICOLOGO`, `SUPERVISOR`, `ADMIN_CLINICA`                                                     |
| `regulatorio`          | Junta e CETRAN (PEC)                 | `JUNTA`, `CETRAN`, `GESTOR`                                                                                                               |

Nenhuma rota de R-0030 usa `clinico` ou `regulatorio` antes de R-0031.

## 3. Anatomia de página e bloco de rota

Cada manual por perfil tem front matter `id: MAN-<PERFIL>-<n>`, `title`,
`status`, `perfil`, `superficies` e `updated`. `perfil` usa exatamente o código
da tabela §2; `superficies` lista apenas as superfícies cobertas. A página tem
orientação inicial, navegação por tarefa e um bloco para cada rota `kind: tela`
cujo `profiles` inclui o perfil. Rotas `auxiliar` constam apenas do manifesto.

O cabeçalho do bloco usa âncora explícita `<a id="rota-<surface>-<slug>"></a>`.
Derive `slug` do `path` canônico: retire a barra inicial, remova `:` de
parâmetros, substitua `/` por `-`; para `path: ""`, use `home`. Assim, a rota
`casos/:id/resumo` de `rait-web` usa `rota-rait-web-casos-id-resumo`. Não
deduza o slug de título traduzido, ficha ou componente. Colisão de âncoras é
erro de cobertura.

Cada bloco contém, nesta ordem: **Para que serve**, **Quem acessa**,
**Como fazer**, **Estados e mensagens**, **Prazos (como direito)** e **Selo**.
Identifique a rota e a superfície junto ao cabeçalho. Descreva ações do
manifesto e alternativas de indisponibilidade sem prometer ação que o código
não executa. Se não há prazo aplicável ou fonte fechada, diga isso sem
inventar número. O selo aparece pelo rótulo exato do §4. Uma rota partilhada
aparece no manual de cada perfil derivado.

## 4. Selos de disponibilidade

| `seal`                      | Rótulo no manual          | `decision`                | Coerência exigida                                                                                      |
| --------------------------- | ------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `disponivel`                | Disponível                | `null`                    | `level: L2`, todas as ações `disponivel`, sem marcador de indisponibilidade nos arquivos de evidência. |
| `parcial`                   | Parcial                   | OD/DT existente           | `level: L1` ou `L2`; alguma ação não disponível, ou `L1` sem ações.                                    |
| `homologacao`               | Em homologação            | `ADR-0033` para TEAT/BOAT | Rota só de homologação ou app limitado à homologação pela ADR. Não representa operação de campo.       |
| `indisponivel_nesta_versao` | Indisponível nesta versão | OD existente              | `level: L0`; a rota resolve para a página de indisponibilidade da superfície.                          |
| `bloqueado_por_decisao`     | Bloqueado por decisão     | DT/OD existente           | Tela construída mostra esse estado e cita o mesmo id.                                                  |

O gate verifica o selo da rota e das ações, os arquivos de evidência e a
decisão. `L0` sem OD é erro. Para `homologacao`, a ADR-0033 delimita TEAT e
BOAT; isso não transforma uma simulação em ato jurídico.

Marcadores iniciais fechados para R-0030 (§6.1 do anexo), inspecionados no
conteúdo de cada `evidence.files` e no destino da rota:

| Superfície                        | Marcadores                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `rait-web`, `dashboard-web`       | Identificador com sufixo `CommandUnavailableError`, qualquer prefixo; página `unavailable.page`.     |
| `portal-web`                      | Código `PORTAL.SERVICE_UNAVAILABLE`; rota `servico-indisponivel/:serviceKey`.                        |
| `teat-mobile`, `teat-web`, `boat` | Adaptador cujo identificador casa com `Unavailable*Adapter`; erro `printer-hardware-source-pending`. |
| `pec-web`                         | `source_pending`: R-0031 deve fechar os marcadores no mesmo formato antes das telas PEC.             |

O marcador encontrado numa dependência de uma ação impede classificá-la como
`disponivel`; não classifique uma rota inteira como indisponível só por texto
incidental em um arquivo alheio ao seu caminho. O contrato CTG-0001 fixa a
checagem por AST e por evidência, com falha fechada se a relação não puder ser
demonstrada.

## 5. FAQ e glossário

O FAQ é um único arquivo versionado com seções por perfil. O gate
`docs:user:check` cobre **todo** o arquivo, inclusive as seções internas que
não são publicadas. A seção pública do cidadão é delimitada literalmente por
`<!-- public:cidadao:start -->` e `<!-- public:cidadao:end -->`; somente o
conteúdo entre o par entra na projeção pública. O par deve aparecer exatamente
uma vez, nessa ordem, sem aninhamento. Marcador ausente, duplicado ou
malformado exclui `faq.md` inteiro do site. A projeção fica fechada até
TASK-0013 escrever os marcadores. OD-UD-002 rege a ampliação de publicação.

O glossário de usuário explica termos usados nas telas em linguagem pt-BR.
Termos jurídicos e técnicos conservam a grafia canônica e citam a fonte
`REF-*`, o catálogo de domínio ou o catálogo i18n quando necessário. Não
confunda o glossário de usuário com `law/glossary/` ou as fichas de produto.

## 6. Ajuda contextual

Os pontos existentes são o diálogo de atalhos do RAIT, as páginas explicativas
do PORTAL e a rota `context-help` do TEAT mobile. O shell de `@detran/ui` só
recebe ponto de ajuda se R-0024 o oferecer; DASHBOARD, TEAT web e BOAT seguem
OD-UD-004. O manifesto registra `help.entry` (`nenhum`, `atalhos`, `pagina`,
`link`) e `help.key` quando houver rótulo i18n. Uma chave de runtime
`helpBaseUrl` configurada gera URL para o manual publicado e sua âncora;
ausente, inválida ou sem página publicável, o app não renderiza link. Não há
URL implícita ou constante de implantação inventada.

Para MBFT, até OD-UD-003 fechar a fonte por tópico, mostre tópico, âncora do
manual e referência `REF-CONTRAN-985-1003-MBFT`, sem transcrição normativa
`source_pending`. Rótulos novos obedecem à allowlist de i18n e OD-UD-005.

## 7. Publicação

O site publica a projeção de `docs/`, não o texto bruto do repositório
(ADR-0011). **OD-UD-002 foi resolvida pelo Owner em 2026-09-29:** a publicação
é seletiva e inclui somente manual `cidadao`, glossário e o trecho cidadão do
FAQ; manuais internos continuam versionados e cobertos pelo gate, fora do site
público.
O publicador deve filtrar por `perfil` e `status` e falhar fechado se os
marcadores do FAQ não formarem exatamente um par válido. `faq.md` inteiro
permanece excluído até TASK-0013. Índice e links projetados não devem apontar
para uma página excluída.

`status` publicável para manual é `reviewed` ou `approved`, de acordo com
`docs/_ia/publication.json`. `draft` e `stub` não satisfazem U5. O build
continua a falhar por link, âncora ou imagem quebrada (ADR-0011).

## 8. Regras de conteúdo e rastreabilidade

Escreva para a pessoa que executa a tarefa, em pt-BR, com passos observáveis.
Não copie tokens internos para a interface nem declare como disponível uma
capacidade de homologação, `L0` ou `source_pending`. Todo texto de tela citado
entre `«…»` deve ser valor exato do catálogo pt-BR da superfície. Prazos,
percentuais, limites, números legais e parâmetros precisam de `REF-*` ou
chave de parâmetro com fonte. Se a fonte não fixa o valor, registre
`source_pending` ou OD, sem número provisório. Mostre prazo como direito do
usuário: até quando ele pode agir, não uma data prometida pelo sistema.

O manifesto é medido no código: R1–R8 verificam rota, papel, decisão,
operação, arquivo, ficha e estado L0; U1–U5 verificam manual, rótulo,
âncora, citação i18n e front matter. O contrato executável é CTG-0001.

## 9. Herança de R-0031 (PEC)

R-0031 usa esta convenção sem redefinir perfis, selos ou âncoras. Cria
manuais `clinico` e `regulatorio`; as telas do candidato entram em `cidadao`
e as de gestão, auditoria e administração nos perfis correspondentes.
`pec-web.availability.json` cobre os consoles A/B; as P-01…P-07 entram em
`portal-web.availability.json`, conforme ADR-0034. As telas condicionadas de
[IU-PEC-001] §E usam `bloqueado_por_decisao` com DT-021, DT-022 ou DT-023,
conforme a ficha e a decisão aplicável. O manual explica a ação possível
enquanto o valor está pendente. Os requisitos da ADR-0034 §4 valem para o
texto: vocabulário legal de resultado, dossiê integral ao titular, nenhuma
escolha de clínica, nível de assinatura visível e prazo como direito. O gate
de R-0031 passa a cobrir nove perfis e só aceita marcadores PEC fechados.
