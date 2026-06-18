interface Props {
  onClose: () => void
  onUpgrade: () => void
  loading: boolean
}

export default function UpgradeModal({ onClose, onUpgrade, loading }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Free limit reached</h2>
        <p>You've used your 3 free generations this month.</p>
        <div className="pricing-card">
          <span className="price">$9 / month</span>
          <ul>
            <li>Unlimited cover letters</li>
            <li>Unlimited gap analyses</li>
            <li>Cancel any time</li>
          </ul>
        </div>
        <button onClick={onUpgrade} disabled={loading}>
          {loading ? 'Redirecting…' : 'Upgrade — $9/mo'}
        </button>
        <button className="link-btn" onClick={onClose}>Maybe later</button>
      </div>
    </div>
  )
}
