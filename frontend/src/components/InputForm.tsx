import { useRef, useState } from 'react'

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
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? ''
      const res = await fetch(`${apiUrl}/api/upload-resume`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setUploadError(data.detail ?? `Upload failed (${res.status})`)
        return
      }

      const data = await res.json()
      onResumeChange(data.text)
    } catch {
      setUploadError('Network error — could not reach the server.')
    } finally {
      setUploading(false)
      // reset so the same file can be re-uploaded if needed
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

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
          <label>
            Your Resume
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || uploading}
              style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '2px 8px' }}
            >
              {uploading ? 'Extracting...' : 'Upload PDF'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={handlePdfUpload}
            />
          </label>
          {uploadError && (
            <span style={{ color: 'red', fontSize: '0.8rem' }}>{uploadError}</span>
          )}
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
