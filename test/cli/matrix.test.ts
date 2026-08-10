import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  getAgentsForFrameworks,
  getSkillsForFrameworks,
  getSkillsForFrameworksAsync,
} from '../../cli/matrix.js';
import { SUPPORTED_FRAMEWORKS, isSupportedFramework } from '../../cli/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

describe('CLI Framework Matrix & Types', () => {
  describe('isSupportedFramework Type Guard', () => {
    it('should validate all supported frameworks correctly', () => {
      for (const fw of SUPPORTED_FRAMEWORKS) {
        expect.soft(isSupportedFramework(fw)).toBe(true);
      }
    });

    it('should reject unsupported or invalid framework names', () => {
      expect.soft(isSupportedFramework('playwright')).toBe(false);
      expect.soft(isSupportedFramework('jest')).toBe(false);
      expect.soft(isSupportedFramework('webdriverio')).toBe(false);
      expect.soft(isSupportedFramework('')).toBe(false);
      expect.soft(isSupportedFramework(null)).toBe(false);
      expect.soft(isSupportedFramework(undefined)).toBe(false);
      expect.soft(isSupportedFramework(123)).toBe(false);
    });
  });

  describe('Skill & Agent Mapping', () => {
    it('should map Cypress to exactly its skills and specialist agent', async () => {
      const skills = await getSkillsForFrameworksAsync(['cypress'], SKILLS_DIR);
      expect.soft(skills.length).toBe(11);
      expect.soft(skills.every((s) => s.startsWith('cypress-'))).toBe(true);

      const agents = getAgentsForFrameworks(['cypress']);
      expect.soft(agents).toEqual(['agents/sdet.agent.md', 'agents/cypress/cypress.agent.md']);
    });

    it('should map Selenium to exactly its skills and specialist agent', async () => {
      const skills = await getSkillsForFrameworksAsync(['selenium'], SKILLS_DIR);
      expect.soft(skills.length).toBe(11);
      expect.soft(skills.every((s) => s.startsWith('selenium-'))).toBe(true);

      const agents = getAgentsForFrameworks(['selenium']);
      expect.soft(agents).toEqual(['agents/sdet.agent.md', 'agents/selenium/selenium.agent.md']);
    });

    it('should map Vibium to exactly its skills and specialist agent', async () => {
      const skills = await getSkillsForFrameworksAsync(['vibium'], SKILLS_DIR);
      expect.soft(skills.length).toBe(5);
      expect.soft(skills.every((s) => s.startsWith('vibium-'))).toBe(true);

      const agents = getAgentsForFrameworks(['vibium']);
      expect.soft(agents).toEqual(['agents/sdet.agent.md', 'agents/vibium/vibium.agent.md']);
    });

    it('should map Appium to exactly its skills and specialist agent', async () => {
      const skills = await getSkillsForFrameworksAsync(['appium'], SKILLS_DIR);
      expect.soft(skills.length).toBe(5);
      expect.soft(skills.every((s) => s.startsWith('appium-'))).toBe(true);

      const agents = getAgentsForFrameworks(['appium']);
      expect.soft(agents).toEqual(['agents/sdet.agent.md', 'agents/appium/appium.agent.md']);
    });

    it('should map all 4 frameworks to all 32 skills and all 5 agents', async () => {
      const skills = await getSkillsForFrameworksAsync(
        ['cypress', 'selenium', 'vibium', 'appium'],
        SKILLS_DIR
      );
      expect.soft(skills.length).toBe(32);

      const agents = getAgentsForFrameworks(['cypress', 'selenium', 'vibium', 'appium']);
      expect.soft(agents.length).toBe(5);
      expect.soft(agents).toContain('agents/sdet.agent.md');
      expect.soft(agents).toContain('agents/cypress/cypress.agent.md');
      expect.soft(agents).toContain('agents/selenium/selenium.agent.md');
      expect.soft(agents).toContain('agents/vibium/vibium.agent.md');
      expect.soft(agents).toContain('agents/appium/appium.agent.md');
    });

    it('should return empty skills and universal sdet agent when no frameworks are specified', async () => {
      const skills = await getSkillsForFrameworksAsync([], SKILLS_DIR);
      expect.soft(skills).toEqual([]);

      const agents = getAgentsForFrameworks([]);
      expect.soft(agents).toEqual(['agents/sdet.agent.md']);
    });

    it('should maintain parity between sync and async discovery', () => {
      const syncSkills = getSkillsForFrameworks(['vibium'], SKILLS_DIR);
      expect.soft(syncSkills.length).toBe(5);
      expect.soft(syncSkills.every((s) => s.startsWith('vibium-'))).toBe(true);
    });
  });
});
