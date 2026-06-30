import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import UserProfileEditor from '../components/profile/UserProfileEditor'
import UserStatsGrid from '../components/profile/UserStatsGrid'
import useUserOrderStats from '../hooks/useUserOrderStats'
import usePageMeta from '../hooks/usePageMeta'
import { pageTitle } from '../constants/brand'
import { getDefaultRouteForRole, resolveUserRole } from '../utils/roles'
import './Profile.css'

function Profile() {
  usePageMeta(pageTitle('პროფილი'), 'DIGIT — პროფილი და სტატისტიკა.')

  const { user, userProfile } = useAuth()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const role = resolveUserRole(userProfile)
  const { stats, loading, error: statsError } = useUserOrderStats(user, userProfile)

  const backTo = getDefaultRouteForRole(role)

  return (
    <div className="page profile-page">
      <div className="container profile-page__inner">
        <div className="profile-page__toolbar">
          <Link to={backTo} className="profile-page__back">
            <ArrowLeft size={16} />
            უკან
          </Link>
        </div>

        {error && <div className="profile-page__alert profile-page__alert--error">{error}</div>}
        {statsError && (
          <div className="profile-page__alert profile-page__alert--error">{statsError}</div>
        )}
        {message && (
          <div className="profile-page__alert profile-page__alert--success">{message}</div>
        )}

        <UserProfileEditor
          onError={setError}
          onSaved={() => {
            setError('')
            setMessage('პროფილი განახლდა.')
          }}
        />

        <UserStatsGrid
          role={role}
          stats={stats}
          userProfile={userProfile}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default Profile
