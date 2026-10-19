# R-0036 — integração, atestação e encerramento

O PR #202 foi integrado em `6f07295b60a51022b9de1d3e3bdebd9bcd48c2b1` após
os checks obrigatórios verdes. A CI principal da main, execução 39273060556,
concluiu com sucesso, incluindo o backend remoto. A execução independente
39285749403 aprovou a atestação local, com vínculo **exact-commit** e árvore
`8a500678e2c1fff79a37c4131e3f0eef88775170`.

- [PR #202](https://github.com/aarusso-nyx/detran/pull/202).
- [CI da main](https://github.com/aarusso-nyx/detran/actions/runs/39273060556).
- [Atestação independente](https://github.com/aarusso-nyx/detran/actions/runs/39285749403).
- Tag oficial: `devai-local-evidence/8a500678e2c1fff79a37c4131e3f0eef88775170`.
- Recibos: `pr202.json`, `main-ci.json`, `attestation-ci.json`,
  `verification-summary.json`, `export-receipt.json`, `publish-receipt.json`.

## Evidências e tentativas preservadas

A cadeia canônica mantém o prefixo integral de 142 registros da main anterior.
A cadeia original completa da avaliação tem 323 registros preservados no arquivo
de custódia; as duas histórias retêm 330 registros originais distintos. Os commits,
as linhas originais de R-0036 e a cadeia legada permanecem preservados. A custódia
e seus hashes estão em `../pr202-reconciliation-20261019/`.

A primeira tentativa local falhou por `socket hang up` em
`portal-requests.e2e.spec.ts`, com uma segunda falha dependente do pedido ausente.
Ela não gerou atestação. A suíte completa foi repetida em uma árvore limpa do mesmo
commit e passou, incluindo os casos do portal, atualização e contratos do adaptador.
A exportação seguinte recusou o caminho simbólico da chave; o mesmo material de
assinatura foi acessado pelo caminho físico, mantendo a verificação de caminhos.
O DEVAI validou o reuso dos resultados e exportou o pacote, publicado e verificado
pelo fluxo oficial. Os logs das tentativas são retidos nos diretórios locais da
sessão, com identidades em `attempts.json`.

O verificador remoto exigia o hash de proveniência DEVAI 2.4.0
`fc79da07d4d4dfa466548337a4944ae1b7e0bfdcf2f1c334b341bb1ad477cd4d`;
a variável do repositório ainda tinha `302161f378e54d0a2b14b743a68577f4bfc43a147a1f17568941e08e14e767a0`.
A variável foi corrigida somente após validar o pacote publicado, seus hashes,
identidade da release e população de 26 arquivos. Os controles do workflow não
foram removidos. A execução antiga que falhou permanece no histórico do GitHub.

## Resultado e escopo do fechamento

A avaliação permanece congelada em `e9e45a4a6cbed5cfd394c716c79a55b1aca386b8`:
**43 medidos, zero parciais/bloqueados; 24 PASS, 10 REVIEW, 9 FAIL, zero UNKNOWN,
dois N/A; resultado geral FAIL**. CI e atestação validam seus escopos declarados;
não são uma nova medição do scorecard nem aprovação de prontidão do produto.

BL-0002 a BL-0012 foram resolvidos como lacunas de medição. BL-0013 a BL-0023
permanecem abertos e byte a byte inalterados, conforme
`product-backlog-preserved.json`. Encerrar a avaliação não resolve essas tarefas,
não inicia implementação, não publica o produto e não altera limiares.

O encerramento e o selo devem ser emitidos pelos verbos oficiais DEVAI; o número
PC, o registro de fechamento e os recibos desses verbos são a autoridade sobre o
estado da rodada. Este relatório registra fatos e escopo, sem substituir os verbos.
