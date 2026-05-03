'use client'
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { WEBSITE_LOGIN } from '@/routes/WebsiteRoute'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import userIcon from '@/public/assets/images/user.png'
import { FiPackage, FiUser, FiSettings, FiLogOut } from 'react-icons/fi'
import Link from 'next/link'
import { logout } from '@/store/reducer/authReducer'

const MyAccount = () => {
  const auth = useSelector(store => store.authStore.auth)
  const router = useRouter()
  const dispatch = useDispatch()

  const [orders, setOrders] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  useEffect(() => {
    if (!auth) {
      router.push(WEBSITE_LOGIN)
    } else {
      fetchOrders()
    }
  }, [auth, router])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        dispatch(logout(null))
        router.push('/')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!auth) return null

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 lg:px-32">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex flex-col items-center mb-8">
                <Avatar className="w-24 h-24 mb-4 border-4 border-primary/10">
                  <AvatarImage src={auth?.avatar_url || userIcon.src} />
                </Avatar>
                <h2 className="text-xl font-bold text-gray-800">{auth?.name || 'User'}</h2>
                <p className="text-sm text-gray-500">{auth?.email}</p>
              </div>

              <nav className="space-y-1">
                <Link href="/my-account" className="flex items-center gap-3 px-4 py-3 text-primary bg-primary/5 rounded-xl font-medium transition-all">
                  <FiUser className="text-lg" />
                  Dashboard
                </Link>
                <Link href="/my-account/orders" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                  <FiPackage className="text-lg" />
                  My Orders
                </Link>
                <Link href="/my-account/settings" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                  <FiSettings className="text-lg" />
                  Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all mt-4"
                >
                  <FiLogOut className="text-lg" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome back, {auth?.name?.split(' ')[0]}!</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-2xl text-white">
                  <p className="text-primary-foreground/80 text-sm mb-1">Total Orders</p>
                  <h3 className="text-3xl font-bold">{orders.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <p className="text-gray-500 text-sm mb-1">Wallet Balance</p>
                  <h3 className="text-3xl font-bold text-gray-900">$0.00</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <p className="text-gray-500 text-sm mb-1">Reviews</p>
                  <h3 className="text-3xl font-bold text-gray-900">0</h3>
                </div>
              </div>

              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                {loading ? (
                  <div className="h-20 bg-gray-50 animate-pulse rounded-xl"></div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <FiPackage className="text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">${order.payableAmount.toFixed(2)}</p>
                          <span className="text-[10px] font-bold text-orange-600 uppercase bg-orange-50 px-2 py-0.5 rounded-full">{order.status}</span>
                        </div>
                      </div>
                    ))}
                    <Link href="/my-account/orders" className="block text-center text-primary text-sm font-semibold hover:underline pt-2">
                      View All Orders
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <FiPackage className="text-4xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                    <Link href="/shop" className="text-primary font-medium hover:underline mt-2 inline-block">
                      Start shopping now
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Full Name</label>
                  <p className="font-medium text-gray-900">{auth?.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Email Address</label>
                  <p className="font-medium text-gray-900">{auth?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Phone</label>
                  <p className="font-medium text-gray-900">{auth?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Address</label>
                  <p className="font-medium text-gray-900">{auth?.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyAccount
