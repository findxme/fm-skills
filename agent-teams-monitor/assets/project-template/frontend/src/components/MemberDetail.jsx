import { useState, useRef, useEffect } from 'react'
import {
  User,
  ListTodo,
  MessageSquare,
  Activity,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Send,
  Inbox,
  ChevronDown,
  RotateCcw,
  Power,
  Pause,
  Play,
} from 'lucide-react'

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
]

function TaskCard({ task }) {
  const statusConfig = {
    completed: { icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-500' },
    in_progress: { icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-500' },
    pending: { icon: Circle, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', dot: 'bg-slate-400' },
  }

  const config = statusConfig[task.status] || statusConfig.pending
  const StatusIcon = config.icon

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg} p-3 hover:bg-opacity-80 transition-all`}>
      <div className="flex items-start gap-2.5">
        <div className={`w-8 h-8 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0`}>
          <StatusIcon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1.5">
            <h4 className="text-sm font-bold text-slate-900 flex-1">
              {task.subject || 'Untitled Task'}
            </h4>
            <span className={`text-[9px] px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-semibold uppercase tracking-wider flex-shrink-0 border ${config.border}`}>
              {task.status || 'pending'}
            </span>
          </div>
          {task.description && (
            <p className="text-xs text-slate-600 mb-2 whitespace-pre-wrap">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            {task.owner && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="font-medium">{task.owner}</span>
              </span>
            )}
            {task.blockedBy && task.blockedBy.length > 0 && (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="w-3 h-3" />
                Blocked by {task.blockedBy.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageCard({ message, agentName }) {
  const isSent = message.from === agentName

  // Try to parse message content if it's JSON
  let messageContent = message.text || message.content || message.message || ''
  let isStructured = false
  let structuredData = null

  // Try to parse JSON content
  if (typeof messageContent === 'string') {
    try {
      structuredData = JSON.parse(messageContent)
      isStructured = true
    } catch (e) {
      // Not JSON, keep as plain text
      isStructured = false
    }
  } else if (typeof messageContent === 'object' && messageContent !== null) {
    // Already an object
    structuredData = messageContent
    isStructured = true
  }

  // Render structured message based on type
  const renderStructuredMessage = (data) => {
    if (!data || typeof data !== 'object') {
      return <p className="text-sm text-slate-800">{String(data)}</p>
    }

    // Handle task assignment
    if (data.type === 'task_assignment') {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-xs font-bold">
              Task Assignment
            </span>
            <span className="text-xs text-slate-500">#{data.taskId}</span>
          </div>
          <h4 className="font-semibold text-sm text-slate-900">{data.subject}</h4>
          {data.description && (
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{data.description}</p>
          )}
          {data.assignedBy && (
            <p className="text-xs text-slate-500">Assigned by: <span className="font-medium">{data.assignedBy}</span></p>
          )}
        </div>
      )
    }

    // Handle shutdown request/response
    if (data.type === 'shutdown_request' || data.type === 'shutdown_response') {
      return (
        <div className="space-y-1.5">
          <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
            data.type === 'shutdown_request'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {data.type === 'shutdown_request' ? 'Shutdown Request' : 'Shutdown Response'}
          </span>
          {data.content && <p className="text-sm text-slate-700">{data.content}</p>}
          {data.approve !== undefined && (
            <p className="text-xs text-slate-600">
              Status: <span className={`font-bold ${data.approve ? 'text-green-600' : 'text-red-600'}`}>
                {data.approve ? 'Approved' : 'Rejected'}
              </span>
            </p>
          )}
        </div>
      )
    }

    // Handle plan approval
    if (data.type === 'plan_approval_request' || data.type === 'plan_approval_response') {
      return (
        <div className="space-y-1.5">
          <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold">
            Plan Approval
          </span>
          {data.content && <p className="text-sm text-slate-700">{data.content}</p>}
          {data.approve !== undefined && (
            <p className="text-xs text-slate-600">
              Status: <span className={`font-bold ${data.approve ? 'text-green-600' : 'text-red-600'}`}>
                {data.approve ? 'Approved' : 'Rejected'}
              </span>
            </p>
          )}
        </div>
      )
    }

    // Handle status updates
    if (data.type === 'task_completed' || data.type === 'task_started') {
      return (
        <div className="space-y-1.5">
          <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
            data.type === 'task_completed'
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {data.type === 'task_completed' ? 'Task Completed' : 'Task Started'}
          </span>
          {data.taskId && <p className="text-xs text-slate-500">Task #{data.taskId}</p>}
          {data.message && <p className="text-sm text-slate-700">{data.message}</p>}
        </div>
      )
    }

    // Handle idle notification
    if (data.type === 'idle_notification') {
      return (
        <div className="space-y-1.5">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
            Status Update
          </span>
          <p className="text-sm text-slate-700">
            Agent is now <span className="font-medium text-amber-600">{data.idleReason || 'idle'}</span>
          </p>
          {data.summary && <p className="text-xs text-slate-500">{data.summary}</p>}
        </div>
      )
    }

    // Generic structured data - show as key-value pairs
    return (
      <div className="space-y-1">
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
          Structured Message
        </span>
        <div className="space-y-1 mt-2">
          {Object.entries(data).map(([key, value]) => {
            // Skip internal fields
            if (key.startsWith('_')) return null

            return (
              <div key={key} className="text-sm">
                <span className="font-medium text-slate-700">{key}:</span>{' '}
                <span className="text-slate-600">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border p-3 ${
      isSent
        ? 'bg-indigo-50 border-indigo-100 ml-12'
        : 'bg-white border-slate-100 mr-12'
    }`}>
      <div className="flex items-start gap-2.5 mb-1.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isSent ? 'bg-indigo-100' : 'bg-slate-100'
        }`}>
          {isSent ? (
            <Send className="w-3.5 h-3.5 text-indigo-600" />
          ) : (
            <Inbox className="w-3.5 h-3.5 text-slate-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[10px]">
            {message.from && (
              <span className={`font-bold ${
                isSent ? 'text-indigo-700' : 'text-slate-700'
              }`}>
                {message.from}
              </span>
            )}
            {message.to && !isSent && (
              <>
                <span className="text-slate-400">→</span>
                <span className="text-slate-600 font-medium">{message.to}</span>
              </>
            )}
            {message.timestamp && (
              <span className="text-slate-500 ml-auto">
                {formatTime(message.timestamp)}
              </span>
            )}
          </div>
          {message.summary && (
            <p className="text-xs text-slate-600 mt-0.5 italic font-medium">
              {message.summary}
            </p>
          )}
        </div>
      </div>
      <div className="pl-9">
        {isStructured ? (
          renderStructuredMessage(structuredData)
        ) : (
          <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">
            {messageContent || 'No content'}
          </p>
        )}
      </div>
    </div>
  )
}

export default function MemberDetail({ member, tasks, messages, teamName }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [manualStatus, setManualStatus] = useState(null) // null means use auto-detected status
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  // Agent control functions
  const handleAgentControl = async (action) => {
    if (!member || actionLoading) return

    setActionLoading(action)

    try {
      let endpoint, body

      if (action === 'shutdown') {
        endpoint = `/api/teams/${teamName}/agents/${member.name}/shutdown`
        body = {}
      } else if (action === 'pause' || action === 'resume') {
        endpoint = `/api/teams/${teamName}/agents/${member.name}/control`
        body = { action }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        // Show success feedback (you could add a toast notification here)
        console.log(`${action} request sent successfully`)
      } else {
        console.error(`Failed to ${action}:`, data.error)
      }
    } catch (error) {
      console.error(`Error sending ${action} request:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  if (!member) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-600">Select a member to view details</p>
        </div>
      </div>
    )
  }

  const memberTasks = tasks.filter(t => t.owner === member.name) || []
  const memberMessages = messages || []

  // Get auto-detected status
  const hasActiveTasks = memberTasks.some(t => t.status === 'in_progress')
  const autoStatus = hasActiveTasks ? 'active' : (memberTasks.length > 0 ? 'idle' : 'offline')

  // Use manual status if set, otherwise use auto-detected
  const currentStatus = manualStatus || autoStatus

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50' },
    { value: 'idle', label: 'Idle', color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50' },
    { value: 'offline', label: 'Offline', color: 'bg-slate-400', textColor: 'text-slate-700', bgColor: 'bg-slate-50' },
  ]

  const currentStatusConfig = statusOptions.find(s => s.value === currentStatus) || statusOptions[2]

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Member header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 p-5 flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              {member.agentType === 'human' ? (
                <User className="w-7 h-7 text-white" />
              ) : (
                <Activity className="w-7 h-7 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900">
                {member.name}
              </h2>
              <div className="flex items-center gap-1.5 text-xs mt-1">
                {member.agentType && (
                  <span className="px-2 py-0.5 rounded-lg bg-white border border-indigo-100 text-indigo-700 font-semibold">
                    {member.agentType}
                  </span>
                )}
                {member.model && (
                  <span className="px-2 py-0.5 rounded-lg bg-white border border-purple-100 text-purple-700 font-semibold">
                    {member.model}
                  </span>
                )}
                <span className="text-slate-500 ml-1">in {teamName}</span>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="flex items-center gap-2">
            {/* Status Control */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${currentStatusConfig.bgColor} ${currentStatusConfig.textColor} border-current/20 hover:border-current/40 transition-all cursor-pointer`}
              >
                <div className={`w-2 h-2 rounded-full ${currentStatusConfig.color}`} />
                <span className="text-sm font-bold">{currentStatusConfig.label}</span>
                <ChevronDown className="w-4 h-4" />
                {manualStatus && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/60">Manual</span>
                )}
              </button>

              {/* Status Dropdown */}
              {showStatusMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowStatusMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20 min-w-[160px]">
                    {statusOptions.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => {
                          setManualStatus(status.value === autoStatus ? null : status.value)
                          setShowStatusMenu(false)
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer ${
                          currentStatus === status.value ? 'bg-slate-50' : ''
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${status.color}`} />
                        <span className={`text-sm font-medium ${status.textColor}`}>
                          {status.label}
                        </span>
                        {status.value === autoStatus && (
                          <span className="ml-auto text-[9px] text-slate-500">Auto</span>
                        )}
                      </button>
                    ))}
                    {manualStatus && (
                      <>
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          onClick={() => {
                            setManualStatus(null)
                            setShowStatusMenu(false)
                          }}
                          className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer text-slate-600"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span className="text-sm">Reset to Auto</span>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 border-l border-indigo-200 pl-2">
              <button
                onClick={() => handleAgentControl('resume')}
                disabled={actionLoading !== null}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  actionLoading === 'resume'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'hover:bg-white/60 text-emerald-600'
                } disabled:opacity-50`}
                title="Resume/Start Agent"
              >
                <Play className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAgentControl('pause')}
                disabled={actionLoading !== null}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  actionLoading === 'pause'
                    ? 'bg-amber-100 text-amber-600'
                    : 'hover:bg-white/60 text-amber-600'
                } disabled:opacity-50`}
                title="Pause Agent"
              >
                <Pause className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAgentControl('shutdown')}
                disabled={actionLoading !== null}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  actionLoading === 'shutdown'
                    ? 'bg-red-100 text-red-600'
                    : 'hover:bg-white/60 text-red-600'
                } disabled:opacity-50`}
                title="Shutdown Agent"
              >
                <Power className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-100 bg-white px-2 flex-shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          let badge = null
          if (tab.id === 'tasks') badge = memberTasks.length
          else if (tab.id === 'messages') badge = memberMessages.length

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all cursor-pointer border-b-2 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {badge != null && badge > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-slate-50">
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-indigo-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-indigo-600 mb-0.5">
                  {memberTasks.length}
                </div>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">
                  Tasks
                </div>
              </div>
              <div className="bg-white border border-blue-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 mb-0.5">
                  {memberMessages.length}
                </div>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">
                  Messages
                </div>
              </div>
              <div className="bg-white border border-emerald-100 rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-600 mb-0.5">
                  {memberTasks.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">
                  Completed
                </div>
              </div>
            </div>

            {memberTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2.5 uppercase tracking-wide">Recent Tasks</h3>
                <div className="space-y-2.5">
                  {memberTasks.slice(0, 3).map((task, idx) => (
                    <TaskCard key={idx} task={task} />
                  ))}
                </div>
              </div>
            )}

            {memberMessages.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2.5 uppercase tracking-wide">Recent Messages</h3>
                <div className="space-y-2.5">
                  {memberMessages.slice(-3).map((msg, idx) => (
                    <MessageCard key={idx} message={msg} agentName={member.name} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-2.5">
            {memberTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ListTodo className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No tasks assigned</p>
              </div>
            ) : (
              memberTasks.map((task, idx) => (
                <TaskCard key={idx} task={task} />
              ))
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-2.5">
            {memberMessages.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No messages</p>
              </div>
            ) : (
              memberMessages.map((msg, idx) => (
                <MessageCard key={idx} message={msg} agentName={member.name} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
