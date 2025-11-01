"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, TrendingDown, Users, Clock, DollarSign, Download } from "lucide-react"
import { useApi } from "@/hooks/use-api"
import { apiClient } from "@/lib/api-unified"
import { useAuth } from "@/contexts/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { SaleDetailModal } from "./sale-detail-modal"

export function AdvancedSalesAnalytics() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const { data: comparison } = useApi(
    () => apiClient.sales.getSalesComparison(user?.outletId),
    { cacheKey: `sales-comparison-${user?.outletId}`, immediate: true }
  )

  const { data: cashierPerf } = useApi(
    () => apiClient.sales.getCashierPerformance(user?.outletId),
    { cacheKey: `cashier-perf-${user?.outletId}`, immediate: true }
  )

  const { data: hourlySales } = useApi(
    () => apiClient.sales.getHourlySales(user?.outletId),
    { cacheKey: `hourly-sales-${user?.outletId}`, immediate: true }
  )

  const { data: categoryBreakdown } = useApi(
    () => apiClient.sales.getSalesByCategory(user?.outletId),
    { cacheKey: `category-sales-${user?.outletId}`, immediate: true }
  )

  const { data: searchResults, loading: searching } = useApi(
    () => searchQuery.length > 2 ? apiClient.sales.search(searchQuery, user?.outletId) : Promise.resolve([]),
    { cacheKey: `search-${searchQuery}`, immediate: searchQuery.length > 2 }
  )

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const exportToCSV = () => {
    // Simple CSV export implementation
    alert("Export functionality - CSV download will be implemented")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Advanced Sales Analytics</h1>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by receipt number, customer name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {searching && <div className="mt-4"><LoadingSpinner text="Searching..." /></div>}
          {searchResults && searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((sale: any) => (
                <div
                  key={sale.id}
                  onClick={() => setSelectedSaleId(sale.id)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{sale.receiptNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sale.createdAt).toLocaleString()} • {sale.customerName || 'Walk-in'}
                      </p>
                    </div>
                    <p className="font-bold">Le {sale.total.toLocaleString('en-SL')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cashiers">Cashiers</TabsTrigger>
          <TabsTrigger value="hourly">Hourly</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Comparison Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today vs Yesterday</p>
                    <p className="text-2xl font-bold">
                      Le {comparison?.today?.total?.toLocaleString('en-SL') || '0'}
                    </p>
                    {comparison && (
                      <div className={`flex items-center gap-1 text-sm ${
                        calculateChange(comparison.today?.total || 0, comparison.yesterday?.total || 0) >= 0 
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {calculateChange(comparison.today?.total || 0, comparison.yesterday?.total || 0) >= 0 
                          ? <TrendingUp className="h-3 w-3" /> 
                          : <TrendingDown className="h-3 w-3" />
                        }
                        <span>{Math.abs(calculateChange(comparison.today?.total || 0, comparison.yesterday?.total || 0)).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Week vs Last Week</p>
                    <p className="text-2xl font-bold">
                      Le {comparison?.thisWeek?.total?.toLocaleString('en-SL') || '0'}
                    </p>
                    {comparison && (
                      <div className={`flex items-center gap-1 text-sm ${
                        calculateChange(comparison.thisWeek?.total || 0, comparison.lastWeek?.total || 0) >= 0 
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {calculateChange(comparison.thisWeek?.total || 0, comparison.lastWeek?.total || 0) >= 0 
                          ? <TrendingUp className="h-3 w-3" /> 
                          : <TrendingDown className="h-3 w-3" />
                        }
                        <span>{Math.abs(calculateChange(comparison.thisWeek?.total || 0, comparison.lastWeek?.total || 0)).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Transactions</p>
                  <p className="text-2xl font-bold">{comparison?.today?.count || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    Yesterday: {comparison?.yesterday?.count || 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Transaction</p>
                  <p className="text-2xl font-bold">
                    Le {comparison?.today?.count > 0 
                      ? ((comparison.today.total / comparison.today.count) || 0).toLocaleString('en-SL')
                      : '0'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Cashier Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cashierPerf?.map((cashier: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-semibold">
                          {cashier.cashier?.firstName} {cashier.cashier?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {cashier.transactionCount} transactions • Avg: Le {cashier.averageTransaction?.toLocaleString('en-SL')}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-bold">Le {cashier.totalSales?.toLocaleString('en-SL')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Hourly Sales Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hourlySales?.map((hour: any) => (
                  <div key={hour.hour} className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-sm w-16">{hour.hour}:00</p>
                      <p className="text-sm text-muted-foreground">{hour.count} sales</p>
                    </div>
                    <p className="font-semibold">Le {hour.sales?.toLocaleString('en-SL')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryBreakdown?.map((cat: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold capitalize">{cat._id || 'Uncategorized'}</p>
                      <p className="text-sm text-muted-foreground">{cat.quantity} items sold</p>
                    </div>
                    <p className="font-bold">Le {cat.sales?.toLocaleString('en-SL')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SaleDetailModal
        saleId={selectedSaleId}
        open={!!selectedSaleId}
        onClose={() => setSelectedSaleId(null)}
      />
    </div>
  )
}
