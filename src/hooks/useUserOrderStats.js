import { useEffect, useMemo, useState } from 'react'
import {
  subscribeToCustomerOrders,
  subscribeToDeveloperOrders,
  subscribeToOrders,
} from '../services/orderService'
import { resolveUserRole } from '../utils/roles'
import {
  getAdminPlatformStats,
  getCustomerOrderStats,
  getDeveloperStatsBundle,
  getManagerOrderStats,
} from '../utils/userStats'

export default function useUserOrderStats(user, userProfile) {
  const role = resolveUserRole(userProfile)

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(() => !!user?.uid && ['customer', 'developer', 'manager', 'admin'].includes(role))
  const [error, setError] = useState('')

  const [prevUserUid, setPrevUserUid] = useState(user?.uid)
  const [prevRole, setPrevRole] = useState(role)

  if (user?.uid !== prevUserUid || role !== prevRole) {
    setPrevUserUid(user?.uid)
    setPrevRole(role)
    if (!user?.uid || !['customer', 'developer', 'manager', 'admin'].includes(role)) {
      setOrders([])
      setLoading(false)
      setError('')
    } else {
      setLoading(true)
      setError('')
    }
  }

  useEffect(() => {
    if (!user?.uid || !['customer', 'developer', 'manager', 'admin'].includes(role)) {
      return undefined
    }

    const handleOrders = (list) => {
      setOrders(list)
      setLoading(false)
    }

    const handleError = (err) => {
      setError(err.message || 'სტატისტიკის ჩატვირთვა ვერ მოხერხდა.')
      setLoading(false)
    }

    if (role === 'customer') {
      return subscribeToCustomerOrders(user.uid, handleOrders, handleError)
    }

    if (role === 'developer') {
      return subscribeToDeveloperOrders(user.uid, handleOrders, handleError)
    }

    if (role === 'manager' || role === 'admin') {
      return subscribeToOrders('all', handleOrders, handleError)
    }

    return undefined
  }, [user?.uid, role])

  const stats = useMemo(() => {
    switch (role) {
      case 'customer':
        return getCustomerOrderStats(orders)
      case 'developer':
        return getDeveloperStatsBundle(orders)
      case 'manager':
        return getManagerOrderStats(orders, userProfile?.name)
      case 'admin':
        return getAdminPlatformStats(orders)
      default:
        return null
    }
  }, [orders, role, userProfile?.name])

  return { orders, stats, loading, error, role }
}
