// Lint do app (R-0014 M5; R-0012 M1/M12): flat config com angular-eslint (ts + template recommended),
// typescript-eslint recommended e eslint-config-prettier, mais as regras locais do plugin `rait`
// (`eslint/local-rules.js`, contrato CTG-0002c §6.3): `rait/no-client-deadline-math` em
// `src/**/*.ts` exceto `src/testing/**` (o relógio fixo dos stubs) e `rait/no-static-token-i18n-key`
// em todo `src/**/*.ts` (o verificador de parâmetros varre `src/**`). Padrão que os demais apps copiam.
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import raitRules from './eslint/local-rules.js';

export default defineConfig(
  { ignores: ['dist/**', '.angular/**'] },
  {
    files: ['**/*.ts'],
    extends: [
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
      prettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'rait', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'rait', style: 'camelCase' },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['src/testing/**'],
    plugins: { rait: raitRules },
    rules: { 'rait/no-client-deadline-math': 'error' },
  },
  {
    files: ['src/**/*.ts'],
    plugins: { rait: raitRules },
    rules: { 'rait/no-static-token-i18n-key': 'error' },
  },
  {
    files: ['**/*.spec.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
  },
);
