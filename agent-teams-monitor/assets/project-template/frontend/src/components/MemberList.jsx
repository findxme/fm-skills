import { User, Cpu, ChevronRight } from 'lucide-react'

const agentColors = [
  'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100',
  'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100',
  'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100',
  'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100',
  'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100',
  'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100',
  'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100',
  'bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100',
]

function getAgentColor(index) {
  return agentColors[index % agentColors.length]
}

// Determine agent status based on tasks and recent activity
function getAgentStatus(memberName, tasks, events) {
  // Check if agent has in_progress tasks
  const hasActiveTasks = tasks.some(t => t.owner === memberName && t.status === 'in_progress')

  // Check recent events (last 5 minutes)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  const recentActivity = events.some(e => {
    const eventTime = new Date(e.timestamp || e._receivedAt).getTime()
    return eventTime > fiveMinutesAgo && (
      (e.data?.agentName === memberName) ||
      (e.data?.from === memberName) ||
      (e.data?.owner === memberName)
    )
  })

  if (hasActiveTasks || recentActivity) {
    return { label: 'Active', color: 'bg-emerald-500', dotColor: 'bg-emerald-400', textColor: 'text-emerald-700' }
  }

  // Check if has any tasks
  const hasTasks = tasks.some(t => t.owner === memberName)
  if (hasTasks) {
    return { label: 'Idle', color: 'bg-amber-500', dotColor: 'bg-amber-400', textColor: 'text-amber-700' }
  }

  return { label: 'Offline', color: 'bg-slate-400', dotColor: 'bg-slate-300', textColor: 'text-slate-600' }
}

export default function MemberList({ members, leadAgentId, selectedMember, onSelectMember, teamName, tasks = [], events = [] }) {
  if (!members || members.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-600">No members</div>
    )
  }

  return (
    <div className="p-4 flex flex-col h-full overflow-hidden">
      {/* Team name badge */}
      <div className="mb-3 px-1">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
          Team: {teamName}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {members.length} member{members.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Members list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
        {members.map((member, index) => {
          const isLead = member.agentId === leadAgentId
          const isSelected = selectedMember === member.name
          const status = getAgentStatus(member.name, tasks, events)

          return (
            <button
              key={member.agentId}
              onClick={() => onSelectMember(member.name)}
              className={`w-full px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-50 border-indigo-200'
                  : getAgentColor(index)
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center relative ${
                  isSelected ? 'bg-indigo-100' : 'bg-white/60'
                }`}>
                  {member.agentType === 'human' ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Cpu className="w-3.5 h-3.5" />
                  )}
                  {/* Status indicator dot */}
                  <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${status.color} border border-white`} />
                </div>
                <span className="text-sm font-semibold flex-1 text-left">
                  {member.name || member.agentId}
                </span>
                {isLead && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-600 text-white font-bold uppercase tracking-wider flex-shrink-0">
                    Lead
                  </span>
                )}
                <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${
                  isSelected ? 'text-indigo-600 translate-x-0.5' : 'opacity-40'
                }`} />
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/60`}>
                  <div className={`w-1 h-1 rounded-full ${status.dotColor}`} />
                  <span className={`text-[9px] font-bold ${status.textColor}`}>
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Agent info */}
              <div className="flex items-center gap-1.5 text-[9px] font-medium opacity-70">
                {member.model && (
                  <span className="px-1.5 py-0.5 rounded bg-white/60">
                    {member.model}
                  </span>
                )}
                {member.agentType && (
                  <span className="px-1.5 py-0.5 rounded bg-white/60">
                    {member.agentType}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
