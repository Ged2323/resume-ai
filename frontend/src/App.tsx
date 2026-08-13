import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
import InputForm from './components/InputForm'
import ResultsPanel from './components/ResultsPanel'
import FeedbackWidget from './components/FeedbackWidget'
import AuthModal from './components/AuthModal'
import UpgradeModal from './components/UpgradeModal'

interface Results {
  cover_letter: string
  gap_analysis: string
  uses_this_month: number
  limit: number
  is_subscribed: boolean
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [resume, setResume] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<Results | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  async function handleGenerate() {
    setError('')
    setResults(null)
    setLoading(true)
    try {
      const base = import.meta.env.VITE_API_URL ?? ''
      const token = session?.access_token
      const res = await fetch(`${base}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ job_description: jobDescription, resume }),
      })
      if (res.status === 429) { setShowUpgrade(true); return }
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || `Error ${res.status}`)
      }
      const data: Results = await res.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpgrade() {
    setUpgradeLoading(true)
    try {
      const base = import.meta.env.VITE_API_URL ?? ''
      const token = session?.access_token
      const res = await fetch(`${base}/api/create-checkout-session`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Failed to create checkout session.')
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upgrade failed.')
      setShowUpgrade(false)
    } finally {
      setUpgradeLoading(false)
    }
  }

  const usageLabel = results && !results.is_subscribed
    ? `${results.uses_this_month} / ${results.limit} free uses this month`
    : null

  return (
    <div className="app">
      <header>
        <h1>Resume AI</h1>
        <p>Paste a job description and your resume — get a tailored cover letter and gap analysis.</p>
        <span className="badge">Powered by NVIDIA NIM · Llama 3.1 8B</span>
        <div className="auth-bar">
          {session ? (
            <>
              <span className="user-email">{session.user.email}</span>
              <button className="link-btn" onClick={() => supabase.auth.signOut()}>Sign out</button>
            </>
          ) : (
            <button className="link-btn" onClick={() => setShowAuth(true)}>Sign in</button>
          )}
        </div>
      </header>

      <InputForm
        jobDescription={jobDescription}
        resume={resume}
        onJobChange={setJobDescription}
        onResumeChange={setResume}
        onSubmit={handleGenerate}
        loading={loading}
      />

      {error && <p className="error">{error}</p>}
      {usageLabel && <p className="usage-label">{usageLabel}</p>}
      {loading && (
        <div className="spinner">
          <div className="spinner-ring" />
          <div className="spinner-text">Generating your materials...</div>
          <div className="spinner-sub">First request may take 20–30 sec while the server wakes up.</div>
          <div className="spinner-sub">If it times out, free API credits may be exhausted — try again later.</div>
        </div>
      )}
      {results && (
        <>
          <ResultsPanel coverLetter={results.cover_letter} gapAnalysis={results.gap_analysis} />
          <FeedbackWidget />
        </>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onUpgrade={handleUpgrade}
          loading={upgradeLoading}
        />
      )}
    </div>
  )
}
