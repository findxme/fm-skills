import { useState, useEffect, useCallback, useRef } from 'react'

const API_BASE = '/api'

export function useDashboard() {
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [teamDetail, setTeamDetail] = useState(null)
  const [tasks, setTasks] = useState([])
  const [inboxes, setInboxes] = useState({})
  const [debugSessions, setDebugSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const selectedTeamRef = useRef(null)

  // Keep the ref in sync
  selectedTeamRef.current = selectedTeam

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setTeams(data)
      setError(null)

      // Auto-select first team if none selected
      if (data.length > 0 && !selectedTeamRef.current) {
        setSelectedTeam(data[0].name)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTeamDetail = useCallback(async (teamName) => {
    try {
      const [teamRes, tasksRes, inboxesRes] = await Promise.all([
        fetch(`${API_BASE}/teams/${encodeURIComponent(teamName)}`),
        fetch(`${API_BASE}/teams/${encodeURIComponent(teamName)}/tasks`),
        fetch(`${API_BASE}/teams/${encodeURIComponent(teamName)}/inboxes`),
      ])

      if (teamRes.ok) setTeamDetail(await teamRes.json())
      if (tasksRes.ok) setTasks(await tasksRes.json())
      if (inboxesRes.ok) setInboxes(await inboxesRes.json())
    } catch {
      // silently fail on detail fetch
    }
  }, [])

  const fetchDebugSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/debug/sessions`)
      if (res.ok) setDebugSessions(await res.json())
    } catch {
      // silently fail
    }
  }, [])

  // Initial fetch and polling
  useEffect(() => {
    fetchDashboard()
    fetchDebugSessions()
    const interval = setInterval(() => {
      fetchDashboard()
      fetchDebugSessions()
      // Also refresh the selected team detail
      if (selectedTeamRef.current) {
        fetchTeamDetail(selectedTeamRef.current)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [fetchDashboard, fetchDebugSessions, fetchTeamDetail])

  // Fetch detail when selected team changes
  useEffect(() => {
    if (selectedTeam) {
      fetchTeamDetail(selectedTeam)
    }
  }, [selectedTeam, fetchTeamDetail])

  const refresh = useCallback(() => {
    fetchDashboard()
    if (selectedTeamRef.current) fetchTeamDetail(selectedTeamRef.current)
    fetchDebugSessions()
  }, [fetchDashboard, fetchTeamDetail, fetchDebugSessions])

  return {
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
  }
}
