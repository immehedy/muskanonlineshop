'use client'

import { useState, useEffect } from 'react'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/dashboard')
      console.log({response})
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setStats(data)
    } catch (error: any) {
      setError(error.message || 'Failed to fetch dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  // Helper component for stat cards
  const StatCard = ({
    icon,
    label,
    value,
    prefix = '',
  }: {
    icon: React.ReactNode
    label: string
    value: number | string
    prefix?: string
  }) => (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-default">
      <div className="flex items-center">
        <div className="text-3xl">{icon}</div>
        <div className="ml-5">
          <p className="text-gray-600 uppercase tracking-wide text-sm">{label}</p>
          <p className="text-3xl font-extrabold">
            {prefix}
            {value}
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {loading && (
        <p className="text-gray-500 text-center py-10">Loading dashboard data...</p>
      )}

      {error && (
        <p className="text-red-600 text-center py-10">Error: {error}</p>
      )}

      {!loading && !error && stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard icon="📦" label="Total Products" value={100} />
            <StatCard icon="🛒" label="Total Orders" value={stats.totalProducts} />
            <StatCard icon="👥" label="Total Users" value={1} />
            <StatCard
              icon="💰"
              label="Total Revenue"
              value={stats.totalOrders}
              prefix="$"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
              {/* TODO: Replace with actual recent orders component */}
              <p className="text-gray-500 italic">No recent orders data available.</p>
            </section>

            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Low Stock Products</h2>
              {/* TODO: Replace with actual low stock products component */}
              <p className="text-gray-500 italic">No low stock products data available.</p>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
