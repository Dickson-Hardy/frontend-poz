"use client"

import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface OnlineUser {
  userId: string
  role: string
  connectedAt: Date
}

export function useWebSocket(outletId?: string) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [reconnectAttempts, setReconnectAttempts] = useState(0)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    if (!token) {
      console.warn('No auth token found for WebSocket connection')
      return
    }

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        token,
      },
    })

    socketRef.current.on("connect", () => {
      setIsConnected(true)
      setReconnectAttempts(0)
      console.log("WebSocket connected")
      
      if (outletId && socketRef.current) {
        socketRef.current.emit("join-outlet", outletId)
      }
    })

    socketRef.current.on("disconnect", () => {
      setIsConnected(false)
      console.log("WebSocket disconnected")
    })

    socketRef.current.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error.message)
      setReconnectAttempts(prev => prev + 1)
    })

    socketRef.current.on("presence:update", (data: { onlineUsers: OnlineUser[], count: number }) => {
      setOnlineUsers(data.onlineUsers)
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [outletId])

  const on = (event: string, callback: (data: any) => void) => {
    socketRef.current?.on(event, callback)
  }

  const off = (event: string) => {
    socketRef.current?.off(event)
  }

  return { 
    socket: socketRef.current, 
    isConnected, 
    onlineUsers,
    reconnectAttempts,
    on, 
    off 
  }
}
