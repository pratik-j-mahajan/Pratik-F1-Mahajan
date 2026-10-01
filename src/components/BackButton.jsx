import { Link } from 'react-router-dom'

// The site's one back button: a "← Back" pill, always top-left, always back to the circuit map.
export default function BackButton({ className = '', to = '/map' }) {
  return (
    <Link to={to} className={`back-pill ${className}`} aria-label="Back to the circuit map">
      <span aria-hidden="true">←</span> Back
    </Link>
  )
}
