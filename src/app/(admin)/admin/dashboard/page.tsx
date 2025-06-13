'use client'

import { useState, useEffect } from 'react'

interface DashboardStats {
  averageOrderValue: number
  pendingOrders: number
  processingOrders: number
  totalOrders: number
  totalRevenue: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    processingOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Dashboard stats:', data)
      
      // Assuming your API returns the stats in a 'data' property
      // Adjust this based on your actual API response structure
      setStats(data?.data || data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setError('Failed to fetch dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading dashboard stats...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
        <button 
          onClick={fetchDashboardStats}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-2xl">📦</div>
            <div className="ml-4">
              <p className="text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-2xl">⚙️</div>
            <div className="ml-4">
              <p className="text-gray-600">Processing Orders</p>
              <p className="text-2xl font-bold">{stats.processingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-2xl">🛒</div>
            <div className="ml-4">
              <p className="text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-2xl">💰</div>
            <div className="ml-4">
              <p className="text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">৳{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          {/* Add recent orders component here */}
          <p className="text-gray-500">Recent orders will be displayed here</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Low Stock Products</h3>
          {/* Add low stock products component here */}
          <p className="text-gray-500">Low stock products will be displayed here</p>
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
