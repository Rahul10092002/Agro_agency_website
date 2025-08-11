"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/admin/login")
        return
      }

      if (requireAdmin && user.role !== "admin") {
        router.push("/")
        return
      }
    }
  }, [user, loading, requireAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
          <p className="text-lg font-hindi">लोड हो रहा है...</p>
        </div>
      </div>
    )
  }

  if (!user || (requireAdmin && user.role !== "admin")) {
    return null
  }

  return <>{children}</>
}
