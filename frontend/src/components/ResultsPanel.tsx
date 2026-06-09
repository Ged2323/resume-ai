interface ResultsPanelProps {
  coverLetter: string
  gapAnalysis: string
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

export default function ResultsPanel({ coverLetter, gapAnalysis }: ResultsPanelProps) {
  return (
    <div className="results">
      <div className="result-card">
        <h2>
          Cover Letter
          <button className="copy-btn" onClick={() => copyToClipboard(coverLetter)}>
            Copy
          </button>
        </h2>
        <pre>{coverLetter}</pre>
      </div>
      <div className="result-card">
        <h2>
          Gap Analysis
          <button className="copy-btn" onClick={() => copyToClipboard(gapAnalysis)}>
            Copy
          </button>
        </h2>
        <pre>{gapAnalysis}</pre>
      </div>
    </div>
  )
}
