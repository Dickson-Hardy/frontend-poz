"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { useProductTransfers, useProductTransferMutations, useTransferStats } from "@/hooks/use-product-transfers"
import { apiClient, Outlet, Product } from "@/lib/api-unified"
import { useAuth } from "@/contexts/auth-context"
import { 
  ArrowRightLeft, 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck,
  Package,
  Eye,
  Filter,
  TrendingUp,
  Building2,
  Calendar,
  User,
  RefreshCw
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TransferItem {
  productId: string
  productName: string
  quantity: number
  batchNumber?: string
}

export function ProductTransfers() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  
  // Fetch data
  const { transfers, loading, refetch } = useProductTransfers(
    user?.outletId,
    statusFilter === "all" ? undefined : statusFilter
  )
  const { data: stats } = useTransferStats(user?.outletId)
  const { createTransfer, approveTransfer, completeTransfer, cancelTransfer } = useProductTransferMutations()

  // Create transfer form state
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [fromOutletId, setFromOutletId] = useState("")
  const [toOutletId, setToOutletId] = useState("")
  const [items, setItems] = useState<TransferItem[]>([])
  const [notes, setNotes] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])

  useEffect(() => {
    loadOutlets()
  }, [])

  useEffect(() => {
    if (fromOutletId) {
      loadProducts(fromOutletId)
    }
  }, [fromOutletId])

  const loadOutlets = async () => {
    try {
      const data = await apiClient.outlets.getAll()
      setOutlets(data)
    } catch (error) {
      console.error("Failed to load outlets", error)
    }
  }

  const loadProducts = async (outletId: string) => {
    try {
      const products = await apiClient.products.getAll(outletId)
      setAvailableProducts(products)
    } catch (error) {
      console.error("Failed to load products", error)
    }
  }

  const filteredTransfers = transfers.filter((transfer: any) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      transfer.transferNumber?.toLowerCase().includes(search) ||
      transfer.fromOutletId?.name?.toLowerCase().includes(search) ||
      transfer.toOutletId?.name?.toLowerCase().includes(search)
    )
  })

  const filteredProducts = availableProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(productSearch.toLowerCase())
  )

  const addProductToTransfer = (product: Product) => {
    if (items.find(i => i.productId === product.id)) {
      toast({ title: "Product already added", variant: "destructive" })
      return
    }
    setItems([...items, {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      batchNumber: ""
    }])
    setProductSearch("")
  }

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...items]
    newItems[index].quantity = quantity
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleCreateTransfer = async () => {
    if (!fromOutletId || !toOutletId) {
      toast({ title: "Please select both outlets", variant: "destructive" })
      return
    }
    if (items.length === 0) {
      toast({ title: "Please add at least one product", variant: "destructive" })
      return
    }

    try {
      await createTransfer.mutate({
        fromOutletId,
        toOutletId,
        items,
        notes
      })
      toast({ title: "Transfer created successfully" })
      setIsCreateOpen(false)
      resetCreateForm()
      refetch()
    } catch (error: any) {
      toast({ 
        title: "Failed to create transfer", 
        description: error.message,
        variant: "destructive" 
      })
    }
  }

  const resetCreateForm = () => {
    setFromOutletId("")
    setToOutletId("")
    setItems([])
    setNotes("")
    setProductSearch("")
  }

  const handleApprove = async (id: string) => {
    try {
      await approveTransfer.mutate(id)
      toast({ title: "Transfer approved - Stock deducted from source" })
      refetch()
      setIsDetailsOpen(false)
    } catch (error: any) {
      toast({ title: "Failed to approve", description: error.message, variant: "destructive" })
    }
  }

  const handleComplete = async (id: string) => {
    try {
      await completeTransfer.mutate(id)
      toast({ title: "Transfer completed - Stock added to destination" })
      refetch()
      setIsDetailsOpen(false)
    } catch (error: any) {
      toast({ title: "Failed to complete", description: error.message, variant: "destructive" })
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this transfer?")) return
    
    try {
      await cancelTransfer.mutate(id)
      toast({ title: "Transfer cancelled" })
      refetch()
      setIsDetailsOpen(false)
    } catch (error: any) {
      toast({ title: "Failed to cancel", description: error.message, variant: "destructive" })
    }
  }

  const viewDetails = (transfer: any) => {
    setSelectedTransfer(transfer)
    setIsDetailsOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: Clock, label: "Pending", className: "" },
      in_transit: { variant: "default", icon: Truck, label: "In Transit", className: "" },
      completed: { variant: "default", icon: CheckCircle, label: "Completed", className: "bg-green-600 hover:bg-green-700 text-white border-green-600" },
      cancelled: { variant: "destructive", icon: XCircle, label: "Cancelled", className: "" }
    }
    const config = variants[status] || variants.pending
    const Icon = config.icon
    return (
      <Badge variant={config.variant as any} className={cn("flex items-center gap-1 w-fit", config.className)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transfers</p>
                <p className="text-2xl font-bold">{stats?.totalTransfers || 0}</p>
              </div>
              <ArrowRightLeft className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pendingCount || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.inTransitCount || 0}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats?.completedCount || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Transfers</CardTitle>
              <CardDescription>Transfer inventory between outlets</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={refetch}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Transfer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Product Transfer</DialogTitle>
                    <DialogDescription>
                      Transfer products from one outlet to another
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Outlet Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>From Outlet *</Label>
                        <Select value={fromOutletId} onValueChange={setFromOutletId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source outlet" />
                          </SelectTrigger>
                          <SelectContent>
                            {outlets.filter(o => o.id !== toOutletId).map(outlet => (
                              <SelectItem key={outlet.id} value={outlet.id}>
                                {outlet.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>To Outlet *</Label>
                        <Select value={toOutletId} onValueChange={setToOutletId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination outlet" />
                          </SelectTrigger>
                          <SelectContent>
                            {outlets.filter(o => o.id !== fromOutletId).map(outlet => (
                              <SelectItem key={outlet.id} value={outlet.id}>
                                {outlet.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Product Search and Selection */}
                    {fromOutletId && (
                      <div className="space-y-2">
                        <Label>Add Products</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search products from source outlet..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        
                        {productSearch && (
                          <div className="border rounded-lg max-h-48 overflow-y-auto">
                            {filteredProducts.map(product => (
                              <div
                                key={product.id}
                                className="p-3 hover:bg-accent cursor-pointer border-b last:border-0"
                                onClick={() => addProductToTransfer(product)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {product.barcode ? `Barcode: ${product.barcode}` : 'No barcode'} • Stock: {product.minStockLevel || 0}
                                    </p>
                                  </div>
                                  <Plus className="h-4 w-4" />
                                </div>
                              </div>
                            ))}
                            {filteredProducts.length === 0 && (
                              <p className="p-4 text-center text-muted-foreground">No products found</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected Items */}
                    {items.length > 0 && (
                      <div className="space-y-2">
                        <Label>Transfer Items ({items.length})</Label>
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="w-32">Quantity</TableHead>
                                <TableHead className="w-40">Batch (Optional)</TableHead>
                                <TableHead className="w-16"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {items.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{item.productName}</TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                      className="w-full"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={item.batchNumber || ""}
                                      onChange={(e) => {
                                        const newItems = [...items]
                                        newItems[index].batchNumber = e.target.value
                                        setItems(newItems)
                                      }}
                                      placeholder="Batch #"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeItem(index)}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label>Notes (Optional)</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Reason for transfer, special instructions, etc."
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTransfer} disabled={createTransfer.loading}>
                      {createTransfer.loading ? <LoadingSpinner className="mr-2" /> : null}
                      Create Transfer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transfer number, outlet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transfers Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredTransfers.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No transfers found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transfer #</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((transfer: any) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-medium">{transfer.transferNumber}</TableCell>
                    <TableCell>{transfer.fromOutletId?.name || "Unknown"}</TableCell>
                    <TableCell>{transfer.toOutletId?.name || "Unknown"}</TableCell>
                    <TableCell>{transfer.items?.length || 0} items</TableCell>
                    <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                    <TableCell>
                      {transfer.createdAt ? format(new Date(transfer.createdAt), "MMM dd, yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewDetails(transfer)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Transfer Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTransfer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Transfer Details - {selectedTransfer.transferNumber}
                </DialogTitle>
                <DialogDescription>
                  View and manage product transfer
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status */}
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTransfer.status)}</div>
                </div>

                {/* Outlets */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      From Outlet
                    </Label>
                    <p className="mt-1 font-medium">{selectedTransfer.fromOutletId?.name}</p>
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      To Outlet
                    </Label>
                    <p className="mt-1 font-medium">{selectedTransfer.toOutletId?.name}</p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <Label>Transfer Items</Label>
                  <div className="mt-2 border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Batch Number</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTransfer.items?.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.batchNumber || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-3">
                  <Label>Timeline</Label>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Initiated by {selectedTransfer.initiatedBy?.name || "Unknown"}</p>
                        <p className="text-muted-foreground">
                          {selectedTransfer.createdAt ? format(new Date(selectedTransfer.createdAt), "PPpp") : "-"}
                        </p>
                      </div>
                    </div>
                    
                    {selectedTransfer.approvedBy && (
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                        <div>
                          <p className="font-medium">Approved by {selectedTransfer.approvedBy?.name || "Unknown"}</p>
                          <p className="text-muted-foreground">
                            {selectedTransfer.approvedAt ? format(new Date(selectedTransfer.approvedAt), "PPpp") : "-"}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {selectedTransfer.receivedBy && (
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 mt-0.5 text-blue-600" />
                        <div>
                          <p className="font-medium">Received by {selectedTransfer.receivedBy?.name || "Unknown"}</p>
                          <p className="text-muted-foreground">
                            {selectedTransfer.receivedAt ? format(new Date(selectedTransfer.receivedAt), "PPpp") : "-"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedTransfer.notes && (
                  <div>
                    <Label>Notes</Label>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedTransfer.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end pt-4 border-t">
                  {selectedTransfer.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleCancel(selectedTransfer.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Transfer
                      </Button>
                      <Button onClick={() => handleApprove(selectedTransfer.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve & Deduct Stock
                      </Button>
                    </>
                  )}
                  
                  {selectedTransfer.status === "in_transit" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleCancel(selectedTransfer.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel & Restore Stock
                      </Button>
                      <Button onClick={() => handleComplete(selectedTransfer.id)}>
                        <Package className="h-4 w-4 mr-2" />
                        Mark as Received
                      </Button>
                    </>
                  )}
                  
                  {selectedTransfer.status === "completed" && (
                    <Badge variant="default" className="text-base py-2 px-4 bg-green-600 hover:bg-green-700 text-white border-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Transfer Completed
                    </Badge>
                  )}
                  
                  {selectedTransfer.status === "cancelled" && (
                    <Badge variant="destructive" className="text-base py-2 px-4">
                      <XCircle className="h-4 w-4 mr-2" />
                      Transfer Cancelled
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
