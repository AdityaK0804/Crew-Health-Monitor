import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight } from '@phosphor-icons/react'
import { fetchUsers, login } from './api'
import { DEMO_PIN, type User } from './data/users'
import { EASE, Logo } from './ui'

const ROLE_NOTE: Record<User['role'], string> = {
  crew: 'Sees own health data',
  cmo: "Sees every crew member's data",
  surgeon: 'Sees only what the crew sends to Earth',
}

/**
 * Demo entry: choose who you are and you are in. There is no PIN to type, because a
 * shared demo PIN protected nothing and only got in a visitor's way. The server still
 * issues a session per person, so roles work the same. A real system would use the
 * agency's own sign-in here.
 */
export default function SignIn({ onDone }: { onDone: () => void }) {
  const [users, setUsers] = useState<User[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers().then((r) => (r.ok ? setUsers(r.data.users) : setError(`${r.error} Start it with "npm run dev".`)))
  }, [])

  const enter = async (u: User) => {
    setBusy(u.id)
    setError(null)
    const r = await login(u.id, DEMO_PIN)
    setBusy(null)
    if (r.ok) onDone()
    else setError(r.error)
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="w-full max-w-md">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Crew Health Monitor</h1>
            <p className="text-sm text-muted">Choose who you are to enter</p>
          </div>
        </div>

        <div className="mt-8 grid gap-2">
          {(users ?? []).map((u, i) => (
            <motion.button
              key={u.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 + i * 0.04, ease: EASE }}
              onClick={() => void enter(u)}
              disabled={busy !== null}
              className="press group flex min-h-16 items-center gap-3 rounded-xl border border-line bg-panel px-4 text-left hover:border-line-strong hover:bg-raised disabled:opacity-60"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{u.name}</span>
                <span className="block text-xs text-muted">{u.title}</span>
              </span>
              <span className="text-right text-xs text-dim">{busy === u.id ? 'Entering...' : ROLE_NOTE[u.role]}</span>
              <ArrowRight size={16} className="shrink-0 text-dim transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink" />
            </motion.button>
          ))}
          {!users && !error && <p className="rounded-xl border border-line bg-panel px-4 py-4 text-sm text-muted">Loading...</p>}
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-urgent-bg px-3 py-2 text-sm text-urgent">
            {error}
          </p>
        )}

        <p className="mt-6 text-xs leading-relaxed text-dim">Each person sees different data. Try a crew member, then the medical officer. Open a second tab as the flight surgeon to see the Earth side.</p>
        <p className="mt-6 rounded-xl border border-line-strong px-4 py-3 text-center text-sm">Every person and every reading in this app is simulated.</p>
        <p className="mt-3 text-center text-xs text-muted">Educational prototype. Not a medical device.</p>
      </motion.div>
    </div>
  )
}
