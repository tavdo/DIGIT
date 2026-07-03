import { useEffect, useState } from 'react'
import {
  subscribeToAllUsers,
  setUserRole,
  ASSIGNABLE_ROLES,
} from '../../services/superAdminService'
import { ROLE_LABELS } from '../../utils/roles'
import { Loader2 } from 'lucide-react'

export default function AdminUsersPanel({ adminId, onError }) {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState(null)

  const [prevOnError, setPrevOnError] = useState(() => onError)
  if (onError !== prevOnError) {
    setPrevOnError(() => onError)
    setLoading(true)
  }

  useEffect(() => {
    const unsubscribe = subscribeToAllUsers(
      (data) => {
        setUsers(data)
        setLoading(false)
      },
      (err) => {
        onError?.(err.message || 'მომხმარებლების ჩატვირთვა ვერ მოხერხდა')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [onError])

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId)
    try {
      await setUserRole(userId, newRole, adminId)
    } catch (err) {
      onError?.(err.message || 'როლის შეცვლა ვერ მოხერხდა')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const filteredUsers = users.filter((user) => {
    const term = search.toLowerCase()
    return (
      (user.email || '').toLowerCase().includes(term) ||
      (user.displayName || '').toLowerCase().includes(term)
    )
  })

  if (loading) {
    return (
      <div className="admin-panel__empty">
        <Loader2 className="animate-spin" style={{ margin: '0 auto' }} size={24} />
        <p style={{ marginTop: '0.5rem' }}>იტვირთება მომხმარებლები...</p>
      </div>
    )
  }

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <div>
          <h2>მომხმარებლების მართვა ({users.length})</h2>
          <p>აქ შეგიძლიათ მომხმარებლების ძებნა და მათი როლების მართვა</p>
        </div>
        <input
          type="text"
          placeholder="მოძებნე ელ.ფოსტით ან სახელით..."
          className="admin-section__search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="admin-panel__empty">
          <p>მომხმარებლები ვერ მოიძებნა</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ელ. ფოსტა</th>
                <th>სახელი</th>
                <th>მიმდინარე როლი</th>
                <th>როლის შეცვლა</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isSelf = user.id === adminId
                const userRole = user.role || 'customer'
                return (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {user.email}
                        {isSelf && <span className="admin-table__self">(საკუთარი)</span>}
                      </div>
                    </td>
                    <td>{user.displayName || '—'}</td>
                    <td>
                      <span className={`admin-role-badge admin-role-badge--${userRole}`}>
                        {ROLE_LABELS[userRole] || userRole}
                      </span>
                    </td>
                    <td>
                      {isSelf ? (
                        <span className="admin-table__self">როლის შეცვლა შეზღუდულია</span>
                      ) : (
                        <select
                          className="admin-table__select"
                          value={userRole}
                          disabled={updatingUserId === user.id}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        >
                          {ASSIGNABLE_ROLES.map((roleOpt) => (
                            <option key={roleOpt.value} value={roleOpt.value}>
                              {roleOpt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
