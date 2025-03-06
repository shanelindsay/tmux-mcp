import { exec as execCallback } from "child_process";
import { promisify } from "util";

const exec = promisify(execCallback);

// Basic interfaces for tmux objects
export interface TmuxSession {
  id: string;
  name: string;
  attached: boolean;
  windows: number;
}

export interface TmuxWindow {
  id: string;
  name: string;
  active: boolean;
  sessionId: string;
}

export interface TmuxPane {
  id: string;
  windowId: string;
  active: boolean;
  height: number;
  width: number;
}

/**
 * Execute a tmux command and return the result
 */
export async function executeTmux(command: string): Promise<string> {
  try {
    const { stdout } = await exec(`tmux ${command}`);
    return stdout.trim();
  } catch (error: any) {
    console.error(`Tmux command failed: ${command}`, error.message);
    throw new Error(`Failed to execute tmux command: ${error.message}`);
  }
}

/**
 * Check if tmux server is running
 */
export async function isTmuxRunning(): Promise<boolean> {
  try {
    await executeTmux("list-sessions -F '#{session_name}'");
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * List all tmux sessions
 */
export async function listSessions(): Promise<TmuxSession[]> {
  const format = "#{session_id}:#{session_name}:#{?session_attached,1,0}:#{session_windows}";
  const output = await executeTmux(`list-sessions -F '${format}'`);

  if (!output) return [];

  return output.split('\n').map(line => {
    const [id, name, attached, windows] = line.split(':');
    return {
      id,
      name,
      attached: attached === '1',
      windows: parseInt(windows, 10)
    };
  });
}

/**
 * Find a session by name
 */
export async function findSessionByName(name: string): Promise<TmuxSession | null> {
  try {
    const sessions = await listSessions();
    return sessions.find(session => session.name === name) || null;
  } catch (error) {
    return null;
  }
}

/**
 * List windows in a session
 */
export async function listWindows(sessionId: string): Promise<TmuxWindow[]> {
  const format = "#{window_id}:#{window_name}:#{?window_active,1,0}";
  const output = await executeTmux(`list-windows -t ${sessionId} -F '${format}'`);

  if (!output) return [];

  return output.split('\n').map(line => {
    const [id, name, active] = line.split(':');
    return {
      id,
      name,
      active: active === '1',
      sessionId
    };
  });
}

/**
 * List panes in a window
 */
export async function listPanes(windowId: string): Promise<TmuxPane[]> {
  const format = "#{pane_id}:#{?pane_active,1,0}:#{pane_height}:#{pane_width}";
  const output = await executeTmux(`list-panes -t ${windowId} -F '${format}'`);

  if (!output) return [];

  return output.split('\n').map(line => {
    const [id, active, height, width] = line.split(':');
    return {
      id,
      windowId,
      active: active === '1',
      height: parseInt(height, 10),
      width: parseInt(width, 10)
    };
  });
}

/**
 * Capture content from a specific pane
 */
export async function capturePaneContent(paneId: string): Promise<string> {
  return executeTmux(`capture-pane -p -t "${paneId}"`);
}

/**
 * Create a new tmux session
 */
export async function createSession(name: string): Promise<TmuxSession | null> {
  await executeTmux(`new-session -d -s "${name}"`);
  return findSessionByName(name);
}

/**
 * Create a new window in a session
 */
export async function createWindow(sessionId: string, name: string): Promise<TmuxWindow | null> {
  const output = await executeTmux(`new-window -t ${sessionId} -n "${name}"`);
  const windows = await listWindows(sessionId);
  return windows.find(window => window.name === name) || null;
}
