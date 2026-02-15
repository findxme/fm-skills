import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { EventEmitter } from 'node:events';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const TEAMS_DIR = path.join(CLAUDE_DIR, 'teams');
const TASKS_DIR = path.join(CLAUDE_DIR, 'tasks');
const DEBUG_DIR = path.join(CLAUDE_DIR, 'debug');

/**
 * FileWatcher emits events when Agent Teams log files change.
 *
 * Events:
 *   - 'team:config'   { teamName, data }
 *   - 'team:inbox'    { teamName, agentName, data }
 *   - 'task:update'   { teamName, taskId, data }
 *   - 'debug:update'  { sessionId, lines }
 *   - 'error'         { message, error }
 */
export class FileWatcher extends EventEmitter {
  constructor() {
    super();
    this._watchers = [];
    this._debugWatchers = new Map();
    this._watchedDebugSessions = new Set();
  }

  start() {
    this._watchDirectory(TEAMS_DIR, (eventType, filename, fullPath) => {
      this._handleTeamsChange(filename, fullPath);
    });

    this._watchDirectory(TASKS_DIR, (eventType, filename, fullPath) => {
      this._handleTasksChange(filename, fullPath);
    });

    // Watch for new debug files
    this._watchDirectory(DEBUG_DIR, (eventType, filename) => {
      if (filename && filename.endsWith('.txt')) {
        const sessionId = filename.replace('.txt', '');
        this._watchDebugSession(sessionId);
      }
    });
  }

  /**
   * Watch a specific debug session's log file for appended content.
   */
  watchDebugSession(sessionId) {
    this._watchedDebugSessions.add(sessionId);
    this._watchDebugSession(sessionId);
  }

  unwatchDebugSession(sessionId) {
    this._watchedDebugSessions.delete(sessionId);
    const watcher = this._debugWatchers.get(sessionId);
    if (watcher) {
      watcher.close();
      this._debugWatchers.delete(sessionId);
    }
  }

  stop() {
    for (const w of this._watchers) {
      w.close();
    }
    this._watchers = [];
    for (const [, w] of this._debugWatchers) {
      w.close();
    }
    this._debugWatchers.clear();
    this._watchedDebugSessions.clear();
  }

  _watchDirectory(dir, callback) {
    if (!fs.existsSync(dir)) return;

    try {
      const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        const fullPath = path.join(dir, filename);
        callback(eventType, filename, fullPath);
      });

      watcher.on('error', (err) => {
        this.emit('error', { message: `Watcher error on ${dir}`, error: err.message });
      });

      this._watchers.push(watcher);
    } catch (err) {
      this.emit('error', { message: `Failed to watch ${dir}`, error: err.message });
    }
  }

  _handleTeamsChange(filename, fullPath) {
    if (!filename) return;

    const parts = filename.split(path.sep);
    // parts[0] = team name
    const teamName = parts[0];

    if (parts.length === 2 && parts[1] === 'config.json') {
      this._emitJsonChange('team:config', fullPath, (data) => ({ teamName, data }));
    } else if (parts.length === 3 && parts[1] === 'inboxes' && parts[2].endsWith('.json')) {
      const agentName = parts[2].replace('.json', '');
      this._emitJsonChange('team:inbox', fullPath, (data) => ({
        teamName,
        agentName,
        data,
      }));
    }
  }

  _handleTasksChange(filename, fullPath) {
    if (!filename) return;

    const parts = filename.split(path.sep);
    const teamName = parts[0];

    if (parts.length === 2 && parts[1].endsWith('.json') && parts[1] !== '.lock') {
      const taskId = parts[1].replace('.json', '');
      this._emitJsonChange('task:update', fullPath, (data) => ({
        teamName,
        taskId,
        data,
      }));
    }
  }

  _emitJsonChange(event, filePath, buildPayload) {
    // Small delay to allow write to complete
    setTimeout(() => {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        this.emit(event, buildPayload(data));
      } catch {
        // File may be in the middle of being written
      }
    }, 50);
  }

  _watchDebugSession(sessionId) {
    if (this._debugWatchers.has(sessionId)) return;
    if (!this._watchedDebugSessions.has(sessionId)) return;

    const logPath = path.join(DEBUG_DIR, `${sessionId}.txt`);
    if (!fs.existsSync(logPath)) return;

    let lastSize = 0;
    try {
      lastSize = fs.statSync(logPath).size;
    } catch {
      return;
    }

    try {
      const watcher = fs.watch(logPath, () => {
        try {
          const stat = fs.statSync(logPath);
          if (stat.size > lastSize) {
            const fd = fs.openSync(logPath, 'r');
            const buffer = Buffer.alloc(stat.size - lastSize);
            fs.readSync(fd, buffer, 0, buffer.length, lastSize);
            fs.closeSync(fd);

            const newContent = buffer.toString('utf-8');
            const newLines = newContent.split('\n').filter((l) => l.length > 0);

            if (newLines.length > 0) {
              this.emit('debug:update', { sessionId, lines: newLines });
            }

            lastSize = stat.size;
          }
        } catch {
          // Ignore read errors during updates
        }
      });

      watcher.on('error', () => {
        this._debugWatchers.delete(sessionId);
      });

      this._debugWatchers.set(sessionId, watcher);
    } catch {
      // Ignore watch errors
    }
  }
}
