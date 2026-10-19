# C-0004 — implementação de C2–C8

Status: autorizada pelo Owner em 2026-10-19; execução humana coordenada por agentes via ADR-0022. Sem regulador experimental autônomo. Campanha distinta da R-0036 encerrada e do runtime RAIT.

## Mandato

O Owner autorizou executar todas as ações necessárias em código, testes, documentação, CI, ambiente e GitHub para completar C2–C8. Decisões de Owner usam a recomendação registrada até retorno explícito ao console ou 2026-10-20T02:30:00Z (limite conservador de cinco horas). Fora dessa janela, a autorização de implementação permanece, mas novas decisões de Owner não são presumidas.

## Guardas

Thresholds não relaxam. Provas, selos e arquivos históricos nunca são reescritos; erratas somente aditivas e com fonte. Nenhum PASS sem observação. Qualquer dependência de reparo no provedor é isolada em seu próprio PR e release, respeitando seus gates. Valores legais ausentes continuam lacunas factuais; delegação de Owner não cria fatos ou fontes. Defaults de finalidade e retenção conservadores são decisões novas, jamais fatos retroativos. Aprovação de campanha não implica prontidão integral do produto.

## Rodadas e entregas

| Pacote | Rodada proposta | Entrega                                                                                       | Dependência                   |
| ------ | --------------- | --------------------------------------------------------------------------------------------- | ----------------------------- |
| C2     | R-0038          | Ferramentas e Angular compatíveis; auditoria completa, sem resíduos críticos/altos conhecidos | C1 integrado                  |
| C3     | R-0039          | Exportação fiel de autorização, contexto e seis rotas públicas; negativos efetivos            | Fontes de política existentes |
| C4     | R-0039          | Registro de dados pessoais com fontes, finalidade, retenção e lacunas nomeadas                | C3 e blueprints               |
| C5     | R-0041          | Modelo de ameaças e contratos normalizados de segurança/robustez                              | C3/C4                         |
| C6     | R-0041          | Vínculos reais dos sete invariantes e entrypoint compatível                                   | Medições existentes           |
| C7     | R-0041          | Ações e concorrência da CI; geração oficial e verificações intactas                           | Provedor compatível           |
| C8     | R-0041          | Compatibilidade histórica aditiva, erros explícitos e recuperação de fontes                   | Selos e provas preservados    |

C3/C4 compartilham uma frente com aceites separados na R-0039; C5–C8 compartilham a R-0041. R-0040 e R-0042–R-0044 eram propostas de alocação, não rodadas abertas.

O reparo de formato do índice terminal, ADR-0053, foi necessário ao fechamento oficial do C1 e antecipa somente essa dependência de C8. PR207 ainda deve passar na CI antes de integração. Não se afirma que a R0037 já está encerrada na main enquanto seu PR não integrar.

## Execução e integração

Fronteiras disjuntas, maestro commita e integra; workers não executam git. Revisão de outra família antes de execução e antes do PR. Rodadas oficiais por frente; merge apenas com checks obrigatórios verdes e reviewer PASS. A fila canônica BL0013, BL0019, BL0020 e BL0022 continua aberta até critérios efetivamente medidos. Relatar medido, implementado e bloqueado separadamente.

## Decisões recomendadas aceitas por delegação

- OD-C4-001: preservar majors atuais (Angular22, Node24, STYNX1.5.3), preferir correções transitivas limitadas a pai/versão; ampliar apenas se incompatibilidade for demonstrada.
- OD-C4-002: não reduzir população de inventário para obter PASS; mock e fixtures são grupos explícitos.
- OD-C4-003: representar condições de autorização em vez de criar grants incondicionais; nenhuma nova permissão por analogia.
- OD-C4-004: dados sem fonte de base/retenção permanecem pendência; não declarar ausência de PII ou inserir registros artificiais.
- OD-C4-005: retirar abstrações de CI opcionais sem benefício demonstrado do caminho crítico, mantendo REVIEW explícito se apropriado.
