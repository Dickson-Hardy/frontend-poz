'use client'

import { useApi, useMutation } from './use-api'
import { apiClient } from '@/lib/api-unified'

export function useSupplierPayments(outletId?: string, status?: string) {
  const { data, loading, error, refetch } = useApi(
    () => apiClient.supplierPayments.getAll(outletId, status),
    {
      cacheKey: `supplier-payments-${outletId || 'all'}-${status || 'all'}`,
      immediate: true,
    }
  )

  return {
    payments: data || [],
    loading,
    error,
    refetch,
  }
}

export function useSupplierPayment(id: string) {
  return useApi(
    () => apiClient.supplierPayments.getById(id),
    {
      cacheKey: `supplier-payment-${id}`,
      immediate: !!id,
    }
  )
}

export function useOverduePayments(outletId?: string) {
  return useApi(
    () => apiClient.supplierPayments.getOverdue(outletId),
    {
      cacheKey: `overdue-payments-${outletId || 'all'}`,
      immediate: true,
    }
  )
}

export function usePaymentStats(outletId?: string) {
  return useApi(
    () => apiClient.supplierPayments.getStats(outletId),
    {
      cacheKey: `payment-stats-${outletId || 'all'}`,
      immediate: true,
    }
  )
}

export function useSupplierPaymentMutations() {
  const createPayment = useMutation(
    (paymentData: any) => apiClient.supplierPayments.create(paymentData),
    {
      invalidateCache: ['supplier-payments-', 'payment-stats-'],
    }
  )

  const recordPayment = useMutation(
    ({ id, data }: { id: string; data: any }) => 
      apiClient.supplierPayments.recordPayment(id, data),
    {
      invalidateCache: ['supplier-payments-', 'supplier-payment-', 'payment-stats-', 'overdue-payments-'],
    }
  )

  return {
    createPayment,
    recordPayment,
  }
}
