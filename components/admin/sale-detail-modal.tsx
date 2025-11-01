"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Receipt, User, MapPin, CreditCard, Calendar, Package, Printer } from "lucide-react"
import { useApi } from "@/hooks/use-api"
import { apiClient } from "@/lib/api-unified"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface SaleDetailModalProps {
  saleId: string | null
  open: boolean
  onClose: () => void
}

export function SaleDetailModal({ saleId, open, onClose }: SaleDetailModalProps) {
  const { data: sale, loading } = useApi(
    () => saleId ? apiClient.sales.getById(saleId) : Promise.resolve(null),
    { cacheKey: `sale-${saleId}`, immediate: !!saleId && open }
  )

  const handlePrint = () => {
    window.print()
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Sale Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : sale ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Receipt Number</p>
                <p className="font-semibold">{sale.receiptNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
                  {sale.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="text-sm">{new Date(sale.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="text-sm capitalize">{sale.paymentMethod}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Cashier & Outlet Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Cashier</p>
                  <p className="text-sm">{sale.cashier?.firstName} {sale.cashier?.lastName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Outlet</p>
                  <p className="text-sm">{(sale as any).outlet?.name || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            {(sale.customerName || sale.customerPhone) && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-semibold mb-2">Customer Information</p>
                  <div className="grid grid-cols-2 gap-4">
                    {sale.customerName && (
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="text-sm">{sale.customerName}</p>
                      </div>
                    )}
                    {sale.customerPhone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="text-sm">{sale.customerPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Items */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4" />
                <p className="font-semibold">Items ({sale.items.length})</p>
              </div>
              <div className="space-y-2">
                {sale.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.productName || item.product?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × Le {item.unitPrice.toLocaleString('en-SL')}
                      </p>
                      {item.discount > 0 && (
                        <p className="text-sm text-green-600">Discount: Le {item.discount.toLocaleString('en-SL')}</p>
                      )}
                    </div>
                    <p className="font-semibold">Le {item.total.toLocaleString('en-SL')}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Subtotal</p>
                <p>Le {sale.subtotal.toLocaleString('en-SL')}</p>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <p>Discount</p>
                  <p>-Le {sale.discount.toLocaleString('en-SL')}</p>
                </div>
              )}
              {sale.tax > 0 && (
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Tax</p>
                  <p>Le {sale.tax.toLocaleString('en-SL')}</p>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <p>Total</p>
                <p>Le {sale.total.toLocaleString('en-SL')}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Sale not found</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
