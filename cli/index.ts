import { parseArgs } from 'node:util';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import {
  type SupportedFramework,
  type TargetHarness,
  SUPPORTED_FRAMEWORKS,
  TARGET_HARNESSES,
  isSupportedFramework,
  isTargetHarness,
} from './types.js';
import { runInstallation } from './installer.js';

export async function runCli(): Promise<void> {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      all: { type: 'boolean', short: 'a' },
      frameworks: { type: 'string', short: 'f' },
      target: { type: 'string', short: 't' },
      yes: { type: 'boolean', short: 'y' },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
${pc.bold('Awesome SDET CLI')} — Zero-config SDET skills & MCP installer

${pc.cyan('Usage:')}
  npx github:burakkaygusuz/awesome-sdet init [options]

${pc.cyan('Options:')}
  -a, --all             Install all frameworks (${SUPPORTED_FRAMEWORKS.join(', ')})
  -f, --frameworks      Comma-separated frameworks (cypress,selenium,vibium,appium)
  -t, --target          Target AI harness (${TARGET_HARNESSES.join(', ')})
  -y, --yes             Skip confirmation prompt
  -h, --help            Show this help message
`);
    return;
  }

  p.intro(`${pc.bgCyan(pc.black(' awesome-sdet '))} Enterprise Test Automation Suite`);

  let selectedFrameworks: SupportedFramework[];

  if (values.all) {
    selectedFrameworks = [...SUPPORTED_FRAMEWORKS];
  } else if (values.frameworks) {
    const rawList = values.frameworks.split(',').map((f) => f.trim().toLowerCase());
    const validFrameworks: SupportedFramework[] = [];
    const invalidFrameworks: string[] = [];

    for (const item of rawList) {
      if (isSupportedFramework(item)) {
        if (!validFrameworks.includes(item)) {
          validFrameworks.push(item);
        }
      } else {
        invalidFrameworks.push(item);
      }
    }

    if (invalidFrameworks.length > 0) {
      p.cancel(
        `Invalid framework(s): ${pc.red(invalidFrameworks.join(', '))}. ` +
          `Supported frameworks are: ${pc.cyan(SUPPORTED_FRAMEWORKS.join(', '))}`
      );
      process.exit(1);
      return;
    }

    if (validFrameworks.length === 0) {
      p.cancel('No valid frameworks specified.');
      process.exit(1);
      return;
    }

    selectedFrameworks = validFrameworks;
  } else {
    const choice = await p.multiselect<SupportedFramework>({
      message: 'Select test automation frameworks to install:',
      options: [
        { value: 'cypress', label: 'Cypress', hint: 'Web E2E, Component & Network (11 skills)' },
        { value: 'selenium', label: 'Selenium', hint: 'WebDriver BiDi & Grid (11 skills)' },
        { value: 'vibium', label: 'Vibium', hint: 'AI-Native & Sense-Think-Act (5 skills)' },
        { value: 'appium', label: 'Appium', hint: 'Mobile Native iOS & Android (5 skills)' },
      ],
      initialValues: ['cypress', 'selenium', 'vibium', 'appium'],
      required: true,
    });

    if (p.isCancel(choice)) {
      p.cancel('Installation cancelled.');
      process.exit(0);
      return;
    }
    selectedFrameworks = choice;
  }

  let selectedTargets: TargetHarness[] = ['all'];
  if (values.target) {
    const rawTargets = values.target.split(',').map((t) => t.trim().toLowerCase());
    const validTargets: TargetHarness[] = [];
    const invalidTargets: string[] = [];

    for (const t of rawTargets) {
      if (isTargetHarness(t)) {
        if (!validTargets.includes(t)) {
          validTargets.push(t);
        }
      } else {
        invalidTargets.push(t);
      }
    }

    if (invalidTargets.length > 0) {
      p.cancel(
        `Invalid target harness(es): ${pc.red(invalidTargets.join(', '))}. ` +
          `Supported harnesses are: ${pc.cyan(TARGET_HARNESSES.join(', '))}`
      );
      process.exit(1);
      return;
    }

    selectedTargets = validTargets;
  }

  const s = p.spinner();
  s.start('Installing SDET skills, specialist agents, and MCP configurations...');

  try {
    const result = await runInstallation({
      frameworks: selectedFrameworks,
      targets: selectedTargets,
      destDir: process.cwd(),
      yes: values.yes,
    });

    s.stop(
      `Successfully installed ${pc.green(result.skillsCopied + ' skills')} and ${pc.green(result.agentsCopied + ' agents')}!`
    );

    p.note(
      `1. Universal Directives: ${pc.cyan('AGENTS.md')}\n` +
        `2. Skills Registry:     ${pc.cyan('.agents/skills/')}\n` +
        `3. MCP Configurations:  ${pc.cyan(result.configsUpdated.join(', '))}`,
      'Installed Assets'
    );

    p.outro(
      pc.green(
        'Setup complete! Your AI coding assistant is now equipped with enterprise SDET capabilities.'
      )
    );
  } catch (error: unknown) {
    s.stop(pc.red('Installation failed.'));
    const message = error instanceof Error ? error.message : String(error);
    p.cancel(`Error during installation: ${message}`);
    process.exit(1);
    return;
  }
}
