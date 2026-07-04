import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode')
      document.body.classList.add('light-mode')
    } else {
      document.documentElement.classList.remove('light-mode')
      document.body.classList.remove('light-mode')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        background: 'transparent',
        border: '1px solid var(--color-border)',
        cursor: 'pointer',
        color: theme === 'dark' ? 'var(--color-royal)' : 'var(--color-sky)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.45rem',
        borderRadius: 'var(--radius-md)',
        transition: 'all 0.15s ease',
        boxShadow: theme === 'dark' ? '0 0 5px rgba(0, 255, 102, 0.15)' : 'none',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-royal)'
        e.currentTarget.style.transform = 'scale(1.05)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {theme === 'dark' ? (
        <Sun size={16} fill="currentColor" />
      ) : (
        <Moon size={16} fill="currentColor" />
      )}
    </button>
  )
}
