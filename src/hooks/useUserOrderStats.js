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
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const role = resolveUserRole(userProfile)

  useEffect(() => {
    if (!user?.uid) {
      setOrders([])
      setLoading(false)
      return undefined
    }

    setLoading(true)
    setError('')

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

    setLoading(false)
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
