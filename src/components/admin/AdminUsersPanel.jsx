import { useEffect, useState } from 'react'
import {
  ASSIGNABLE_ROLES,
  setUserRole,
  subscribeToAllUsers,
} from '../../services/superAdminService'
import { ROLE_LABELS } from '../../utils/roles'

function AdminUsersPanel({ adminId, onError }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const unsubscribe = subscribeToAllUsers(
      (items) => {
        setUsers(items)
        setLoading(false)
      },
      (err) => {
        onError(err.message || 'მომხმარებლების ჩატვირთვა ვერ მოხერხდა.')
        setLoading(false)
      },
    )

    return unsubscribe
  }, [onError])

  const handleRoleChange = async (userId, role) => {
    if (!adminId || userId === adminId) return

    setSavingId(userId)
    try {
      await setUserRole(userId, role, adminId)
    } catch (err) {
      onError(err.message || 'როლის შეცვლა ვერ მოხერხდა.')
    } finally {
      setSavingId(null)
    }
  }

  const filteredUsers = users.filter((user) => {
    const query = search.trim().toLowerCase()
    if (!query) return true
    return (
      user.email?.toLowerCase().includes(query)
      || user.name?.toLowerCase().includes(query)
      || user.role?.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return <div className="admin-panel__empty">იტვირთება...</div>
  }

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <div>
          <h2>მომხმარებლები და როლები</h2>
          <p>მიანიჭე მენეჯერი, შემსრულებელი ან ბიზნესის როლი.</p>
        </div>
        <input
          type="search"
          className="admin-section__search"
          placeholder="ძებნა ელ. ფოსტით ან სახელით..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>სახელი</th>
              <th>ელ. ფოსტა</th>
              <th>მიმდინარე როლი</th>
              <th>ახალი როლი</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name || '—'}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`admin-role-badge admin-role-badge--${user.role}`}>
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                </td>
                <td>
                  {user.id === adminId ? (
                    <span className="admin-table__self">შენ (ადმინი)</span>
                  ) : (
                    <select
                      className="admin-table__select"
                      value={user.role}
                      disabled={savingId === user.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      {ASSIGNABLE_ROLES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminUsersPanel
