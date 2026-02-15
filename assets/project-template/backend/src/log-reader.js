import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const TEAMS_DIR = path.join(CLAUDE_DIR, 'teams');
const TASKS_DIR = path.join(CLAUDE_DIR, 'tasks');
const DEBUG_DIR = path.join(CLAUDE_DIR, 'debug');

function readJsonSafe(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * List all teams by scanning the teams directory.
 */
export function listTeams() {
  if (!fs.existsSync(TEAMS_DIR)) return [];

  const entries = fs.readdirSync(TEAMS_DIR, { withFileTypes: true });
  const teams = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const configPath = path.join(TEAMS_DIR, entry.name, 'config.json');
    const config = readJsonSafe(configPath);
    if (!config) continue;

    // Extract member details from config
    const members = (config.members || []).map((m) => ({
      agentId: m.agentId,
      name: m.name,
      agentType: m.agentType,
      model: m.model,
      color: m.color || null,
      joinedAt: m.joinedAt,
      cwd: m.cwd || null,
      backendType: m.backendType || null,
      prompt: m.prompt || null,
      tmuxPaneId: m.tmuxPaneId || null,
      subscriptions: m.subscriptions || [],
      planModeRequired: m.planModeRequired || false,
    }));

    teams.push({
      name: config.name,
      description: config.description,
      createdAt: config.createdAt,
      leadAgentId: config.leadAgentId,
      leadSessionId: config.leadSessionId || null,
      members,
      memberCount: members.length,
    });
  }

  return teams;
}

/**
 * Get detailed info for a specific team.
 */
export function getTeam(teamName) {
  const configPath = path.join(TEAMS_DIR, teamName, 'config.json');
  const config = readJsonSafe(configPath);
  if (!config) return null;

  const members = (config.members || []).map((m) => ({
    agentId: m.agentId,
    name: m.name,
    agentType: m.agentType,
    model: m.model,
    color: m.color || null,
    joinedAt: m.joinedAt,
    cwd: m.cwd || null,
    backendType: m.backendType || null,
    prompt: m.prompt || null,
    tmuxPaneId: m.tmuxPaneId || null,
    subscriptions: m.subscriptions || [],
    planModeRequired: m.planModeRequired || false,
  }));

  return {
    name: config.name,
    description: config.description,
    createdAt: config.createdAt,
    leadAgentId: config.leadAgentId,
    leadSessionId: config.leadSessionId || null,
    members,
  };
}

/**
 * List tasks for a specific team.
 */
export function listTasks(teamName) {
  const tasksDir = path.join(TASKS_DIR, teamName);
  if (!fs.existsSync(tasksDir)) return [];

  const entries = fs.readdirSync(tasksDir);
  const tasks = [];

  for (const entry of entries) {
    if (!entry.endsWith('.json')) continue;
    const taskData = readJsonSafe(path.join(tasksDir, entry));
    if (!taskData || !taskData.id) continue;
    tasks.push(taskData);
  }

  tasks.sort((a, b) => Number(a.id) - Number(b.id));
  return tasks;
}

/**
 * Get a specific task for a team.
 */
export function getTask(teamName, taskId) {
  const taskPath = path.join(TASKS_DIR, teamName, `${taskId}.json`);
  return readJsonSafe(taskPath);
}

/**
 * Get inbox messages for a specific agent in a team.
 */
export function getInbox(teamName, agentName) {
  const inboxPath = path.join(TEAMS_DIR, teamName, 'inboxes', `${agentName}.json`);
  return readJsonSafe(inboxPath) || [];
}

/**
 * List all inboxes for a team.
 */
export function listInboxes(teamName) {
  const inboxDir = path.join(TEAMS_DIR, teamName, 'inboxes');
  if (!fs.existsSync(inboxDir)) return {};

  const entries = fs.readdirSync(inboxDir);
  const inboxes = {};

  for (const entry of entries) {
    if (!entry.endsWith('.json')) continue;
    const agentName = entry.replace('.json', '');
    inboxes[agentName] = readJsonSafe(path.join(inboxDir, entry)) || [];
  }

  return inboxes;
}

/**
 * Get debug log for a session (tail last N lines for efficiency).
 */
export function getDebugLog(sessionId, tailLines = 200) {
  const logPath = path.join(DEBUG_DIR, `${sessionId}.txt`);
  if (!fs.existsSync(logPath)) return null;

  try {
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.split('\n');
    const start = Math.max(0, lines.length - tailLines);
    return {
      totalLines: lines.length,
      lines: lines.slice(start),
      truncated: start > 0,
    };
  } catch {
    return null;
  }
}

/**
 * Get all session IDs from the debug directory.
 */
export function listDebugSessions() {
  if (!fs.existsSync(DEBUG_DIR)) return [];

  const entries = fs.readdirSync(DEBUG_DIR);
  return entries
    .filter((e) => e.endsWith('.txt'))
    .map((e) => {
      const sessionId = e.replace('.txt', '');
      const stat = fs.statSync(path.join(DEBUG_DIR, e));
      return {
        sessionId,
        size: stat.size,
        modifiedAt: stat.mtimeMs,
      };
    })
    .sort((a, b) => b.modifiedAt - a.modifiedAt);
}

/**
 * Get the directories being watched for a summary.
 */
export function getWatchPaths() {
  return {
    teamsDir: TEAMS_DIR,
    tasksDir: TASKS_DIR,
    debugDir: DEBUG_DIR,
    teamsExists: fs.existsSync(TEAMS_DIR),
    tasksExists: fs.existsSync(TASKS_DIR),
    debugExists: fs.existsSync(DEBUG_DIR),
  };
}
