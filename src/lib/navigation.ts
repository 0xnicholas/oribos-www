export interface NavLink {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
  badge?: string;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
}

export interface NavMenu {
  id: string;
  label: string;
  columns: 1 | 2 | 3;
  groups: NavGroup[];
}

export type HeaderItem =
  | { type: 'link'; link: NavLink }
  | { type: 'menu'; menu: NavMenu };

export const GITHUB_URL = 'https://github.com/0xnicholas/oribos-framework';
export const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`;
export const GET_STARTED_URL = '/docs/get-started/quickstart/';
export const TALK_TO_US_URL = '/fde-support/';

const docsLink: NavLink = { label: 'Docs', href: '/docs/' };
const examplesLink: NavLink = { label: 'Examples', href: '/docs/guides/examples/' };
const packageSurfaceLink: NavLink = {
  label: 'Package surface',
  href: '/docs/reference/import-map/',
};
const githubLink: NavLink = { label: 'GitHub', href: GITHUB_URL, external: true };
const templatesLink: NavLink = {
  label: 'Templates',
  href: '/templates/',
  description: 'Runnable starting points from the examples.',
};
const changelogLink: NavLink = {
  label: 'Changelog',
  href: '/changelog/',
  description: 'Curated release history, newest first.',
};
const platformLink: NavLink = {
  label: 'Platform',
  href: '/platform/',
  badge: 'Planned',
};

const framework: NavMenu = {
  id: 'menu-framework',
  label: 'Framework',
  columns: 3,
  groups: [
    {
      label: 'Framework',
      links: [
        {
          label: 'Overview',
          href: '/ai-agent-framework/',
          description: 'The framework, the package surface, and the proof.',
        },
      ],
    },
    {
      label: 'Build',
      links: [
        {
          label: 'Agents',
          href: '/ai-agents/',
          description: 'Stateful agents with tools, memory, and MCP.',
        },
        {
          label: 'Workflows',
          href: '/ai-workflows/',
          description: 'Typed steps, suspend and resume, durable runs.',
        },
      ],
    },
    {
      label: 'Operate',
      links: [
        {
          label: 'Observability',
          href: '/ai-agent-observability/',
          description: 'Traces, spans, OTLP, and the OpenTelemetry bridge.',
        },
      ],
    },
  ],
};

const fdeSupport: NavMenu = {
  id: 'menu-fde-support',
  label: 'FDE + Support',
  columns: 2,
  groups: [
    {
      label: 'Engagement',
      links: [
        {
          label: 'FDE',
          href: TALK_TO_US_URL,
          description: 'Forward-deployed engineering for the first production agent.',
        },
      ],
    },
    {
      label: 'Help',
      links: [
        {
          label: 'Support',
          href: `${TALK_TO_US_URL}#support`,
          description: 'Best-effort help through GitHub Issues. No SLA.',
        },
      ],
    },
  ],
};

const solutions: NavMenu = {
  id: 'menu-solutions',
  label: 'Solutions',
  columns: 3,
  groups: [
    {
      label: 'Product',
      links: [
        {
          label: 'Customer-facing agents',
          href: '/customer-facing-agents/',
          description: 'Answer users and act inside your product.',
        },
      ],
    },
    {
      label: 'Operations',
      links: [
        {
          label: 'Operations agents',
          href: '/operations-agents/',
          description: 'Automate team busywork with a human on risky steps.',
        },
        {
          label: 'Developer infrastructure',
          href: '/developer-infrastructure/',
          description: 'Ship primitives other teams build on.',
        },
      ],
    },
    {
      label: 'Revenue',
      links: [
        {
          label: 'Sales agents',
          href: '/sales-agents/',
          description: 'Research and follow-up with a human on every CRM write.',
        },
        {
          label: 'Marketing agents',
          href: '/marketing-agents/',
          description: 'Draft and check campaigns with no auto-publish.',
        },
      ],
    },
  ],
};

const resources: NavMenu = {
  id: 'menu-resources',
  label: 'Resources',
  columns: 2,
  groups: [
    { label: 'Discover', links: [templatesLink] },
    { label: 'Releases', links: [changelogLink] },
  ],
};

export const PRIMARY_NAV: HeaderItem[] = [
  { type: 'menu', menu: framework },
  { type: 'link', link: platformLink },
  { type: 'menu', menu: fdeSupport },
  { type: 'menu', menu: solutions },
  { type: 'menu', menu: resources },
  { type: 'link', link: docsLink },
  { type: 'link', link: githubLink },
];

export const FOOTER_GROUPS: NavGroup[] = [
  {
    label: 'Developers',
    links: [docsLink, examplesLink, packageSurfaceLink, githubLink],
  },
  {
    label: 'Resources',
    links: [templatesLink, changelogLink],
  },
  {
    label: 'Company',
    links: [
      { label: 'About', href: '/about/' },
      { label: 'FDE + Support', href: TALK_TO_US_URL },
      { label: 'Privacy', href: '/privacy-policy/' },
      { label: 'Terms', href: '/terms-of-service/' },
    ],
  },
];

export const LEGAL_LINKS: NavLink[] = [
  { label: 'License', href: LICENSE_URL, external: true },
  githubLink,
];
