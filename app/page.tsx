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
  { label: 'ไม่เกิน ฿500/วัน', min: 0, max: 500 },
  { label: '฿500 - ฿1,000/วัน', min: 500, max: 1000 },
  { label: '฿1,000 - ฿3,000/วัน', min: 1000, max: 3000 },
  { label: '฿3,000 - ฿10,000/วัน', min: 3000, max: 10000 },
  { label: 'มากกว่า ฿10,000/วัน', min: 10000, max: Infinity },
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
      all.forEach((l: any) => {
        counts[l.category] = (counts[l.category] || 0) + 1
      })
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
    if (selectedCat) {
      result = result.filter(l => l.category === selectedCat)
    }
    if (selectedProvince) {
      result = result.filter(l =>
        l.location?.toLowerCase().includes(selectedProvince.toLowerCase())
      )
    }
    const priceRange = PRICE_RANGES[selectedPrice]
    if (priceRange && (priceRange.min > 0 || priceRange.max !== Infinity)) {
      result = result.filter(l =>
        l.price_per_day >= priceRange.min && l.price_per_day <= priceRange.max
      )
    }
    setFiltered(result)
  }, [search, selectedCat, selectedProvince, selectedPrice, listings])

  const hasFilter = selectedCat || selectedProvince || selectedPrice > 0 || search

  const clearAll = () => {
    setSearch('')
    setSelectedCat('')
    setSelectedProvince('')
    setSelectedPrice(0)
  }

  const categories = [
    { key: 'house', icon: '🏠', label: 'บ้าน / คอนโด' },
    { key: 'car', icon: '🚗', label: 'รถยนต์ / มอไซค์' },
    { key: 'equipment', icon: '🔧', label: 'อุปกรณ์ / เครื่องมือ' },
    { key: 'fashion', icon: '👗', label: 'เสื้อผ้า / แฟชั่น' },
  ]

  const categoryLabel: Record<string, string> = {
    house: '🏠 บ้าน/คอนโด',
    car: '🚗 รถยนต์',
    equipment: '🔧 อุปกรณ์',
    fashion: '👗 เสื้อผ้า',
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">RentHub</h1>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <a href="/dashboard" className="text-gray-600 hover:text-blue-600 text-sm">Dashboard</a>
              <a href="/profile" className="text-gray-600 hover:text-blue-600 text-sm">โปรไฟล์</a>
              <a href="/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">ลงประกาศ</a>
            </>
          ) : (
            <>
              <a href="/auth" className="text-gray-600 hover:text-blue-600 text-sm">เข้าสู่ระบบ</a>
              <a href="/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">ลงประกาศ</a>
            </>
          )}
        </div>
      </nav>

      {/* Hero + Search */}
      <section className="bg-blue-600 text-white py-16 px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">เช่าทุกอย่าง ในที่เดียว</h2>
        <p className="text-xl mb-8 text-blue-100">บ้าน • รถ • อุปกรณ์ • เสื้อผ้า</p>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto flex gap-2 mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาสิ่งที่อยากเช่า..."
            className="flex-1 px-4 py-3 rounded-lg text-gray-800 text-lg focus:outline-none"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${showFilters ? 'bg-blue-800 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}>
            🔧 ตัวกรอง
          </button>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50">
            ค้นหา
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="max-w-3xl mx-auto bg-white rounded-xl p-4 mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
            {/* จังหวัด */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">📍 จังหวัด</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400">
                <option value="">ทุกจังหวัด</option>
                {PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* หมวดหมู่ */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">📦 หมวดหมู่</label>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400">
                <option value="">ทุกหมวดหมู่</option>
                {categories.map(c => (
                  <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            {/* ราคา */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">💰 ช่วงราคา</label>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400">
                {PRICE_RANGES.map((p, i) => (
                  <option key={i} value={i}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active filters */}
        {hasFilter && (
          <div className="max-w-3xl mx-auto mt-3 flex flex-wrap gap-2 justify-center">
            {selectedProvince && (
              <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                📍 {selectedProvince}
                <button onClick={() => setSelectedProvince('')} className="ml-2 hover:text-blue-200">✕</button>
              </span>
            )}
            {selectedCat && (
              <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                {categoryLabel[selectedCat]}
                <button onClick={() => setSelectedCat('')} className="ml-2 hover:text-blue-200">✕</button>
              </span>
            )}
            {selectedPrice > 0 && (
              <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                💰 {PRICE_RANGES[selectedPrice].label}
                <button onClick={() => setSelectedPrice(0)} className="ml-2 hover:text-blue-200">✕</button>
              </span>
            )}
            <button onClick={clearAll} className="bg-white text-blue-600 text-xs px-3 py-1 rounded-full hover:bg-blue-50">
              ล้างทั้งหมด
            </button>
          </div>
        )}
      </section>

      {/* หมวดหมู่ */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">หมวดหมู่ยอดนิยม</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.key}
              onClick={() => setSelectedCat(selectedCat === cat.key ? '' : cat.key)}
              className={`bg-white rounded-xl p-6 text-center shadow-sm cursor-pointer border transition-all ${
                selectedCat === cat.key ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:border-blue-200'
              }`}>
              <div className="text-4xl mb-3">{cat.icon}</div>
              <p className="font-semibold text-gray-800">{cat.label}</p>
              <p className="text-sm text-gray-400 mt-1">{categoryCounts[cat.key] ?? 0} รายการ</p>
            </div>
          ))}
        </div>
      </section>

      {/* ประกาศ */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {selectedCat ? categories.find(c => c.key === selectedCat)?.label : 'ประกาศล่าสุด'}
            {selectedProvince && <span className="text-blue-500 ml-2 text-lg font-normal">📍 {selectedProvince}</span>}
            <span className="text-base font-normal text-gray-400 ml-2">({filtered.length} รายการ)</span>
          </h3>
          {hasFilter && (
            <button onClick={clearAll} className="text-sm text-blue-500 hover:underline">
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p>ไม่พบประกาศที่ค้นหา</p>
            <button onClick={clearAll}
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm">
              ล้างการค้นหา
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <a key={item.id} href={`/listings/${item.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden cursor-pointer block">
                {item.images && item.images.length > 0 ? (
                  <img src={item.images[0]} alt={item.title} className="w-full h-48 object-cover"/>
                ) : (
                  <div className="bg-gray-200 h-48 flex items-center justify-center text-gray-400 text-4xl">📷</div>
                )}
                <div className="p-4">
                  <p className="text-xs text-blue-500 mb-1">{categoryLabel[item.category] || item.category}</p>
                  <h4 className="font-semibold text-gray-800">{item.title}</h4>
                  {item.location && <p className="text-sm text-gray-400 mt-1">📍 {item.location}</p>}
                  <p className="text-blue-600 font-bold mt-2">
                    ฿{item.price_per_day?.toLocaleString()}
                    <span className="text-gray-400 font-normal text-sm"> / วัน</span>
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}