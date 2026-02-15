import { useState } from 'react'
import { Users, ChevronRight, Search, X } from 'lucide-react'

export default function TeamList({ teams, selectedTeam, onSelectTeam }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTeams = teams.filter((team) => {
    const query = searchQuery.toLowerCase()
    return (
      team.name.toLowerCase().includes(query) ||
      (team.description && team.description.toLowerCase().includes(query))
    )
  })

  if (teams.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          Teams
        </h2>
        <p className="text-sm text-slate-600">No teams found</p>
        <p className="text-xs text-slate-500 mt-1">
          Waiting for agent teams to start...
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col h-full">
      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="text-xs text-slate-500 mb-2 px-1">
        {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}
      </div>

      {/* Teams list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
        {filteredTeams.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">
            No teams match "{searchQuery}"
          </p>
        ) : (
          filteredTeams.map((team) => (
            <button
              key={team.name}
              onClick={() => onSelectTeam(team.name)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${
                selectedTeam === team.name
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-900'
                  : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-semibold flex-1 ${
                  selectedTeam === team.name ? 'text-indigo-900' : 'text-slate-900'
                }`}>
                  {team.name}
                </span>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                  selectedTeam === team.name
                    ? 'text-indigo-500 translate-x-0.5'
                    : 'text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5'
                }`} />
              </div>
              {team.description && (
                <p className="text-xs text-slate-600 mb-1.5 line-clamp-2">{team.description}</p>
              )}
              <div className="flex items-center gap-2.5 text-[10px] text-slate-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                  {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                </span>
                {team.leadSessionId && (
                  <span className="flex items-center gap-1" title="Lead Session ID">
                    <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                    <span className="truncate max-w-100">{team.leadSessionId.substring(0, 8)}...</span>
                  </span>
                )}
                {team.tasks && (
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-purple-400"></span>
                    {team.tasks.length} task{team.tasks.length !== 1 ? 's' : ''}
                  </span>
                )}
                {team.messageCount > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                    {team.messageCount} msg{team.messageCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {/* Member preview */}
              {team.members && team.members.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {team.members.slice(0, 4).map((member, idx) => (
                    <span
                      key={member.agentId}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium ${
                        member.color
                          ? `bg-${member.color}-100 text-${member.color}-700`
                          : 'bg-slate-100 text-slate-600'
                      }`}
                      title={`${member.name || member.agentId} (${member.agentType})`}
                    >
                      {member.name || member.agentId}
                    </span>
                  ))}
                  {team.members.length > 4 && (
                    <span className="text-[9px] text-slate-400 px-1">
                      +{team.members.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
