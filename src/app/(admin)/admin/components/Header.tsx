'use client'

import { useRouter } from 'next/navigation'

export function Header() {
  const router = useRouter()

  const handleLogout = async () => {
    document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/admin/login')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </header>
  )
}