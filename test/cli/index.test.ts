import * as p from '@clack/prompts';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import { runCli } from '../../cli/index.js';
import * as installer from '../../cli/installer.js';

vi.mock('@clack/prompts');
vi.mock('../../cli/installer.js');

describe('CLI Workflow & Argument Runner (runCli)', () => {
  let exitSpy: MockInstance;
  let consoleLogSpy: MockInstance;

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.mocked(p.spinner).mockReturnValue({
      start: vi.fn(),
      stop: vi.fn(),
      message: vi.fn(),
      cancel: vi.fn(),
      error: vi.fn(),
      clear: vi.fn(),
      isCancelled: false,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    exitSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('should display help and return without executing installation when -h is passed', async () => {
    process.argv = ['node', 'bin.js', '-h'];
    await runCli();

    expect.soft(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Awesome SDET CLI'));
    expect.soft(installer.runInstallation).not.toHaveBeenCalled();
  });

  it('should install all frameworks when -a/--all is provided', async () => {
    process.argv = ['node', 'bin.js', '--all'];
    vi.mocked(installer.runInstallation).mockResolvedValue({
      skillsCopied: 32,
      agentsCopied: 5,
      configsUpdated: ['.mcp.json'],
    });

    await runCli();

    expect.soft(installer.runInstallation).toHaveBeenCalledWith(
      expect.objectContaining({
        frameworks: ['cypress', 'selenium', 'vibium', 'appium'],
        targets: ['all'],
      })
    );
  });

  it('should parse comma-separated frameworks case-insensitively and trim spaces', async () => {
    process.argv = ['node', 'bin.js', '-f', 'cypress, SELENIUM , vibium'];
    vi.mocked(installer.runInstallation).mockResolvedValue({
      skillsCopied: 27,
      agentsCopied: 4,
      configsUpdated: ['.mcp.json'],
    });

    await runCli();

    expect.soft(installer.runInstallation).toHaveBeenCalledWith(
      expect.objectContaining({
        frameworks: ['cypress', 'selenium', 'vibium'],
      })
    );
  });

  it('should terminate with exit code 1 when an invalid framework is specified', async () => {
    process.argv = ['node', 'bin.js', '-f', 'cypress,unknown_framework'];
    await runCli();

    expect.soft(p.cancel).toHaveBeenCalledWith(expect.stringContaining('Invalid framework(s):'));
    expect.soft(exitSpy).toHaveBeenCalledWith(1);
    expect.soft(installer.runInstallation).not.toHaveBeenCalled();
  });

  it('should route target harness flags properly', async () => {
    process.argv = ['node', 'bin.js', '-a', '-t', 'claude,codex'];
    vi.mocked(installer.runInstallation).mockResolvedValue({
      skillsCopied: 32,
      agentsCopied: 5,
      configsUpdated: ['.mcp.json', '.codex/config.toml'],
    });

    await runCli();

    expect.soft(installer.runInstallation).toHaveBeenCalledWith(
      expect.objectContaining({
        frameworks: ['cypress', 'selenium', 'vibium', 'appium'],
        targets: ['claude', 'codex'],
      })
    );
  });

  it('should terminate with exit code 1 when an invalid target harness is specified', async () => {
    process.argv = ['node', 'bin.js', '-a', '-t', 'invalid_harness'];
    await runCli();

    expect
      .soft(p.cancel)
      .toHaveBeenCalledWith(expect.stringContaining('Invalid target harness(es):'));
    expect.soft(exitSpy).toHaveBeenCalledWith(1);
    expect.soft(installer.runInstallation).not.toHaveBeenCalled();
  });

  it('should handle interactive selection and execute installation', async () => {
    process.argv = ['node', 'bin.js'];
    vi.mocked(p.multiselect).mockResolvedValue(['cypress', 'vibium']);
    vi.mocked(p.isCancel).mockReturnValue(false);
    vi.mocked(installer.runInstallation).mockResolvedValue({
      skillsCopied: 16,
      agentsCopied: 3,
      configsUpdated: ['.mcp.json'],
    });

    await runCli();

    expect.soft(installer.runInstallation).toHaveBeenCalledWith(
      expect.objectContaining({
        frameworks: ['cypress', 'vibium'],
      })
    );
  });

  it('should handle interactive cancellation gracefully with exit code 0', async () => {
    process.argv = ['node', 'bin.js'];
    vi.mocked(p.multiselect).mockResolvedValue(Symbol('clack:cancel') as never);
    vi.mocked(p.isCancel).mockReturnValue(true);

    await runCli();

    expect.soft(p.cancel).toHaveBeenCalledWith('Installation cancelled.');
    expect.soft(exitSpy).toHaveBeenCalledWith(0);
    expect.soft(installer.runInstallation).not.toHaveBeenCalled();
  });

  it('should catch installer errors, display cancel message, and exit with code 1', async () => {
    process.argv = ['node', 'bin.js', '--all'];
    vi.mocked(installer.runInstallation).mockRejectedValue(new Error('Permission denied'));

    await runCli();

    expect.soft(p.cancel).toHaveBeenCalledWith(expect.stringContaining('Permission denied'));
    expect.soft(exitSpy).toHaveBeenCalledWith(1);
  });
});
