import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  onClose: () => void
}

export default function AuthModal({ onClose }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSent(true)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onClose()
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
        {sent ? (
          <p>Check your email to confirm your account, then sign in.</p>
        ) : (
          <>
            <input
              type="email" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="password" placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            {error && <p className="error">{error}</p>}
            <button onClick={handleSubmit} disabled={loading}>
              {loading ? '…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
            <button className="link-btn" onClick={() =>
              setMode(mode === 'signin' ? 'signup' : 'signin')
            }>
              {mode === 'signin' ? 'No account? Sign up' : 'Have an account? Sign in'}
            </button>
          </>
        )}
        <button className="link-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
