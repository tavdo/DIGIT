import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import DeveloperCvSummary from '../DeveloperCvSummary'
import {
  approveDeveloperRequest,
  rejectDeveloperRequest,
  subscribeToPendingDeveloperRequests,
} from '../../services/superAdminService'

function AdminDevelopersPanel({ adminId, onError }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    const unsubscribe = subscribeToPendingDeveloperRequests(
      (items) => {
        setRequests(items)
        setLoading(false)
      },
      (err) => {
        onError(err.message || 'მოთხოვნების ჩატვირთვა ვერ მოხერხდა.')
        setLoading(false)
      },
    )

    return unsubscribe
  }, [onError])

  const handleApprove = async (requestId) => {
    if (!adminId) return
    setProcessingId(requestId)
    try {
      await approveDeveloperRequest(requestId, adminId)
    } catch (err) {
      onError(err.message || 'დადასტურება ვერ მოხერხდა.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId) => {
    if (!adminId) return
    setProcessingId(requestId)
    try {
      await rejectDeveloperRequest(requestId, adminId)
    } catch (err) {
      onError(err.message || 'უარყოფა ვერ მოხერხდა.')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return <div className="admin-panel__empty">იტვირთება...</div>
  }

  if (requests.length === 0) {
    return <div className="admin-panel__empty">ახალი შემსრულებლის მოთხოვნა არ არის.</div>
  }

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <div>
          <h2>შემსრულებლის მოთხოვნები</h2>
          <p>დაადასტურე ან უარყო ახალი შემსრულებლები.</p>
        </div>
      </div>

      <ul className="admin-requests">
        {requests.map((request) => (
          <li key={request.id} className="admin-request">
            <div className="admin-request__info">
              <strong>{request.name || 'უსახელო'}</strong>
              <span>{request.email}</span>
              <DeveloperCvSummary profile={request} />
            </div>
            <div className="admin-request__buttons">
              <button
                type="button"
                className="btn btn--primary btn--sm"
                disabled={processingId === request.id}
                onClick={() => handleApprove(request.id)}
              >
                <CheckCircle2 size={16} />
                დადასტურება
              </button>
              <button
                type="button"
                className="btn btn--outline btn--sm admin-request__reject"
                disabled={processingId === request.id}
                onClick={() => handleReject(request.id)}
              >
                <XCircle size={16} />
                უარყოფა
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AdminDevelopersPanel
