import { Router } from 'express';
import {
  listTeams,
  getTeam,
  listTasks,
  getTask,
  getInbox,
  listInboxes,
  getDebugLog,
  listDebugSessions,
  getWatchPaths,
} from './log-reader.js';
import { sendMessageToAgent, shutdownAgent, controlAgent } from './agent-controller.js';

const router = Router();

// --- Status (health check + summary stats) ---

router.get('/status', (req, res) => {
  const paths = getWatchPaths();
  const teams = listTeams();
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    paths,
    teamCount: teams.length,
    teams: teams.map((t) => t.name),
  });
});

// --- Teams ---

router.get('/teams', (req, res) => {
  res.json(listTeams());
});

router.get('/teams/:teamName', (req, res) => {
  const team = getTeam(req.params.teamName);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }
  res.json(team);
});

// --- Tasks ---

router.get('/teams/:teamName/tasks', (req, res) => {
  res.json(listTasks(req.params.teamName));
});

router.get('/teams/:teamName/tasks/:taskId', (req, res) => {
  const task = getTask(req.params.teamName, req.params.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// --- Messages / Inboxes ---
// Architect spec uses /messages, keeping /inboxes as alias for compatibility

function handleListMessages(req, res) {
  res.json(listInboxes(req.params.teamName));
}

function handleGetAgentMessages(req, res) {
  res.json(getInbox(req.params.teamName, req.params.agentName));
}

router.get('/teams/:teamName/messages', handleListMessages);
router.get('/teams/:teamName/messages/:agentName', handleGetAgentMessages);
router.get('/teams/:teamName/inboxes', handleListMessages);
router.get('/teams/:teamName/inboxes/:agentName', handleGetAgentMessages);

// --- Debug Logs ---

router.get('/debug/sessions', (req, res) => {
  res.json(listDebugSessions());
});

router.get('/debug/sessions/:sessionId', (req, res) => {
  const lines = parseInt(req.query.lines) || 500;
  const log = getDebugLog(req.params.sessionId, lines);
  if (!log) {
    return res.status(404).json({ error: 'Debug session not found' });
  }
  res.json(log);
});

router.get('/debug/sessions/:sessionId/tail', (req, res) => {
  const lines = parseInt(req.query.lines) || 50;
  const log = getDebugLog(req.params.sessionId, lines);
  if (!log) {
    return res.status(404).json({ error: 'Debug session not found' });
  }
  res.json(log);
});

// --- Aggregated dashboard data ---

router.get('/dashboard', (req, res) => {
  const teams = listTeams();
  const dashboard = teams.map((team) => {
    const detail = getTeam(team.name);
    const tasks = listTasks(team.name);
    const inboxes = listInboxes(team.name);

    const messageCount = Object.values(inboxes).reduce(
      (sum, msgs) => sum + msgs.length,
      0
    );

    return {
      ...team,
      members: detail ? detail.members : [],
      tasks,
      messageCount,
      leadSessionId: detail ? detail.leadSessionId : null,
    };
  });

  res.json(dashboard);
});

// --- Agent Control ---

// Send custom message to agent
router.post('/teams/:teamName/agents/:agentName/message', (req, res) => {
  const { teamName, agentName } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const success = sendMessageToAgent(teamName, agentName, message);

  if (success) {
    res.json({ success: true, message: 'Message sent to agent' });
  } else {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Shutdown agent
router.post('/teams/:teamName/agents/:agentName/shutdown', (req, res) => {
  const { teamName, agentName } = req.params;

  const success = shutdownAgent(teamName, agentName);

  if (success) {
    res.json({ success: true, message: 'Shutdown request sent to agent' });
  } else {
    res.status(500).json({ error: 'Failed to send shutdown request' });
  }
});

// Control agent (pause/resume)
router.post('/teams/:teamName/agents/:agentName/control', (req, res) => {
  const { teamName, agentName } = req.params;
  const { action } = req.body;

  if (!action || !['pause', 'resume', 'restart'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action. Must be pause, resume, or restart' });
  }

  const success = controlAgent(teamName, agentName, action);

  if (success) {
    res.json({ success: true, message: `${action} request sent to agent` });
  } else {
    res.status(500).json({ error: `Failed to send ${action} request` });
  }
});

export default router;
