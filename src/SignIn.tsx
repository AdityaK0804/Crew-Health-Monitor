import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { fetchUsers, login } from './api'
import { DEMO_PIN, type User } from './data/users'
import { Button, EASE, Logo } from './ui'

const ROLE_NOTE: Record<User['role'], string> = {
  crew: 'Sees own health data',
  cmo: "Sees every crew member's data",
  surgeon: 'Sees only what the crew sends to Earth',
}

export default function SignIn({ onDone }: { onDone: () => void }) {
  const [users, setUsers] = useState<User[] | null>(null)
  const [picked, setPicked] = useState<User | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetchUsers().then((r) => (r.ok ? setUsers(r.data.users) : setError(`${r.error} Start it with "npm run dev".`)))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!picked) return
    setBusy(true)
    const r = await login(picked.id, pin)
    setBusy(false)
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
            <p className="text-sm text-muted">Sign in to continue</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-8">
          <fieldset>
            <legend className="mb-2 text-sm text-muted">Who are you?</legend>
            <div className="grid gap-2">
              {(users ?? []).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => (setPicked(u), setError(null))}
                  aria-pressed={picked?.id === u.id}
                  className={`press flex min-h-14 items-center justify-between gap-3 rounded-xl border px-4 text-left ${picked?.id === u.id ? 'border-ink bg-raised' : 'border-line bg-panel hover:border-line-strong'}`}
                >
                  <span>
                    <span className="block font-medium">{u.name}</span>
                    <span className="block text-xs text-muted">{u.title}</span>
                  </span>
                  <span className="text-right text-xs text-dim">{ROLE_NOTE[u.role]}</span>
                </button>
              ))}
              {!users && !error && <p className="rounded-xl border border-line bg-panel px-4 py-4 text-sm text-muted">Loading accounts...</p>}
            </div>
          </fieldset>

          <label className="mt-5 block text-sm">
            <span className="mb-1 block text-muted">PIN</span>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="min-h-11 w-full rounded-[10px] border border-line-strong bg-ground px-3 font-mono tracking-[0.3em] text-ink focus:border-ink"
            />
            <span className="mt-1.5 block text-xs text-dim">Demo accounts all use PIN {DEMO_PIN}. A real system would use the agency's own sign-in.</span>
          </label>

          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-urgent-bg px-3 py-2 text-sm text-urgent">
              {error}
            </p>
          )}

          <Button kind="primary" type="submit" disabled={!picked || pin.length === 0 || busy} className="mt-5 w-full">
            {busy ? 'Signing in...' : picked ? `Sign in as ${picked.name}` : 'Choose an account'}
          </Button>
        </form>
        <p className="mt-8 rounded-xl border border-line-strong px-4 py-3 text-center text-sm">Every person and every reading in this app is simulated.</p>
        <p className="mt-3 text-center text-xs text-muted">Educational prototype. Not a medical device.</p>
      </motion.div>
    </div>
  )
}
