import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import TeamList from './components/TeamList'
import MemberList from './components/MemberList'
import MemberDetail from './components/MemberDetail'
import { useWebSocket } from './hooks/useWebSocket'
import { useDashboard } from './hooks/useDashboard'
import {
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function App() {
  const { connected, events, sendMessage, clearEvents } = useWebSocket()
  const {
    teams,
    selectedTeam,
    setSelectedTeam,
    teamDetail,
    tasks,
    inboxes,
    debugSessions,
    loading,
    error,
    refresh,
  } = useDashboard()

  const [selectedMember, setSelectedMember] = useState(null)
  const [teamsCollapsed, setTeamsCollapsed] = useState(false)
  const [membersCollapsed, setMembersCollapsed] = useState(false)

  // Handle real-time updates by refreshing data when new WS events arrive
  const prevEventCountRef = useRef(0)
  useEffect(() => {
    if (events.length > prevEventCountRef.current) {
      prevEventCountRef.current = events.length
      const timer = setTimeout(refresh, 500)
      return () => clearTimeout(timer)
    }
  }, [events.length, refresh])

  const handleSelectTeam = (teamName) => {
    setSelectedTeam(teamName)
    setSelectedMember(null)
    setMembersCollapsed(false) // Auto-expand members when selecting team
  }

  const handleSelectMember = (memberName) => {
    setSelectedMember(memberName)
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
          <p className="text-sm text-slate-600">Connecting to backend...</p>
        </div>
      </div>
    )
  }

  const currentMember = teamDetail?.members.find(m => m.name === selectedMember)
  const memberMessages = selectedMember ? (inboxes[selectedMember] || []) : []

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        connected={connected}
        teamCount={teams.length}
        onRefresh={refresh}
      />

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-2 text-sm text-red-700 flex-shrink-0">
          <AlertTriangle className="w-4 h-4" />
          Backend connection error: {error}
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* Column 1: Teams list (collapsible) */}
        <div className={`bg-white border-r border-slate-200 flex flex-col flex-shrink-0 transition-all duration-300 ${
          teamsCollapsed ? 'w-16' : 'w-72'
        }`}>
          {teamsCollapsed ? (
            <div className="flex flex-col h-full">
              <button
                onClick={() => setTeamsCollapsed(false)}
                className="p-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center border-b border-slate-200"
                title="Expand Teams"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
              {/* Collapsed team shortcuts */}
              <div className="flex-1 overflow-y-auto custom-scrollbar py-2 space-y-1">
                {teams.map((team) => {
                  const initial = team.name.substring(0, 2).toUpperCase()
                  const isSelected = selectedTeam === team.name
                  return (
                    <button
                      key={team.name}
                      onClick={() => handleSelectTeam(team.name)}
                      className={`w-full px-2 py-2 mx-1 rounded-lg transition-all cursor-pointer text-xs font-bold ${
                        isSelected
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title={team.name}
                    >
                      {initial}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Teams</span>
                <button
                  onClick={() => setTeamsCollapsed(true)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Collapse Teams"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <TeamList
                teams={teams}
                selectedTeam={selectedTeam}
                onSelectTeam={handleSelectTeam}
              />
            </>
          )}
        </div>

        {/* Column 2: Members list (collapsible, shows when team selected) */}
        {selectedTeam && teamDetail && (
          <div className={`bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0 transition-all duration-300 ${
            membersCollapsed ? 'w-16' : 'w-72'
          }`}>
            {membersCollapsed ? (
              <div className="flex flex-col h-full">
                <button
                  onClick={() => setMembersCollapsed(false)}
                  className="p-3 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border-b border-slate-200"
                  title="Expand Members"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
                {/* Collapsed member shortcuts */}
                <div className="flex-1 overflow-y-auto custom-scrollbar py-2 space-y-1">
                  {teamDetail.members.map((member) => {
                    const initial = (member.name || member.agentId).substring(0, 2).toUpperCase()
                    const isSelected = selectedMember === member.name
                    return (
                      <button
                        key={member.agentId}
                        onClick={() => handleSelectMember(member.name)}
                        className={`w-full px-2 py-2 mx-1 rounded-lg transition-all cursor-pointer text-xs font-bold ${
                          isSelected
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                        title={member.name || member.agentId}
                      >
                        {initial}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Members</span>
                  <button
                    onClick={() => setMembersCollapsed(true)}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Collapse Members"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                <MemberList
                  members={teamDetail.members}
                  leadAgentId={teamDetail.leadAgentId}
                  selectedMember={selectedMember}
                  onSelectMember={handleSelectMember}
                  teamName={selectedTeam}
                  tasks={tasks}
                  events={events}
                />
              </>
            )}
          </div>
        )}

        {/* Column 3: Member detail (shows when member selected) */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          {!selectedTeam ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <p className="text-sm font-medium mb-1 text-slate-700">Select a team</p>
                <p className="text-xs text-slate-500">
                  Choose a team from the left to view its members
                </p>
              </div>
            </div>
          ) : !selectedMember ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <p className="text-sm font-medium mb-1 text-slate-700">Select a member</p>
                <p className="text-xs text-slate-500">
                  Choose a member to view their tasks and activity
                </p>
              </div>
            </div>
          ) : (
            <MemberDetail
              member={currentMember}
              tasks={tasks}
              messages={memberMessages}
              teamName={selectedTeam}
            />
          )}
        </div>
      </div>
    </div>
  )
}
