import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import DeveloperPublicProfile from '../components/profile/DeveloperPublicProfile'
import {
  fetchDeveloperProfile,
  subscribeToDeveloperReviews,
  subscribeToDeveloperReviewsFromOrders,
} from '../services/developerReviewService'
import usePageMeta from '../hooks/usePageMeta'
import { pageTitle } from '../constants/brand'
import { isManagerOrAdmin, resolveUserRole } from '../utils/roles'
import './Specialists.css'

function SpecialistProfile() {
  const { developerId } = useParams()
  const { userProfile } = useAuth()
  const role = resolveUserRole(userProfile)
  const isStaffViewer = isManagerOrAdmin(role)

  const [profile, setProfile] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    fetchDeveloperProfile(developerId)
      .then((data) => {
        if (!cancelled) {
          if (!data) setError('შემსრულებელი ვერ მოიძებნა.')
          setProfile(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'პროფილის ჩატვირთვა ვერ მოხერხდა.')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [developerId])

  const [prevDeveloperId, setPrevDeveloperId] = useState(developerId)
  const [prevIsStaffViewer, setPrevIsStaffViewer] = useState(isStaffViewer)

  if (developerId !== prevDeveloperId || isStaffViewer !== prevIsStaffViewer) {
    setPrevDeveloperId(developerId)
    setPrevIsStaffViewer(isStaffViewer)
    setReviewsLoading(true)
  }

  useEffect(() => {
    if (!developerId) return undefined

    const subscribe = isStaffViewer
      ? subscribeToDeveloperReviewsFromOrders
      : subscribeToDeveloperReviews

    const unsubscribe = subscribe(
      developerId,
      (items) => {
        setReviews(items)
        setReviewsLoading(false)
      },
      (err) => {
        setError(err.message || 'შეფასებების ჩატვირთვა ვერ მოხერხდა.')
        setReviewsLoading(false)
      },
    )

    return unsubscribe
  }, [developerId, isStaffViewer])

  usePageMeta(
    pageTitle(profile?.name ? `${profile.name} — შემსრულებელი` : 'შემსრულებელი'),
    'DIGIT — სპეციალისტის პროფილი და შეფასებები.',
  )

  return (
    <div className="page specialists-page">
      <div className="container specialists-page__inner">
        <Link to="/specialists" className="specialists-page__back">
          <ArrowLeft size={16} />
          ყველა შემსრულებელი
        </Link>

        {error && <div className="specialists-page__error">{error}</div>}

        {loading ? (
          <p className="specialists-page__empty">იტვირთება...</p>
        ) : profile ? (
          <DeveloperPublicProfile
            profile={profile}
            reviews={reviews}
            reviewsLoading={reviewsLoading}
          />
        ) : null}
      </div>
    </div>
  )
}

export default SpecialistProfile
