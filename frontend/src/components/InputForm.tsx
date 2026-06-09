interface InputFormProps {
  jobDescription: string
  resume: string
  onJobChange: (v: string) => void
  onResumeChange: (v: string) => void
  onSubmit: () => void
  loading: boolean
}

export default function InputForm({
  jobDescription,
  resume,
  onJobChange,
  onResumeChange,
  onSubmit,
  loading,
}: InputFormProps) {
  return (
    <>
      <div className="input-grid">
        <div className="field">
          <label>Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => onJobChange(e.target.value)}
            placeholder="Paste the full job posting here..."
            disabled={loading}
          />
        </div>
        <div className="field">
          <label>Your Resume</label>
          <textarea
            value={resume}
            onChange={(e) => onResumeChange(e.target.value)}
            placeholder="Paste your resume text here..."
            disabled={loading}
          />
        </div>
      </div>
      <div className="submit-row">
        <button onClick={onSubmit} disabled={loading || !jobDescription.trim() || !resume.trim()}>
          {loading ? 'Generating...' : 'Generate Cover Letter + Gap Analysis'}
        </button>
      </div>
    </>
  )
}
