'use client'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { WEBSITE_LOGIN } from '@/routes/WebsiteRoute'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import userIcon from '@/public/assets/images/user.png'
import { FiPackage, FiUser, FiSettings, FiLogOut, FiSave } from 'react-icons/fi'
import Link from 'next/link'
import { login, logout } from '@/store/reducer/authReducer'
import { toast } from 'react-toastify'

const AccountSettings = () => {
  const auth = useSelector(store => store.authStore.auth)
  const router = useRouter()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!auth) {
      router.push(WEBSITE_LOGIN)
    } else {
      setFormData({
        name: auth.name || '',
        phone: auth.phone || '',
        address: auth.address || ''
      })
    }
  }, [auth, router])

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.success) {
        dispatch(login(data.data)) // Update Redux state with new user data
        toast.success("Profile updated successfully")
      } else {
        toast.error(data.message || "Failed to update profile")
      }
    } catch (error) {
      toast.error("An error occurred while updating profile")
    } finally {
      setSaving(false)
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
                <Link href="/my-account/orders" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                  <FiPackage className="text-lg" />
                  My Orders
                </Link>
                <Link href="/my-account/settings" className="flex items-center gap-3 px-4 py-3 text-primary bg-primary/5 rounded-xl font-medium transition-all">
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
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Settings</h1>
              <p className="text-gray-500 mb-8 text-sm">Update your personal information and contact details.</p>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="space-y-2 text-gray-400">
                    <label className="text-sm font-semibold">Email Address (Read Only)</label>
                    <input 
                      type="email" 
                      value={auth?.email || ""}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 cursor-not-allowed outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="e.g. +880 17XXX XXXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Shipping Address</label>
                  <textarea 
                    rows="4"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    placeholder="Enter your full shipping address"
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    disabled={saving}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 ${
                      saving ? 'bg-gray-400 cursor-wait' : 'bg-primary text-white hover:bg-primary/90 active:scale-95'
                    }`}
                  >
                    <FiSave className="text-lg" />
                    {saving ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountSettings
