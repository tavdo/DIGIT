import { useEffect, useState } from 'react'
import {
  subscribeToPendingDeveloperRequests,
  approveDeveloperRequest,
  rejectDeveloperRequest,
} from '../../services/superAdminService'
import {
  formatExperienceCategories,
  formatExperienceYears,
} from '../../utils/developerProfile'
import { Check, X, Loader2 } from 'lucide-react'

export default function AdminDevelopersPanel({ adminId, onError }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actioningId, setActioningId] = useState(null)

  const [prevOnError, setPrevOnError] = useState(() => onError)
  if (onError !== prevOnError) {
    setPrevOnError(() => onError)
    setLoading(true)
  }

  useEffect(() => {
    const unsubscribe = subscribeToPendingDeveloperRequests(
      (data) => {
        setRequests(data)
        setLoading(false)
      },
      (err) => {
        onError?.(err.message || 'მოთხოვნების ჩატვირთვა ვერ მოხერხდა')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [onError])

  const handleApprove = async (userId) => {
    setActioningId(userId)
    try {
      await approveDeveloperRequest(userId, adminId)
    } catch (err) {
      onError?.(err.message || 'მოთხოვნის დადასტურება ვერ მოხერხდა')
    } finally {
      setActioningId(null)
    }
  }

  const handleReject = async (userId) => {
    setActioningId(userId)
    try {
      await rejectDeveloperRequest(userId, adminId)
    } catch (err) {
      onError?.(err.message || 'მოთხოვნის უარყოფა ვერ მოხერხდა')
    } finally {
      setActioningId(null)
    }
  }

  if (loading) {
    return (
      <div className="admin-panel__empty">
        <Loader2 className="animate-spin" style={{ margin: '0 auto' }} size={24} />
        <p style={{ marginTop: '0.5rem' }}>იტვირთება მოთხოვნები...</p>
      </div>
    )
  }

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <div>
          <h2>შემსრულებლების მოთხოვნები ({requests.length})</h2>
          <p>განაცხადები შემსრულებლის როლის მისაღებად, რომლებიც ელოდებიან განხილვას</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="admin-panel__empty">
          <p>აქტიური მოთხოვნები არ არის</p>
        </div>
      ) : (
        <div className="admin-requests">
          {requests.map((req) => {
            const isBusy = actioningId === req.id
            return (
              <div key={req.id} className="admin-request">
                <div className="admin-request__info">
                  <strong>{req.displayName || req.name || 'სახელის გარეშე'}</strong>
                  <span>ელ.ფოსტა: {req.email}</span>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>გამოცდილება:</strong> {formatExperienceYears(req.experienceYears)}
                    </p>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>კატეგორიები:</strong> {formatExperienceCategories(req.experienceCategories)}
                    </p>
                    {req.bio && (
                      <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-color)', fontStyle: 'italic' }}>
                        &ldquo;{req.bio}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="admin-request__buttons">
                  <button
                    type="button"
                    className="btn btn--accent btn--sm"
                    disabled={isBusy}
                    onClick={() => handleApprove(req.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    {isBusy ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <Check size={14} />
                    )}
                    დადასტურება
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm admin-request__reject"
                    disabled={isBusy}
                    onClick={() => handleReject(req.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    {isBusy ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <X size={14} />
                    )}
                    უარყოფა
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
