# C6/C7 — revisão Inspector dos contratos de CI

O Inspector não escreveu os workflows nem a geração do verificador. Os dez testes de contrato do arquivo real passaram, sem skips/TODO. Foram verificados YAML com chaves únicas, eventos sem filtro de conteúdo, grupos separados por workflow/ref, supersessão do mesmo candidato, pins imutáveis e convergentes, identidades dos gates existentes, os sete comandos nativos exatos de `test-tasks.json`, produtor incondicional com serviço Postgres isolado e propagação explícita de qualquer resultado não success para foundation.

Também foram verificados o roteamento por árvore exata, a proteção das superfícies de controle, o candidato inerte, os controles carregados da main, a concorrência serializada do verificador gerado, commit/tree/policy/trust obrigatórios e conclusão fail-closed sem fallback remoto interno ao verificador. O fallback remoto do workflow principal continua com a identidade verified-local-rc preservada.

Estes testes leem o YAML e avaliam somente o subconjunto explícito de expressão usado pelos contratos de concorrência e dependências. Não emulam o scheduler do GitHub, a proteção remota de branches ou o êxito dos sete produtores. A validação de sintaxe/política do provedor, os testes reais e a CI remota permanecem obrigatórios.

Durante a leitura visual inicial havia uma duplicação de um trecho env/serviço Postgres. O autor confirmou e reparou esse defeito; o teste estrito de parsing passou após o reparo. Não há alegação de execução RED do parser antes da correção. Nenhuma assertion foi relaxada.

Nenhum workflow, verificador gerado, threshold, runtime, prova ou arquivo histórico foi alterado pelo Inspector. O log completo e os hashes dos arquivos examinados acompanham este relatório.
