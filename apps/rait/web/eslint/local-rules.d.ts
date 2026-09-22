// Declaração de tipos do plugin ESLint local `rait` (contrato CTG-0002c §6): `allowJs` não é
// ligado, então o typecheck dos specs de `RuleTester` (`src/app/lint/*.spec.ts`) consome esta
// declaração, que cobre tanto o plugin (default) quanto os dois objetos de regra nomeados.
import type { ESLint, Rule } from 'eslint';

export declare const noClientDeadlineMath: Rule.RuleModule;
export declare const noStaticTokenI18nKey: Rule.RuleModule;

declare const plugin: ESLint.Plugin;
export default plugin;
