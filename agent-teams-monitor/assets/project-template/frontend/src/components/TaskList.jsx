import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
} from 'lucide-react'

const statusConfig = {
  pending: {
    icon: Circle,
    color: 'text-slate-400',
    bg: 'bg-slate-700/50',
    label: 'Pending',
  },
  in_progress: {
    icon: Loader2,
    color: 'text-info',
    bg: 'bg-info/10',
    label: 'In Progress',
    animate: true,
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-success',
    bg: 'bg-success/10',
    label: 'Done',
  },
  failed: {
    icon: AlertCircle,
    color: 'text-error',
    bg: 'bg-error/10',
    label: 'Failed',
  },
}

export default function TaskList({ tasks }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        No tasks
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-800/50">
      {tasks.map((task) => {
        const config = statusConfig[task.status] || statusConfig.pending
        const Icon = config.icon

        return (
          <div key={task.id} className={`px-4 py-3 ${config.bg} hover:bg-slate-800/40 transition-colors`}>
            <div className="flex items-start gap-3">
              <Icon
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color} ${config.animate ? 'animate-spin' : ''}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">#{task.id}</span>
                  <span className="text-sm font-medium text-slate-200 truncate">
                    {task.subject || task.title || `Task ${task.id}`}
                  </span>
                </div>
                {task.description && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${config.color}`}>
                    {config.label}
                  </span>
                  {task.owner && (
                    <span className="text-[10px] text-slate-500">
                      owner: {task.owner}
                    </span>
                  )}
                  {task.blockedBy && task.blockedBy.length > 0 && (
                    <span className="text-[10px] text-warning">
                      blocked by #{task.blockedBy.join(', #')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
