import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, User } from 'lucide-react'
import { subscribeToDevelopers, formatDeveloperRating } from '../services/orderService'
import { formatExperienceCategories } from '../utils/developerProfile'
import usePageMeta from '../hooks/usePageMeta'
import { pageTitle } from '../constants/brand'
import '../components/profile/DeveloperPublicProfile.css'
import './Specialists.css'

function Specialists() {
  usePageMeta(pageTitle('შემსრულებლები'), 'DIGIT — სპეციალისტების პროფილები და რეიტინგები.')

  const [developers, setDevelopers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = subscribeToDevelopers(
      (list) => {
        setDevelopers(list)
        setLoading(false)
      },
      (err) => {
        setError(err.message || 'შემსრულებლების ჩატვირთვა ვერ მოხერხდა.')
        setLoading(false)
      },
    )
    return unsubscribe
  }, [])

  return (
    <div className="page specialists-page">
      <div className="container">
        <header className="specialists-page__header">
          <h1 className="page__title">შემსრულებლები</h1>
          <p className="page__subtitle">
            გაეცანი სპეციალისტების პროფილებს, რეიტინგებს და ბიზნესის შეფასებებს.
          </p>
        </header>

        {error && <div className="specialists-page__error">{error}</div>}

        {loading ? (
          <p className="specialists-page__empty">იტვირთება...</p>
        ) : developers.length === 0 ? (
          <p className="specialists-page__empty">შემსრულებლები ჯერ არ არის დარეგისტრირებული.</p>
        ) : (
          <div className="specialists-grid">
            {developers.map((dev) => (
              <Link key={dev.id} to={`/specialists/${dev.id}`} className="specialist-card">
                <div className="specialist-card__top">
                  <span className="specialist-card__avatar">
                    <User size={18} />
                  </span>
                  <div>
                    <div className="specialist-card__name">{dev.name || dev.email}</div>
                    <div className="specialist-card__rating">
                      <Star size={12} style={{ display: 'inline', verticalAlign: '-2px' }} />{' '}
                      {formatDeveloperRating(dev)}
                    </div>
                  </div>
                </div>
                {dev.bio && <p className="specialist-card__bio">{dev.bio}</p>}
                {dev.experienceCategories?.length > 0 && (
                  <p className="specialist-card__categories">
                    {formatExperienceCategories(dev.experienceCategories)}
                  </p>
                )}
                <span className="specialist-card__link">პროფილის ნახვა →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Specialists
