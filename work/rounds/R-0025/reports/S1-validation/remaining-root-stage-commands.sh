set -e
pnpm verify:parameter-catalogue
pnpm --filter @detran/ui build
pnpm --filter @detran/boat-mobile build
pnpm typecheck
pnpm --filter @detran/ui test
pnpm verify:decorators
pnpm verify:rls-ddl
pnpm verify:role-catalog
pnpm verify:lifecycle-vocabulary
pnpm verify:senatran-boundary
pnpm verify:senatran-contracts
pnpm verify:pec-parity
pnpm verify:pec-superset
pnpm --filter @detran/portal-web lint
pnpm --filter @detran/portal-web test
pnpm --filter @detran/portal-web build
pnpm --filter @detran/dashboard-web lint
pnpm --filter @detran/dashboard-web test
pnpm --filter @detran/dashboard-web build
pnpm --filter @detran/teat-mobile lint
pnpm --filter @detran/teat-mobile test
pnpm --filter @detran/teat-mobile build
pnpm --filter @detran/teat-web lint
pnpm --filter @detran/teat-web test
pnpm --filter @detran/teat-web build
pnpm --filter @detran/boat-mobile lint
pnpm --filter @detran/boat-mobile test
pnpm --filter @detran/boat-mobile build
pnpm --filter @detran/rait-web lint
pnpm --filter @detran/rait-web test
pnpm --filter @detran/rait-web build
