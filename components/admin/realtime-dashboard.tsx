"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWebSocket } from "@/hooks/use-websocket"
import { useRealtimeSales, useRealtimeDailySummary } from "@/hooks/use-realtime-data"
import { TrendingUp, Users, ShoppingCart, DollarSign, Activity } from "lucide-react"

interface RealtimeEvent {
  type: string
  data: any
  timestamp: Date
}

export function RealtimeDashboard({ outletId }: { outletId?: string }) {
  const { isConnected, onlineUsers } = useWebSocket(outletId)
  const { data: dailySummary } = useRealtimeDailySummary(outletId)
  const [recentEvents, setRecentEvents] = useState<RealtimeEvent[]>([])
  const { on, off } = useWebSocket(outletId)

  useEffect(() => {
    const handleSaleCompleted = (data: any) => {
      setRecentEvents(prev => [{
        type: 'sale:completed',
        data,
        timestamp: new Date()
      }, ...prev].slice(0, 10))
    }

    const handleInventoryUpdated = (data: any) => {
      setRecentEvents(prev => [{
        type: 'inventory:updated',
        data,
        timestamp: new Date()
      }, ...prev].slice(0, 10))
    }

    const handleTransferCompleted = (data: any) => {
      setRecentEvents(prev => [{
        type: 'transfer:completed',
        data,
        timestamp: new Date()
      }, ...prev].slice(0, 10))
    }

    on('sale:completed', handleSaleCompleted)
    on('inventory:updated', handleInventoryUpdated)
    on('transfer:completed', handleTransferCompleted)

    return () => {
      off('sale:completed')
      off('inventory:updated')
      off('transfer:completed')
    }
  }, [on, off])

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>System Status</span>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Live" : "Offline"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{onlineUsers.length} users online</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{recentEvents.length} recent events</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      {dailySummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  Le {dailySummary.totalSales?.toLocaleString('en-SL') || 0}
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {dailySummary.totalTransactions || 0}
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  Le {Math.round((dailySummary.totalSales || 0) / (dailySummary.totalTransactions || 1)).toLocaleString('en-SL')}
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Live Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {recentEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {event.type.split(':')[0]}
                    </Badge>
                    <span className="text-sm">
                      {event.type === 'sale:completed' && `Sale completed - Le ${event.data.total?.toLocaleString('en-SL')}`}
                      {event.type === 'inventory:updated' && `Stock updated - ${event.data.stockQuantity} units`}
                      {event.type === 'transfer:completed' && `Transfer completed`}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Online Users */}
      {onlineUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Online Users ({onlineUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {onlineUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">{user.userId}</span>
                    <Badge variant="secondary">{user.role}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(user.connectedAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
