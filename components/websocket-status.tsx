"use client"

import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { useWebSocket } from "@/hooks/use-websocket"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function WebSocketStatus({ outletId }: { outletId?: string }) {
  const { isConnected, reconnectAttempts } = useWebSocket(outletId)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 text-sm cursor-help">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Live</span>
              </>
            ) : reconnectAttempts > 0 ? (
              <>
                <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
                <span className="text-muted-foreground">Reconnecting...</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-muted-foreground">Offline</span>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isConnected
              ? "Connected to real-time updates"
              : reconnectAttempts > 0
              ? `Reconnecting... (Attempt ${reconnectAttempts}/5)`
              : "Disconnected - Using cached data"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
