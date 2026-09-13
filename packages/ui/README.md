# @detran/ui

Shared Angular 22 application foundation for TEAT, RAIT, PORTAL, DASHBOARD and BOAT.
It composes the registry-pinned STYNX Angular packages; it does not replace them or
define product screens.

```ts
bootstrapApplication(AppComponent, {
  providers: [provideDetranAuthenticatedApp({ angular, oidc, tenancy })],
});
```

Import `@detran/ui/styles` once at the application root. The kit supplies a responsive
top-bar/side-nav shell, breadcrumbs, Portuguese-first empty/loading/error states, theme
tokens, and re-exports STYNX table/pagination/toast primitives and i18n pipes.
