import {
  EXAMPLE_BLOB,
  registerSolutionPageTests,
  type SolutionPageSpec,
} from './solution-page-suite';

const PAGES: SolutionPageSpec[] = [
  {
    path: '/sales-agents/',
    h1: 'Sales agents',
    eyebrow: 'SOLUTIONS · SALES',
    positioning: 'Prospect research and follow-up, with a human on every CRM write.',
    scenarios: [
      {
        name: 'Triage an inbound lead',
        packages: ['@oribos/core/signals', '@oribos/core/agent', '@oribos/core/memory'],
        example: 'signals-desk',
        docs: '/docs/guides/signals-desk/',
      },
      {
        name: 'Research the account',
        packages: ['@oribos/mcp-client', '@oribos/core/tools'],
        example: 'mcp-tools',
        docs: '/docs/concepts/tools/',
      },
      {
        name: 'Approve the CRM write',
        packages: ['@oribos/core/durable-agent', '@oribos/sqlite'],
        example: 'durable-approval',
        docs: '/docs/concepts/suspend-resume/',
      },
    ],
    architecture: {
      nodes: [
        'Inbound signal or CRM event',
        'Agent',
        'CRM MCP + research tools',
        'Draft',
        'Approval gate',
        'CRM write-back',
      ],
      edgeLabels: ['Thread memory', 'Human on every write'],
      toolsText: "Memory is the thread's conversation authority",
      gateText: 'application puts every CRM write tool on the approval list.',
      caption:
        'Reference architecture, not a customer story. The CRM, its MCP server, and the research tools remain yours.',
    },
    packages: ['@oribos/core', '@oribos/mcp-client', '@oribos/sqlite'],
    boundaries: [
      'Not a customer story',
      'Not a customer deployment',
      'Not an autonomous CRM writer',
    ],
    examples: ['signals-desk', 'mcp-tools', 'durable-approval'],
    code: {
      filename: 'examples/durable-approval/src/index.ts',
      sourceHref: `${EXAMPLE_BLOB}/durable-approval/src/index.ts#L140-L151`,
      lines: 12,
      contains: [
        "tools: { issueRefund },",
        "const durable = app.durableAgent({ agent, approval: { tools: ['issueRefund'] } });",
      ],
    },
    faqs: [
      'Does the agent write to the CRM on its own?',
      'Do we have to replace our CRM or sales tools?',
      'Is there a customer deployment behind this page?',
    ],
    cta: 'Put a person on the CRM write.',
    boundaryClaims: [
      'not a customer story',
      'does not claim a deployed sales customer',
      "No CRM write executes on the agent's judgment.",
      'The application puts every write tool on the approval list',
    ],
  },
  {
    path: '/marketing-agents/',
    h1: 'Marketing agents',
    eyebrow: 'SOLUTIONS · MARKETING',
    positioning: 'Draft and check campaign content with the tools you already use.',
    scenarios: [
      {
        name: 'Draft a campaign from a brief',
        packages: ['@oribos/core/workflows', '@oribos/model-router'],
        example: 'workflow-approval',
        docs: '/docs/concepts/workflows/',
      },
      {
        name: 'Split one draft into channel variants',
        packages: ['@oribos/background-tasks', '@oribos/core/signals'],
        example: 'background-tasks',
        docs: '/docs/concepts/durable-execution/',
      },
      {
        name: 'Check before a human approves',
        packages: ['@oribos/evals', '@oribos/core/agent'],
        example: 'agent-evals',
        docs: '/docs/concepts/processors/',
      },
    ],
    architecture: {
      nodes: [
        'Brief',
        'Workflow',
        'Model router',
        'Channel drafts',
        'Processor / eval check',
        'Human approval',
      ],
      edgeLabels: ['Tools stay yours', 'No automatic publish'],
      toolsText: 'The CMS, the asset store, and the brand references remain your systems.',
      gateText: 'nothing reaches an external CMS until a person resumes it.',
      caption:
        'Reference architecture, not a customer story. The workflow, the models, and the publish step remain yours.',
    },
    packages: [
      '@oribos/core',
      '@oribos/model-router',
      '@oribos/evals',
      '@oribos/background-tasks',
    ],
    boundaries: [
      'Not a customer story',
      'Not an autonomous publisher',
      'Not a brand-safety guarantee',
    ],
    examples: ['workflow-approval', 'background-tasks', 'agent-evals'],
    code: {
      filename: 'examples/agent-evals/src/index.ts',
      sourceHref: `${EXAMPLE_BLOB}/agent-evals/src/index.ts#L174-L183`,
      lines: 10,
      contains: [
        'createScorerProcessor({',
        'scorers: [focusedStep, progressingStep],',
      ],
    },
    faqs: [
      'Does an approved draft publish itself?',
      'Do evals block a bad draft?',
      'Is this based on a customer deployment?',
    ],
    cta: 'Draft, check, then let a person decide.',
    boundaryClaims: [
      'not a customer story',
      'does not claim a deployed marketing customer',
      "No draft reaches an external CMS on the agent's judgment.",
      'Oribos does not guarantee brand safety',
      'beyond the eval and processor checks your team writes',
    ],
  },
];

registerSolutionPageTests(PAGES);
