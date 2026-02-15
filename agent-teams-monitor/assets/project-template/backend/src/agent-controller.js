import fs from 'fs';
import path from 'path';
import os from 'os';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const TEAMS_DIR = path.join(CLAUDE_DIR, 'teams');

/**
 * Send a message to an agent's inbox
 * @param {string} teamName - Team name
 * @param {string} agentName - Agent name (not agentId)
 * @param {object} message - Message object
 * @returns {boolean} Success status
 */
export function sendMessageToAgent(teamName, agentName, message) {
  const inboxPath = path.join(TEAMS_DIR, teamName, 'inboxes', `${agentName}.json`);

  try {
    // Read current inbox
    let inbox = [];
    if (fs.existsSync(inboxPath)) {
      const content = fs.readFileSync(inboxPath, 'utf-8');
      inbox = JSON.parse(content);
    }

    // Add new message
    const newMessage = {
      from: 'dashboard',
      text: typeof message.text === 'string' ? message.text : JSON.stringify(message.text),
      timestamp: new Date().toISOString(),
      read: false,
      ...message,
    };

    inbox.push(newMessage);

    // Write back to inbox
    fs.writeFileSync(inboxPath, JSON.stringify(inbox, null, 2));

    return true;
  } catch (error) {
    console.error(`Failed to send message to ${agentName}:`, error);
    return false;
  }
}

/**
 * Send shutdown request to an agent
 * @param {string} teamName - Team name
 * @param {string} agentName - Agent name
 * @returns {boolean} Success status
 */
export function shutdownAgent(teamName, agentName) {
  const shutdownMessage = {
    text: {
      type: 'shutdown_request',
      requestId: `shutdown-${Date.now()}@${agentName}`,
      content: 'Shutdown requested from monitoring dashboard',
      timestamp: new Date().toISOString(),
    },
  };

  return sendMessageToAgent(teamName, agentName, shutdownMessage);
}

/**
 * Send a pause/resume message to an agent
 * @param {string} teamName - Team name
 * @param {string} agentName - Agent name
 * @param {string} action - 'pause' or 'resume'
 * @returns {boolean} Success status
 */
export function controlAgent(teamName, agentName, action) {
  const message = {
    text: {
      type: 'control_request',
      action: action,
      requestId: `control-${Date.now()}@${agentName}`,
      content: `${action} requested from monitoring dashboard`,
      timestamp: new Date().toISOString(),
    },
  };

  return sendMessageToAgent(teamName, agentName, message);
}
