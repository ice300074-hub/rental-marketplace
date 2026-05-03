'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const PROVINCES = [
  'กรุงเทพมหานคร', 'เชียงใหม่', 'เชียงราย', 'ภูเก็ต', 'ชลบุรี',
  'ขอนแก่น', 'นครราชสีมา', 'อุดรธานี', 'สงขลา', 'สุราษฎร์ธานี',
  'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'นครปฐม', 'อยุธยา',
  'ลำปาง', 'พิษณุโลก', 'อุบลราชธานี', 'มหาสารคาม', 'ระยอง',
  'กาญจนบุรี', 'เพชรบุรี', 'ประจวบคีรีขันธ์', 'ตรัง', 'กระบี่',
  'นครศรีธรรมราช', 'พัทลุง', 'ยะลา', 'ปัตตานี', 'นราธิวาส',
]

const PRICE_RANGES = [
  { label: 'ทุกราคา', min: 0, max: Infinity },
  { label: 'ไม่เกิน ฿500', min: 0, max: 500 },
  { label: '฿500 - ฿1,000', min: 500, max: 1000 },
  { label: '฿1,000 - ฿5,000', min: 1000, max: 5000 },
  { label: '฿5,000 - ฿15,000', min: 5000, max: 15000 },
  { label: 'มากกว่า ฿15,000', min: 15000, max: Infinity },
]

export default function Home() {
  const [listings, setListings] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedPrice, setSelectedPrice] = useState(0)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
      const all = data || []
      setListings(all)
      setFiltered(all)
      const counts: Record<string, number> = {}
      all.forEach((l: any) => { counts[l.category] = (counts[l.category] || 0) + 1 })
      setCategoryCounts(counts)
    }
    fetchData()
  }, [])

  useEffect(() => {
    let result = listings
    if (search) {
      result = result.filter(l =>
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.location?.toLowerCase().includes(search.toLowerCase()) ||
        l.description?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (selectedCat) result = result.filter(l => l.category === selectedCat)
    if (selectedProvince) result = result.filter(l => l.location?.toLowerCase().includes(selectedProvince.toLowerCase()))
    const priceRange = PRICE_RANGES[selectedPrice]
    if (priceRange && (priceRange.min > 0 || priceRange.max !== Infinity)) {
      result = result.filter(l => {
        const price = l.category === 'villa' ? l.price_per_day : (l.price_per_month || l.price_per_day)
        return price >= priceRange.min && price <= priceRange.max
      })
    }
    setFiltered(result)
  }, [search, selectedCat, selectedProvince, selectedPrice, listings])

  const hasFilter = selectedCat || selectedProvince || selectedPrice > 0 || search
  const clearAll = () => { setSearch(''); setSelectedCat(''); setSelectedProvince(''); setSelectedPrice(0) }

  const categories = [
    { key: 'house', icon: '🏠', label: 'บ้าน / คอนโด', color: 'bg-blue-50 border-blue-100' },
    { key: 'villa', icon: '🏖️', label: 'พูลวิลล่า', color: 'bg-cyan-50 border-cyan-100' },
    { key: 'office', icon: '🏢', label: 'ออฟฟิศ', color: 'bg-purple-50 border-purple-100' },
    { key: 'car', icon: '🚗', label: 'รถยนต์ / มอไซค์', color: 'bg-yellow-50 border-yellow-100' },
    { key: 'equipment', icon: '🔧', label: 'อุปกรณ์', color: 'bg-orange-50 border-orange-100' },
    { key: 'fashion', icon: '👗', label: 'เสื้อผ้า', color: 'bg-pink-50 border-pink-100' },
  ]

  const categoryLabel: Record<string, string> = {
    house: '🏠 บ้าน/คอนโด', villa: '🏖️ พูลวิลล่า', office: '🏢 ออฟฟิศ',
    car: '🚗 รถยนต์', equipment: '🔧 อุปกรณ์', fashion: '👗 เสื้อผ้า',
  }

  const getPriceLabel = (item: any) => {
    if (item.category === 'villa') return (
      <p className="text-blue-600 font-bold mt-2 text-lg">
        ฿{item.price_per_day?.toLocaleString()}
        <span className="text-gray-400 font-normal text-sm"> / คืน</span>
      </p>
    )
    if (item.category === 'house' || item.category === 'office') return (
      <p className="text-blue-600 font-bold mt-2 text-lg">
        ฿{item.price_per_month?.toLocaleString()}
        <span className="text-gray-400 font-normal text-sm"> / เดือน</span>
      </p>
    )
    return (
      <p className="text-blue-600 font-bold mt-2 text-lg">
        ฿{item.price_per_day?.toLocaleString()}
        <span className="text-gray-400 font-normal text-sm"> / วัน</span>
      </p>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ===== NAVBAR ===== */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">R</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Rent<span className="text-blue-600">Hub</span></h1>
        </div>
        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <a href="/dashboard" className="text-gray-500 hover:text-blue-600 text-sm font-medium transition-colors">Dashboard</a>
              <a href="/profile" className="text-gray-500 hover:text-blue-600 text-sm font-medium transition-colors">โปรไฟล์</a>
              <a href="/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm">
                + ลงประกาศ
              </a>
            </>
          ) : (
            <>
              <a href="/auth" className="text-gray-500 hover:text-blue-600 text-sm font-medium transition-colors">เข้าสู่ระบบ</a>
              <a href="/auth" className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors">สมัครสมาชิก</a>
              <a href="/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm">
                + ลงประกาศ
              </a>
            </>
          )}
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white overflow-hidden">
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"/>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"/>

        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>มีประกาศใหม่วันนี้ {listings.length} รายการ</span>
          </div>

          <h2 className="text-5xl font-bold mb-4 leading-tight">
            เช่าทุกอย่าง<br/>
            <span className="text-blue-200">ในที่เดียว</span>
          </h2>
          <p className="text-xl mb-10 text-blue-100 font-light">
            บ้าน • พูลวิลล่า • ออฟฟิศ • รถ • อุปกรณ์ • เสื้อผ้า
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-2 flex gap-2 shadow-2xl">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setShowFilters(false)}
                placeholder="ค้นหาสิ่งที่อยากเช่า..."
                className="flex-1 px-4 py-3 text-gray-800 text-base focus:outline-none rounded-xl"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-1 ${
                  showFilters ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
                }`}>
                ⚙️ กรอง
              </button>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm">
                ค้นหา
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-white rounded-2xl p-4 mt-3 grid grid-cols-3 gap-3 text-left shadow-xl">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">📍 จังหวัด</label>
                  <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400 bg-gray-50">
                    <option value="">ทุกจังหวัด</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">📦 หมวดหมู่</label>
                  <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400 bg-gray-50">
                    <option value="">ทุกหมวดหมู่</option>
                    {categories.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">💰 ช่วงราคา</label>
                  <select value={selectedPrice} onChange={(e) => setSelectedPrice(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400 bg-gray-50">
                    {PRICE_RANGES.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {hasFilter && (
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {selectedProvince && (
                  <span className="bg-white bg-opacity-20 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                    📍 {selectedProvince}
                    <button onClick={() => setSelectedProvince('')} className="hover:text-blue-200 ml-1">✕</button>
                  </span>
                )}
                {selectedCat && (
                  <span className="bg-white bg-opacity-20 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                    {categoryLabel[selectedCat]}
                    <button onClick={() => setSelectedCat('')} className="hover:text-blue-200 ml-1">✕</button>
                  </span>
                )}
                {selectedPrice > 0 && (
                  <span className="bg-white bg-opacity-20 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                    💰 {PRICE_RANGES[selectedPrice].label}
                    <button onClick={() => setSelectedPrice(0)} className="hover:text-blue-200 ml-1">✕</button>
                  </span>
                )}
                <button onClick={clearAll} className="bg-white bg-opacity-20 text-white text-xs px-3 py-1.5 rounded-full hover:bg-opacity-30">
                  ล้างทั้งหมด
                </button>
              </div>
            )}
          </div>

          {/* Trust Signals */}
          <div className="flex justify-center gap-8 mt-10 text-blue-200 text-sm">
            <div className="flex items-center gap-2">
              <span>✅</span> ปลอดภัย มีระบบมัดจำ
            </div>
            <div className="flex items-center gap-2">
              <span>⭐</span> รีวิวจากผู้เช่าจริง
            </div>
            <div className="flex items-center gap-2">
              <span>💬</span> ติดต่อผู้ให้เช่าโดยตรง
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">หมวดหมู่</h3>
            <p className="text-gray-400 text-sm mt-1">เลือกประเภทที่คุณต้องการเช่า</p>
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <div key={cat.key}
              onClick={() => setSelectedCat(selectedCat === cat.key ? '' : cat.key)}
              className={`rounded-2xl p-4 text-center cursor-pointer border-2 transition-all hover:scale-105 ${
                selectedCat === cat.key
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : `${cat.color} hover:border-blue-300 hover:shadow-sm`
              }`}>
              <div className="text-3xl mb-2">{cat.icon}</div>
              <p className="font-semibold text-gray-800 text-xs leading-tight">{cat.label}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">
                {categoryCounts[cat.key] ?? 0} รายการ
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== LISTINGS ===== */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {selectedCat ? categories.find(c => c.key === selectedCat)?.label : 'ประกาศล่าสุด'}
              {selectedProvince && <span className="text-blue-500 ml-2 text-lg font-normal">📍 {selectedProvince}</span>}
            </h3>
            <p className="text-gray-400 text-sm mt-1">พบ {filtered.length} รายการ</p>
          </div>
          {hasFilter && (
            <button onClick={clearAll} className="text-sm text-blue-500 hover:text-blue-700 font-medium border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-gray-500 text-lg font-medium">ไม่พบประกาศที่ค้นหา</p>
            <p className="text-gray-400 text-sm mt-2">ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง</p>
            <button onClick={clearAll}
              className="mt-6 inline-block bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              ล้างการค้นหา
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <a key={item.id} href={`/listings/${item.id}`}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden cursor-pointer block group">
                <div className="relative overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img src={item.images[0]} alt={item.title}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"/>
                  ) : (
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-52 flex items-center justify-center text-gray-300 text-5xl">
                      📷
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white bg-opacity-90 backdrop-blur-sm text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                      {categoryLabel[item.category] || item.category}
                    </span>
                  </div>
                  {item.category === 'villa' && item.max_guests && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                        👥 {item.max_guests} คน
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 text-base leading-snug line-clamp-1">{item.title}</h4>
                  {item.location && (
                    <p className="text-sm text-gray-400 mt-1.5 flex items-center gap-1">
                      <span>📍</span> {item.location}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    {getPriceLabel(item)}
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">ว่างให้เช่า</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">R</span>
                </div>
                <span className="text-white font-bold text-lg">Rent<span className="text-blue-400">Hub</span></span>
              </div>
              <p className="text-sm leading-relaxed">แพลตฟอร์มเช่าสินค้าออนไลน์ที่น่าเชื่อถือ บ้าน วิลล่า ออฟฟิศ รถ และอีกมากมาย</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">ลิงก์ด่วน</h4>
              <div className="space-y-2 text-sm">
                <a href="/" className="block hover:text-white transition-colors">หน้าแรก</a>
                <a href="/create" className="block hover:text-white transition-colors">ลงประกาศ</a>
                <a href="/auth" className="block hover:text-white transition-colors">สมัครสมาชิก</a>
                <a href="/dashboard" className="block hover:text-white transition-colors">Dashboard</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">ติดต่อเรา</h4>
              <div className="space-y-2 text-sm">
                <p>📧 ice300074@gmail.com</p>
                <p>🌐 rental-marketplace-red.vercel.app</p>
                <p className="mt-4 text-xs">© 2025 RentHub · สงวนลิขสิทธิ์</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-wrap justify-between items-center gap-4 text-xs">
            <p>© 2025 RentHub — แพลตฟอร์มเช่าสินค้าออนไลน์</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</a>
              <a href="#" className="hover:text-white transition-colors">เงื่อนไขการใช้งาน</a>
              <a href="#" className="hover:text-white transition-colors">ช่วยเหลือ</a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  )
}