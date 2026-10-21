# C8 — revisão independente Inspector da compatibilidade histórica

O Inspector não escreveu o verificador nem o mapa de compatibilidade. Os 19 testes passaram, sem skips/TODO, contra os arquivos cujos hashes acompanham este relatório. O log completo registra duração aproximada de 215 segundos; várias negativas verificam os 1.073 arquivos selados antes de atingir o controle atacado.

## Resultado e limite de integração

A árvore real de C5–C8 ainda tem uma linha em `record/proofs/work/generic/R-0037.jsonl`. O CLI atual retorna código 1 com `APPEND_CURRENT_HASH_UNAPPROVED`: isso é a recusa esperada até integrar a fonte autêntica aprovada do PR207. **O resultado dos testes não significa que essa árvore real passou na verificação de integração.** Não foi aplicada uma cópia manual de prova no checkout real para obter aprovação.

A positiva foi executada numa cópia temporária completa da custódia, com os bytes autênticos de duas linhas lidos do commit `173ab167ad39e314f5e2d7eaea84bab27a162a52`. Somente o append exato é aceito: uma linha antiga, alteração do prefixo, terceira linha, mudança de sequência/round, commit/blob/hash/path de fonte falso ou autoridade inventada são recusados. O teste da árvore real aceita somente observar a aprovação da versão exata ou a recusa da versão original; nunca aceita uma terceira variante.

## Controles exercitados

- Vínculos dos 19 encerramentos e das 14 ausências: remoção, duplicidade, nova identidade, fonte trocada ou reconstrução sem fonte são recusadas.
- Fonte: commit, objeto Git, hash, bytes atuais e ausência de symlink são verificados separadamente.
- R0017: a mutação histórica continua finding; não pode ser dispensada ou receber árvores inventadas.
- Preservação: referência e quantidade de 1.073 fontes, prefixo completo, ordem/identidade/hash de cada entrada, legado e capturas diagnósticas permanecem obrigatórios.
- Cópias temporárias com cadeia reordenada, fonte histórica alterada, legado com bytes alterados ou captura removida falham. Nenhum arquivo real foi adulterado.
- Uma cauda sintética não verificada, apenas em diretório descartável, continua marcada `governed_tail_requires_native_verification: true`, sem leitura emitida ou veredicto nativo substituído. Isso testa a fronteira, não cria evidência real.

A positiva mantém `supplementary-map-verified-with-recorded-gaps`, `native_readings_issued: false` e `native_verdict_replaced: false`; preserva R0036 `closed:PC-0022` e os findings de ADR legado, mutação e registros ausentes. Não declara reparados os predicados nativos, a conformidade histórica ou qualquer cauda nova da cadeia. A verificação nativa oficial permanece exigida.

## Correções das fixtures e preservação

As primeiras execuções das novas fixtures falharam porque a cópia estava incompleta (ADR legado e contexto R0017) e precisava normalizar o caminho temporário real no macOS. Foram corrigidos somente os builders das fixtures; nenhuma assertion ou controle de produção foi relaxado. Os logs dessas falhas foram preservados compactados. Uma execução anterior foi interrompida quando o contrato de fonte mudou para incluir o append expressamente aprovado; nenhum resultado daquela versão é atribuído à versão final.

O Inspector alterou apenas os testes e este relatório/logs. Não executou mutações Git, gravação de evidências, alteração de proofs, históricos, thresholds, runtime, permissões ou retenção. As operações Git dos testes são apenas show/log/rev-parse/cat-file, inclusive nas fixtures via cópia do ponteiro Git de leitura.

## Reprodução na CI limpa

O verificador e os testes dependem de objetos Git fixos: baseline `92be0db44f9cc111ec9369f2fb81c5f6bd1efa1c` e commit autêntico do append `173ab167ad39e314f5e2d7eaea84bab27a162a52`. O banco de objetos comum local contém ambos. Um checkout raso padrão de uma execução nova não demonstra essa disponibilidade. O job que executar C8 deve carregar o histórico necessário e preservar a alcançabilidade do commit autêntico, por integração com ancestralidade ou fetch explícito da fonte autêntica. O checkout completo de outro job não compartilha seus objetos automaticamente. Não há fallback que dispense fonte ou hashes quando o objeto faltar. A reprodução num checkout limpo continua parte da aceitação de integração do maestro.
