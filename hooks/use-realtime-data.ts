"use client"

import { useEffect } from "react"
import { useWebSocket } from "./use-websocket"
import { useApi, UseApiOptions } from "./use-api"
import { cacheManager } from "@/lib/cache-manager"

export function useRealtimeData<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions & {
    realtimeEvents?: string[]
    outletId?: string
  } = {}
) {
  const { realtimeEvents = [], outletId, ...apiOptions } = options
  const result = useApi(apiCall, apiOptions)
  const { on, off } = useWebSocket(outletId)

  useEffect(() => {
    if (realtimeEvents.length === 0) return

    const handleRealtimeUpdate = () => {
      // Invalidate cache and refetch
      if (apiOptions.cacheKey) {
        cacheManager.delete(apiOptions.cacheKey)
      }
      result.refetch()
    }

    // Subscribe to all specified events
    realtimeEvents.forEach(event => {
      on(event, handleRealtimeUpdate)
    })

    return () => {
      realtimeEvents.forEach(event => {
        off(event)
      })
    }
  }, [realtimeEvents, on, off, result.refetch, apiOptions.cacheKey])

  return result
}

// Enhanced hooks with real-time updates
export function useRealtimeInventory(outletId?: string) {
  return useRealtimeData(
    async () => {
      const { apiClient } = await import("@/lib/api-unified")
      return apiClient.inventory.getItems(outletId)
    },
    {
      cacheKey: `inventory-items-${outletId || 'all'}`,
      cacheDuration: 1 * 60 * 1000,
      realtimeEvents: ['inventory:updated', 'sale:completed', 'transfer:completed', 'return:approved', 'return:restocked'],
      outletId
    }
  )
}

export function useRealtimeSales(outletId?: string) {
  return useRealtimeData(
    async () => {
      const { apiClient } = await import("@/lib/api-unified")
      return apiClient.sales.getAll({ outletId })
    },
    {
      cacheKey: `sales-${JSON.stringify({ outletId })}`,
      cacheDuration: 30 * 1000,
      realtimeEvents: ['sale:completed'],
      outletId
    }
  )
}

export function useRealtimeDailySummary(outletId?: string) {
  return useRealtimeData(
    async () => {
      const { apiClient } = await import("@/lib/api-unified")
      return apiClient.sales.getDailySummary(outletId)
    },
    {
      cacheKey: `daily-summary-${outletId || 'all'}`,
      cacheDuration: 30 * 1000,
      realtimeEvents: ['sale:completed', 'return:approved'],
      outletId
    }
  )
}

export function useRealtimeReturns(outletId?: string) {
  return useRealtimeData(
    async () => {
      const { apiClient } = await import("@/lib/api-unified")
      return apiClient.returns.getAll(outletId)
    },
    {
      cacheKey: `returns-${outletId || 'all'}`,
      cacheDuration: 1 * 60 * 1000,
      realtimeEvents: ['return:approved', 'return:restocked'],
      outletId
    }
  )
}
