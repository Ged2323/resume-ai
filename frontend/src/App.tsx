import { useState } from 'react'
import InputForm from './components/InputForm'
import ResultsPanel from './components/ResultsPanel'

interface Results {
  cover_letter: string
  gap_analysis: string
}

export default function App() {
  const [jobDescription, setJobDescription] = useState('')
  const [resume, setResume] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<Results | null>(null)

  async function handleGenerate() {
    setError('')
    setResults(null)
    setLoading(true)
    try {
      const base = import.meta.env.VITE_API_URL ?? ''
      const res = await fetch(`${base}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_description: jobDescription, resume }),
      })
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

  return (
    <div className="app">
      <header>
        <h1>Resume AI</h1>
        <p>Paste a job description and your resume — get a tailored cover letter and gap analysis.</p>
        <span className="badge">Powered by NVIDIA NIM · DeepSeek V4 Flash</span>
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
      {loading && <div className="spinner">Generating your materials</div>}
      {results && <ResultsPanel coverLetter={results.cover_letter} gapAnalysis={results.gap_analysis} />}
    </div>
  )
}
