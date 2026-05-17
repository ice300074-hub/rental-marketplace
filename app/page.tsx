{/* ===== NAVBAR ===== */}
<nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
  
  {/* Logo */}
  <a href="/" className="flex items-center gap-2">
    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
      <span className="text-white text-sm font-bold">R</span>
    </div>
    <h1 className="text-xl font-bold text-gray-900">Rent<span className="text-blue-600">Hub</span></h1>
  </a>

  {/* Right side */}
  <div className="flex gap-3 items-center">
    {user ? (
      // ===== LOGIN แล้ว =====
      <>
        <a href="/dashboard"
          className="text-gray-500 hover:text-blue-600 text-sm font-medium transition-colors hidden sm:block">
          Dashboard
        </a>
        <a href="/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm flex items-center gap-1">
          <span>+</span> ลงประกาศ
        </a>

        {/* Avatar Dropdown */}
        <div className="relative group">
          <button className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm hover:bg-blue-200 transition-colors">
            {user.email?.[0]?.toUpperCase()}
          </button>
          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <a href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              👤 โปรไฟล์
            </a>
            <a href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:hidden">
              📋 Dashboard
            </a>
            <hr className="my-1 border-gray-100"/>
            <button
              onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 text-left">
              🚪 ออกจากระบบ
            </button>
          </div>
        </div>
      </>
    ) : (
      // ===== ยังไม่ login =====
      <>
        <a href="/auth"
          className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
          เข้าสู่ระบบ
        </a>
        <a href="/auth"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm">
          สมัครสมาชิก
        </a>
      </>
    )}
  </div>
</nav>