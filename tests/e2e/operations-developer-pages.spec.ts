import {
  EXAMPLE_BLOB,
  registerSolutionPageTests,
  type SolutionPageSpec,
} from './solution-page-suite';

const PAGES: SolutionPageSpec[] = [
  {
    path: '/operations-agents/',
    h1: 'Operations agents',
    eyebrow: 'SOLUTIONS · OPERATIONS',
    positioning: 'Agents that handle the busywork around your team — with a human on the risky steps.',
    scenarios: [
      {
        name: 'Use the MCP tools you already run',
        packages: ['@oribos/mcp-client', '@oribos/core/tools'],
        example: 'mcp-tools',
        docs: '/docs/concepts/tools/',
      },
      {
        name: 'Put a human on the risky step',
        packages: ['@oribos/core/durable-agent', '@oribos/sqlite'],
        example: 'durable-approval',
        docs: '/docs/concepts/suspend-resume/',
      },
      {
        name: 'Wake on a schedule or a signal',
        packages: [
          '@oribos/core/schedules',
          '@oribos/croner',
          '@oribos/background-tasks',
        ],
        example: 'cron-schedule',
        docs: '/docs/guides/signals-desk/',
      },
    ],
    architecture: {
      nodes: [
        'Cron, signal, or webhook',
        'Agent',
        'MCP tools',
        'Approval gate',
        'Snapshot store',
      ],
      edgeLabels: ['Where the human sits', 'Delivery semantics'],
      toolsText: 'Approval is a decision on the run, not an inbox.',
      gateText: 'at-least-once',
      caption:
        'Reference architecture, not a deployment diagram. Oribos runs no worker; the trigger endpoint and the snapshot store are yours.',
    },
    packages: [
      '@oribos/core',
      '@oribos/mcp-client',
      '@oribos/background-tasks',
      '@oribos/distributed-signals',
      '@oribos/sqlite',
    ],
    boundaries: [
      'Not an always-on worker',
      'Not a workflow SaaS',
      'Not a replacement for your operations tooling',
    ],
    examples: ['mcp-tools', 'durable-approval', 'cron-schedule'],
    code: {
      filename: 'examples/cron-schedule/src/index.ts',
      sourceHref: `${EXAMPLE_BLOB}/cron-schedule/src/index.ts#L114-L120`,
      lines: 7,
      contains: [
        "const definition = cron('0 9 * * *', { timezone: 'Asia/Shanghai' });",
        'const record = await schedules.save({',
        "target: { agent: 'reporter', input: 'write the daily report' },",
      ],
    },
    faqs: [
      'Does this need a worker running all the time?',
      'What happens when the process dies mid-run?',
      'Do I have to move my operations tools into Oribos?',
    ],
    cta: 'Put an agent on the busywork.',
  },
  {
    path: '/developer-infrastructure/',
    h1: 'Developer infrastructure',
    eyebrow: 'SOLUTIONS · DEVELOPER INFRASTRUCTURE',
    positioning: 'Ship primitives other teams build on — each team installs only what it uses.',
    scenarios: [
      {
        name: 'Primitives, not a platform',
        packages: ['@oribos/core', '@oribos/core/agent', '@oribos/core/tools'],
        example: 'minimal-agent',
        docs: '/docs/reference/import-map/',
      },
      {
        name: 'Trace into the stack you already run',
        packages: ['@oribos/core/observability', '@oribos/otlp', '@oribos/otel-bridge'],
        example: 'otlp-collector',
        docs: '/docs/concepts/observability/',
      },
      {
        name: 'Publish an agent as shared infrastructure',
        packages: ['@oribos/mcp-server', '@oribos/mcp-client'],
        example: 'mcp-tools',
        docs: '/docs/concepts/tools/',
      },
    ],
    architecture: {
      nodes: ['Product teams', 'Core subpaths', 'Capability packages', 'MCP endpoint'],
      edgeLabels: ['Traces through @oribos/otlp', 'Your collector'],
      toolsText: 'GenAI semantic conventions',
      gateText: 'Your OTLP collector',
      caption:
        'Reference architecture, not a deployment diagram. The collector, version policy, and release cadence belong to the platform team.',
    },
    packages: [
      '@oribos/core',
      '@oribos/otlp',
      '@oribos/otel-bridge',
      '@oribos/mcp-server',
    ],
    boundaries: [
      'Not a hosted platform',
      'Not a replacement for your observability stack',
      'Not a monolith',
    ],
    examples: ['minimal-agent', 'otlp-collector', 'mcp-tools'],
    code: {
      filename: 'examples/otlp-collector/src/index.ts',
      sourceHref: `${EXAMPLE_BLOB}/otlp-collector/src/index.ts#L220-L230`,
      lines: 11,
      contains: [
        'const tracer = createTracer({ exporters: [exporter] });',
        'const app = createApp({ tracer });',
        'tools: { checkOrder: checkOrderTool() },',
      ],
    },
    faqs: [
      'Do product teams have to adopt the whole framework?',
      'Does Oribos provide a dashboard for traces?',
      'Where does the platform boundary sit?',
    ],
    cta: 'Give every team the same small surface.',
  },
];

registerSolutionPageTests(PAGES);
