# Delivery review — CTG-0004a / ciclo 4 final focal

## Veredito

**FAIL** — seis findings abertos: quatro `high` e dois `medium`.

O REVIEWER CODEX independente permaneceu somente leitura, reproduziu os três specs focais em
`18/18 PASS`, confirmou `git diff --check`, HEAD
`408ab438fdd940eed6bd46296daad0a141d5a222` e o product candidate digest
`f1c61d9ad8adfdb8dabdfbec7904f1fd7c989fc9dfda1140b08d2131377cf787`.

## Findings

- `CTG4A-R2-F001` (`high`): login sem evento UI; callback usa detecção de rota plana incompatível
  com a árvore lazy; destinos ready/blocked/sem turno incompletos.
- `CTG4A-R2-F004` (`high`): submit real da AIT Review envia `{}` sem contexto, descarta resultado;
  operações remotas seguem nominais e persistência ainda fabrica fatos.
- `CTG4A-R2-F005` (`medium`): entrada direta em D-05/BOAT sem URL segura retorna `/`, não
  `/auth-login`.
- `CTG4A-R2-F006` (`medium`): warning é duplicado a cada avaliação e apresentado como erro interno
  por ausência de chave canônica.
- `CTG4A-R2-F008` (`high`): conflito não compara payload/payloadJson e `get` + `put` não é atômico.
- `CTG4A-R2-F009` (`high`): sensores planos/mocados não detectam os cinco defeitos materiais.

## Aceito

- F002 fechado: primeiro cursor, reuso, snake_case e 404 canônico.
- F003/F007 sem regressão direta: normativo/impressão, providers root e adapters fail-closed.

Nenhuma suíte ampla, build, instalação ou mutação Git foi executada pelo REVIEWER.
