import { useState } from 'react'

export default function FeedbackWidget() {
  const [rating, setRating] = useState<'up' | 'down' | null>(null)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!rating) return
    try {
      const base = import.meta.env.VITE_API_URL ?? ''
      const res = await fetch(`${base}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, message: message.trim() || null }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
    } catch {
      setError('Could not send feedback.')
    }
  }

  if (submitted) {
    return <div className="feedback-widget"><p className="feedback-thanks">Thanks for the feedback!</p></div>
  }

  return (
    <div className="feedback-widget">
      <p className="feedback-label">Was this helpful?</p>
      <div className="feedback-thumbs">
        <button
          className={`thumb-btn${rating === 'up' ? ' active' : ''}`}
          onClick={() => setRating('up')}
          aria-label="thumbs up"
        >👍</button>
        <button
          className={`thumb-btn${rating === 'down' ? ' active' : ''}`}
          onClick={() => setRating('down')}
          aria-label="thumbs down"
        >👎</button>
      </div>
      {rating && (
        <>
          <textarea
            className="feedback-text"
            placeholder="Any comments? (optional)"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
          />
          <button className="feedback-submit" onClick={handleSubmit}>Send feedback</button>
        </>
      )}
      {error && <p className="feedback-error">{error}</p>}
    </div>
  )
}
