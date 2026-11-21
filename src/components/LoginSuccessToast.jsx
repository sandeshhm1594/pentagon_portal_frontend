import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

const roleLabels = {
  ADMIN: 'Admin',
  TRAINER: 'Trainer',
  STUDENT: 'Student',
  PLACEMENT_HEAD: 'Placement Head',
  PLACEMENT_COORDINATOR: 'Placement Coordinator'
}

const LoginSuccessToast = () => {
  const [visible, setVisible] = useState(false)
  const [roleLabel, setRoleLabel] = useState('')

  useEffect(() => {
    const flag = sessionStorage.getItem('pentagon_login_success')
    if (flag !== null) {
      sessionStorage.removeItem('pentagon_login_success')
      setRoleLabel(roleLabels[flag] || '')
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 4500)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!visible) return null

  const username = localStorage.getItem('username') || ''

  return (
    <div className="fixed top-5 right-5 z-[400] animate-in slide-in-from-right fade-in duration-300">
      <div className="flex items-center gap-3 min-w-[320px] max-w-sm rounded-2xl border-l-4 border-emerald-500 bg-white shadow-2xl shadow-emerald-500/20 p-4">
        <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900">Login successful</p>
          <p className="text-xs text-gray-500 truncate">
            Welcome back{username ? `, ${username}` : ''}{roleLabel ? ` — ${roleLabel} Portal` : ''}
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginSuccessToast
