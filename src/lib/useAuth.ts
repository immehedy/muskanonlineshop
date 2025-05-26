'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        router.push('/admin/login')
      }
    } catch {
      setIsAuthenticated(false)
      router.push('/admin/login')
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return { isAuthenticated, logout }
}