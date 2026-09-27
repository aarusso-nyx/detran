# RC local - CTG-0002

Papel: Engineer (Constitution Art. 6). Candidato publicado e limpo:
`a096e1f163261e3099dd4cfb8b6ee6a1a5c68019`, igual a
`origin/orchestra/local-stack`. `origin/main` (`c848723c1ee9053233b7e08732c5b80bbe06d625`)
e ancestral do candidato.

Comando: `pnpm ci:backend-kernel:local` com `DEVAI_DB_TESTS=1`,
`DETRAN_RC_CONTAINER_RUNTIME=docker`,
`DETRAN_RC_POSTGIS_IMAGE=postgis/postgis@sha256:44126d872ac91993766c341e369c539e8196614321765d36a6f1bab0419a5fa5`,
`DETRAN_RC_POSTGRES_MAJOR=16`, `DETRAN_RC_POSTGIS_VERSION=3.4`.

Resultado: exit 0. A preparacao do banco historico informou
`upgraded legacy fixture: 20 cases and priority schema verified`. A spec
`rait-priority-upgrade.integration.spec.ts` passou 21/21 testes; o e2e do
adapter SENATRAN passou 10/10. Os sensores anteriores de RLS e os testes
backend do runner tambem passaram. O container PostGIS efemero foi removido.

Log bruto local: `/tmp/detran-r17-ctg2-rc.log`, SHA-256
`45df0ffa2d0d61f3a5abe9f20f7dbd7e6ddfa7e6db20a123e1b0a8a993ef485a`.
O log nao contem credenciais reais; o caminho temporario nao e artefato
versionado. A linha positiva da spec e o exit do comando estao registrados
acima para persistencia da prova.
