import {
  EXAMPLE_BLOB,
  registerSolutionPageTests,
  type SolutionPageSpec,
} from './solution-page-suite';

const PAGES: SolutionPageSpec[] = [
  {
    path: '/customer-facing-agents/',
    h1: 'Customer-facing agents',
    eyebrow: 'SOLUTIONS · CUSTOMER-FACING',
    positioning: 'Answer your users, act inside your product, hand off to a human.',
    colorScheme: 'dark',
    scenarios: [
      {
        name: 'Answer, streamed into your UI',
        packages: ['@oribos/core/agent', '@oribos/core/memory', '@oribos/ai-sdk'],
        example: 'ai-chat-route',
        docs: '/docs/concepts/agents/',
      },
      {
        name: 'Act, through your own API',
        packages: ['@oribos/core/tools', '@oribos/core/workflows'],
        example: 'workflow-approval',
        docs: '/docs/concepts/tools/',
      },
      {
        name: 'Hand off, with the run on hold',
        packages: ['@oribos/core/durable-agent', '@oribos/sqlite'],
        example: 'durable-approval',
        docs: '/docs/concepts/suspend-resume/',
      },
    ],
    architecture: {
      nodes: ['Host UI', 'AI SDK route', 'Durable agent', 'Memory store'],
      edgeLabels: ['Your API as tools', 'Approval gate'],
      toolsText: 'Endpoints become tools with schemas',
      gateText: 'Nothing executes while the run is suspended.',
      caption:
        'Reference architecture, not a deployment diagram. The host UI, identity, and data model remain yours.',
    },
    packages: [
      '@oribos/core',
      '@oribos/ai-sdk',
      '@oribos/sqlite',
      '@oribos/resumable-stream',
      '@oribos/checkpoints',
    ],
    boundaries: [
      'Not a chat product',
      'Not a hosted service',
      'Not a replacement for your auth or data model',
    ],
    examples: ['ai-chat-route', 'workflow-approval', 'durable-approval'],
    code: {
      filename: 'examples/ai-chat-route/src/index.ts',
      sourceHref: `${EXAMPLE_BLOB}/ai-chat-route/src/index.ts#L97-L104`,
      lines: 8,
      contains: [
        "const durable = app.durableAgent({ agent, approval: { tools: ['issueRefund'] } });",
        'const route = createChatRoute({',
        'identity: () => ({ resource: THREAD.resource }),',
      ],
    },
    faqs: [
      'Do I have to replace my chat UI?',
      'Does Oribos host the agent for me?',
      'Where do authentication and data live?',
    ],
    cta: 'Build it into your app.',
  },
];

registerSolutionPageTests(PAGES);
