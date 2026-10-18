import './DigitMark.css'

function DigitMark({ size = 'md', className = '' }) {
  return (
    <span
      className={`digit-mark digit-mark--${size} ${className}`.trim()}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" className="digit-mark__bg" />
        <rect
          x="1.25"
          y="1.25"
          width="37.5"
          height="37.5"
          className="digit-mark__ring"
        />
        <path
          d="M20 12v5M20 17l-7 8M20 17l7 8M13 25h14"
          className="digit-mark__lines"
        />
        <circle cx="20" cy="11" r="3.25" className="digit-mark__hub" />
        <circle cx="12" cy="27" r="2.5" className="digit-mark__node" />
        <circle cx="28" cy="27" r="2.5" className="digit-mark__node" />
      </svg>
    </span>
  )
}

export default DigitMark
