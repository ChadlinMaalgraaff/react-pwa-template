import './ComingSoon.css'

interface ComingSoonProps {
  title: string
}

const ComingSoon = ({ title }: ComingSoonProps) => (
  <div className="coming-soon">
    <h1 className="coming-soon-title">{title}</h1>
    <p className="coming-soon-message">This screen is coming soon.</p>
  </div>
)

export default ComingSoon
