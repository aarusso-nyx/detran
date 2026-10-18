// R-0036: compose existing application rules at their original relative roots.
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import boat from './apps/boat/mobile/eslint.config.js';
import dashboard from './apps/dashboard/web/eslint.config.js';
import portal from './apps/portal/web/eslint.config.js';
import rait from './apps/rait/web/eslint.config.js';
import teatMobile from './apps/teat/mobile/eslint.config.js';
import teatWeb from './apps/teat/web/eslint.config.js';
import mock from './senatran-mock/eslint.config.js';

const at = (basePath, configs) =>
  configs.map((config) => ({ ...config, basePath }));

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.angular/**',
      '.devai/**',
      'record/**',
      'work/**',
      'docs/**',
      'scratch/**',
      'graft/**',
    ],
  },
  ...at('backend', [...tseslint.configs.recommended, prettier]),
  ...at('packages', [...tseslint.configs.recommended, prettier]),
  ...at('apps/boat/mobile', boat),
  ...at('apps/dashboard/web', dashboard),
  ...at('apps/portal/web', portal),
  ...at('apps/rait/web', rait),
  ...at('apps/teat/mobile', teatMobile),
  ...at('apps/teat/web', teatWeb),
  ...at('senatran-mock', mock),
];
