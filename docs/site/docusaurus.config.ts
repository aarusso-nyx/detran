import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'DETRAN',
  tagline: 'Governed documentation for the DETRAN consolidation runtime.',
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
    defaultLocale: 'en',
    locales: ['en'],
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
          label: 'Documentation',
        },
        { to: '/docs/framework', label: 'Framework', position: 'left' },
        { to: '/docs/reference', label: 'Reference', position: 'left' },
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
          title: 'Authority',
          items: [
            { label: 'Constitution binding', to: '/docs/reference/law' },
            { label: 'Architecture decisions', to: '/docs/meta/adr' },
            { label: 'Security', to: '/docs/meta/security' },
          ],
        },
        {
          title: 'Engineering',
          items: [
            { label: 'Start here', to: '/docs/start' },
            { label: 'Contracts', to: '/docs/framework/contracts' },
            { label: 'Operations', to: '/docs/meta/ops' },
          ],
        },
      ],
      copyright:
        'Built with Docusaurus. DETRAN inherits governance from DEVAI and platform substrate from STYNX.',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
