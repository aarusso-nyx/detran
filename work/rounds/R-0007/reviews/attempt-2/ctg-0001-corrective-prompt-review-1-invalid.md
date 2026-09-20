# Saída técnica inválida — prompt-review corretivo CTG-0001 ciclo 1

A ponte rejeitou a resposta do reviewer por JSON inválido (`exit 4`); não existe veredito válido e
este evento não abre novo ciclo. O fragmento recuperado identificou um achado acionável:

- TASK-0002 não lia a API TypeScript real de `@detran/inf-deadlines`; o documento arquitetural
  contém assinaturas históricas divergentes. O Inspector poderia codificar uma porta inexistente e
  repetir a incompatibilidade entre mocks e runtime.

Correção a absorver antes do retry técnico: incluir `src/index.ts`, `types.ts`, `engine.ts` e
`timer-catalog.ts` do pacote na leitura de TASK-0002; declarar que a API entregue prevalece para
assinaturas; fixar no contrato os métodos usados por `remit`, `extend` e `expire`.

Erro da ponte preservado: `SyntaxError: The input should contain exactly one expression`; a saída
bruta foi descartada pelo próprio bridge e nenhum JSON parcial foi promovido.
