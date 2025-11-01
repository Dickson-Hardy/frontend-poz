'use client'

import { useApi, useMutation } from './use-api'
import { apiClient } from '@/lib/api-unified'

export function useReturns(outletId?: string, status?: string) {
  const { data, loading, error, refetch } = useApi(
    () => apiClient.returns.getAll(outletId, status),
    {
      cacheKey: `returns-${outletId || 'all'}-${status || 'all'}`,
      immediate: true,
    }
  )

  return {
    returns: data || [],
    loading,
    error,
    refetch,
  }
}

export function useReturn(id: string) {
  return useApi(
    () => apiClient.returns.getById(id),
    {
      cacheKey: `return-${id}`,
      immediate: !!id,
    }
  )
}

export function useReturnStats(outletId?: string) {
  return useApi(
    () => apiClient.returns.getStats(outletId),
    {
      cacheKey: `return-stats-${outletId || 'all'}`,
      immediate: true,
    }
  )
}

export function useReturnMutations() {
  const createReturn = useMutation(
    (returnData: any) => apiClient.returns.create(returnData),
    {
      invalidateCache: ['returns-', 'return-stats-', 'sales-'],
    }
  )

  const approveReturn = useMutation(
    (id: string) => apiClient.returns.approve(id),
    {
      invalidateCache: ['returns-', 'return-', 'return-stats-'],
    }
  )

  const rejectReturn = useMutation(
    (id: string) => apiClient.returns.reject(id),
    {
      invalidateCache: ['returns-', 'return-', 'return-stats-'],
    }
  )

  const restockReturn = useMutation(
    (id: string) => apiClient.returns.restock(id),
    {
      invalidateCache: ['returns-', 'return-', 'return-stats-', 'inventory-', 'products-'],
    }
  )

  return {
    createReturn,
    approveReturn,
    rejectReturn,
    restockReturn,
  }
}
