"use client"

import { Users } from "lucide-react"
import { useWebSocket } from "@/hooks/use-websocket"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function PresenceIndicator({ outletId }: { outletId?: string }) {
  const { onlineUsers, isConnected } = useWebSocket(outletId)

  if (!isConnected || onlineUsers.length === 0) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Users className="h-4 w-4" />
          <span>{onlineUsers.length} online</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Online Users</h4>
          <div className="space-y-2">
            {onlineUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm">{user.userId}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {user.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
