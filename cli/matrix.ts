import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import type { SupportedFramework, FrameworkMetadata } from './types.js';

export const FRAMEWORKS: Readonly<Record<SupportedFramework, FrameworkMetadata>> = {
  cypress: {
    id: 'cypress',
    name: 'Cypress',
    description: 'Web E2E, Component & Network Testing (11 skills + agent)',
    skillPrefix: 'cypress-',
    agentFile: 'agents/cypress/cypress.agent.md',
    tools: ['read_cypress_author_docs', 'read_cypress_network_docs'],
  },
  selenium: {
    id: 'selenium',
    name: 'Selenium',
    description: 'WebDriver BiDi & Enterprise Grid (11 skills + agent)',
    skillPrefix: 'selenium-',
    agentFile: 'agents/selenium/selenium.agent.md',
    tools: ['read_selenium_locators_docs', 'read_selenium_bidi_docs'],
  },
  vibium: {
    id: 'vibium',
    name: 'Vibium',
    description: 'AI-Native & BiDi Sense-Think-Act (5 skills + agent)',
    skillPrefix: 'vibium-',
    agentFile: 'agents/vibium/vibium.agent.md',
    tools: ['read_vibium_core_docs', 'read_vibium_bidi_docs'],
  },
  appium: {
    id: 'appium',
    name: 'Appium',
    description: 'Mobile Native iOS & Android Automation (5 skills + agent)',
    skillPrefix: 'appium-',
    agentFile: 'agents/appium/appium.agent.md',
    tools: ['read_appium_capabilities_docs', 'read_appium_gestures_docs'],
  },
};

export async function getSkillsForFrameworksAsync(
  frameworks: readonly SupportedFramework[],
  skillsRootDir: string
): Promise<string[]> {
  try {
    const entries = await fs.readdir(skillsRootDir, { withFileTypes: true });
    const allSkills = entries.filter((d) => d.isDirectory()).map((d) => d.name);

    const matched = allSkills.filter((skillName) => {
      return frameworks.some(
        (fw) => FRAMEWORKS[fw] && skillName.startsWith(FRAMEWORKS[fw].skillPrefix)
      );
    });
    return Array.from(new Set(matched));
  } catch {
    return [];
  }
}

export function getSkillsForFrameworks(
  frameworks: readonly SupportedFramework[],
  skillsRootDir: string
): string[] {
  if (!fsSync.existsSync(skillsRootDir)) return [];
  try {
    const allSkills = fsSync
      .readdirSync(skillsRootDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const matched = allSkills.filter((skillName) => {
      return frameworks.some(
        (fw) => FRAMEWORKS[fw] && skillName.startsWith(FRAMEWORKS[fw].skillPrefix)
      );
    });
    return Array.from(new Set(matched));
  } catch {
    return [];
  }
}

export function getAgentsForFrameworks(frameworks: readonly SupportedFramework[]): string[] {
  const agents = ['agents/sdet.agent.md'];
  for (const fw of frameworks) {
    if (FRAMEWORKS[fw]) {
      agents.push(FRAMEWORKS[fw].agentFile);
    }
  }
  return Array.from(new Set(agents));
}
