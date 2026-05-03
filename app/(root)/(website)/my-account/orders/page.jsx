'use client'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { WEBSITE_LOGIN } from '@/routes/WebsiteRoute'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import userIcon from '@/public/assets/images/user.png'
import { FiPackage, FiUser, FiSettings, FiLogOut, FiChevronRight } from 'react-icons/fi'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { logout } from '@/store/reducer/authReducer'
import Image from 'next/image'

const MyOrders = () => {
  const auth = useSelector(store => store.authStore.auth)
  const router = useRouter()
  const dispatch = useDispatch()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      router.push(WEBSITE_LOGIN)
      return
    }
    fetchOrders()
  }, [auth])

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
                <Link href="/my-account" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                  <FiUser className="text-lg" />
                  Dashboard
                </Link>
                <Link href="/my-account/orders" className="flex items-center gap-3 px-4 py-3 text-primary bg-primary/5 rounded-xl font-medium transition-all">
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
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <span className="text-sm text-gray-500">{orders.length} Orders found</span>
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl"></div>
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-2xl p-4 hover:border-primary/30 transition-all bg-white shadow-sm">
                      <div className="flex flex-wrap justify-between items-center gap-4 mb-4 pb-4 border-b">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Order ID</p>
                          <p className="text-sm font-bold text-gray-900">#{order.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Date</p>
                          <p className="text-sm font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                            order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">Total</p>
                          <p className="text-sm font-bold text-primary">${order.payableAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border">
                              {item.product.media[0] ? (
                                <Image 
                                  src={item.product.media[0].secure_url} 
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <FiPackage className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6">Looks like you haven't placed any orders with us yet.</p>
                  <Link href="/shop" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                    Explore Shop
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyOrders
