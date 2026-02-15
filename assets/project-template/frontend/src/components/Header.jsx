import {
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react'

export default function Header({ connected, teamCount, onRefresh }) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Agent Teams Monitor
          </h1>
          {teamCount > 0 && (
            <p className="text-xs text-slate-500 mt-0.5">
              {teamCount} active team{teamCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onRefresh}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
          title="Refresh data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
          {connected ? (
            <>
              <span className="pulse-dot inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <Wifi className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-700 font-medium">Live</span>
            </>
          ) : (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              <WifiOff className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700 font-medium">Offline</span>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
