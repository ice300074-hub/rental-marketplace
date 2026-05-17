'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [viewStats, setViewStats] = useState<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState<'listings' | 'analytics'>('listings')

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('listings')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
        const listingData = data || []
        setListings(listingData)

        // ดึง view count สำหรับทุก listing
        if (listingData.length > 0) {
          const stats: Record<string, number> = {}
          for (const listing of listingData) {
            const { count } = await supabase
              .from('listing_views')
              .select('*', { count: 'exact', head: true })
              .eq('listing_id', listing.id)
            stats[listing.id] = count || 0
          }
          setViewStats(stats)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const toggleAvailable = async (id: string, current: boolean) => {
    await supabase.from('listings').update({ is_available: !current }).eq('id', id)
    setListings(listings.map(l => l.id === id ? { ...l, is_available: !current } : l))
  }

  const deleteListing = async (id: string) => {
    await supabase.from('listings').delete().eq('id', id)
    setListings(listings.filter(l => l.id !== id))
  }

  const getPriceLabel = (listing: any) => {
    if (listing.category === 'villa') return `฿${listing.price_per_day?.toLocaleString()}/คืน`
    if (listing.category === 'house' || listing.category === 'office') return `฿${listing.price_per_month?.toLocaleString()}/เดือน`
    return `฿${listing.price_per_day?.toLocaleString()}/วัน`
  }

  const totalViews = Object.values(viewStats).reduce((a, b) => a + b, 0)

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">กำลังโหลด...</p>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">กรุณาเข้าสู่ระบบก่อน</p>
        <a href="/auth" className="bg-blue-600 text-white px-6 py-2 rounded-lg">เข้าสู่ระบบ</a>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-blue-600">RentHub</a>
        <div className="flex gap-4 items-center">
          <span className="text-sm text-gray-500">{user.email}</span>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
            className="text-sm text-red-400 hover:text-red-600">ออกจากระบบ</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard ของฉัน</h2>
            <p className="text-gray-400 mt-1">จัดการประกาศทั้งหมดของคุณ</p>
          </div>
          <a href="/create" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm">
            + ลงประกาศใหม่
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
            <p className="text-3xl font-bold text-blue-600">{listings.length}</p>
            <p className="text-sm text-gray-400 mt-1">ประกาศทั้งหมด</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
            <p className="text-3xl font-bold text-green-500">{listings.filter(l => l.is_available).length}</p>
            <p className="text-sm text-gray-400 mt-1">เปิดให้เช่า</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
            <p className="text-3xl font-bold text-gray-400">{listings.filter(l => !l.is_available).length}</p>
            <p className="text-sm text-gray-400 mt-1">ปิดชั่วคราว</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
            <p className="text-3xl font-bold text-purple-500">{totalViews}</p>
            <p className="text-sm text-gray-400 mt-1">ยอดดูรวม</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'listings' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
            ประกาศของฉัน
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
            📊 Analytics
          </button>
        </div>

        {/* Tab: ประกาศ */}
        {activeTab === 'listings' && (
          <>
            {listings.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
                <p className="text-5xl mb-4">📋</p>
                <p className="text-gray-500 mb-4">ยังไม่มีประกาศ</p>
                <a href="/create" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm">ลงประกาศแรก</a>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-xl border border-gray-100 p-5 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-800">{listing.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${listing.is_available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {listing.is_available ? 'เปิดให้เช่า' : 'ปิดชั่วคราว'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {listing.category} • {getPriceLabel(listing)}
                        {listing.location && ` • ${listing.location}`}
                        {viewStats[listing.id] !== undefined && ` • 👁 ${viewStats[listing.id]} ครั้ง`}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => toggleAvailable(listing.id, listing.is_available)}
                        className="text-xs px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        {listing.is_available ? 'ปิด' : 'เปิด'}
                      </button>
                      <button
                        onClick={() => deleteListing(listing.id)}
                        className="text-xs px-3 py-2 border border-red-200 text-red-400 rounded-lg hover:bg-red-50">
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">📊 ยอดดูแต่ละประกาศ</h3>
              {listings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">ยังไม่มีประกาศ</p>
              ) : (
                <div className="space-y-4">
                  {listings.map((listing) => {
                    const views = viewStats[listing.id] || 0
                    const maxViews = Math.max(...Object.values(viewStats), 1)
                    const percent = Math.round((views / maxViews) * 100)
                    return (
                      <div key={listing.id}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-700 truncate max-w-xs">{listing.title}</span>
                          <span className="text-sm font-semibold text-gray-800 ml-2">{views} ครั้ง</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${percent}%` }}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              💡 ยอดดูถูกนับทุกครั้งที่มีคนเปิดหน้าจอง และหน้าดูรายละเอียดประกาศ
            </div>
          </div>
        )}
      </div>
    </main>
  )
}