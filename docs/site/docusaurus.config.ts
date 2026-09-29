import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'DETRAN',
  tagline: 'Documentação do DETRAN.',
  favicon: 'img/favicon.svg',
  url: 'https://aarusso-nyx.github.io',
  baseUrl: '/detran/',
  organizationName: 'aarusso-nyx',
  projectName: 'detran',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'throw',
      onBrokenMarkdownImages: 'throw',
    },
  },
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'DETRAN',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentação',
        },
        { to: '/docs/adopters', label: 'Manuais', position: 'left' },
        { to: '/docs/framework', label: 'Arquitetura', position: 'left' },
        { to: '/docs/reference', label: 'Referências', position: 'left' },
        {
          href: 'https://github.com/aarusso-nyx/detran',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Governança',
          items: [
            { label: 'Constituição', to: '/docs/reference/law' },
            { label: 'Decisões de arquitetura', to: '/docs/meta/adr' },
            { label: 'Segurança', to: '/docs/meta/security' },
          ],
        },
        {
          title: 'Engenharia',
          items: [
            { label: 'Comece aqui', to: '/docs/start' },
            { label: 'Contratos', to: '/docs/framework/contracts' },
            { label: 'Operações', to: '/docs/meta/ops' },
          ],
        },
      ],
      copyright: 'DETRAN herda a governança do DEVAI e a plataforma do STYNX.',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
