'use client'

import { useApi, useMutation } from './use-api'
import { apiClient } from '@/lib/api-unified'

export function useProductTransfers(outletId?: string, status?: string) {
  const { data, loading, error, refetch } = useApi(
    () => apiClient.productTransfers.getAll(outletId, status),
    {
      cacheKey: `product-transfers-${outletId || 'all'}-${status || 'all'}`,
      immediate: true,
    }
  )

  return {
    transfers: data || [],
    loading,
    error,
    refetch,
  }
}

export function useProductTransfer(id: string) {
  return useApi(
    () => apiClient.productTransfers.getById(id),
    {
      cacheKey: `product-transfer-${id}`,
      immediate: !!id,
    }
  )
}

export function useTransferStats(outletId?: string) {
  return useApi(
    () => apiClient.productTransfers.getStats(outletId),
    {
      cacheKey: `transfer-stats-${outletId || 'all'}`,
      immediate: true,
    }
  )
}

export function useProductTransferMutations() {
  const createTransfer = useMutation(
    (transferData: any) => apiClient.productTransfers.create(transferData),
    {
      invalidateCache: ['product-transfers-', 'transfer-stats-', 'products-', 'inventory-'],
    }
  )

  const approveTransfer = useMutation(
    (id: string) => apiClient.productTransfers.approve(id),
    {
      invalidateCache: ['product-transfers-', 'product-transfer-', 'transfer-stats-', 'products-', 'inventory-'],
    }
  )

  const completeTransfer = useMutation(
    (id: string) => apiClient.productTransfers.complete(id),
    {
      invalidateCache: ['product-transfers-', 'product-transfer-', 'transfer-stats-', 'products-', 'inventory-'],
    }
  )

  const cancelTransfer = useMutation(
    (id: string) => apiClient.productTransfers.cancel(id),
    {
      invalidateCache: ['product-transfers-', 'product-transfer-', 'transfer-stats-', 'products-', 'inventory-'],
    }
  )

  return {
    createTransfer,
    approveTransfer,
    completeTransfer,
    cancelTransfer,
  }
}
