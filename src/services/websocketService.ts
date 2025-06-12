/**
 * WebSocketService - Provides a WebSocket connection with reconnect capabilities
 * and message handling for different channels.
 */
class WebSocketService {
  private socket: WebSocket | null = null
  private url: string
  private isConnected = false
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 20
  private reconnectDelay = 3000
  private intentionalDisconnect = false
  private messageHandlers: ((data: any) => void)[] = []
  private channelHandlers: Map<string, Set<(data: any) => void>> = new Map()
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor() {
    this.url = `${process.env.NEXT_PUBLIC_WS_BASE_URL}`
  }

  /**
   * Connect to the WebSocket server
   * @returns Promise that resolves when connection is established
   */
  connect(): Promise<void> {
    if (this.isConnected) {
      return Promise.resolve()
    }

    this.intentionalDisconnect = false
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url)

        this.socket.onopen = () => {
          this.isConnected = true
          this.reconnectAttempts = 0
          console.log('WebSocket connected')
          this.startHeartbeat()
          resolve()
        }

        this.socket.onclose = () => {
          this.isConnected = false
          console.log('WebSocket disconnected')
          this.stopHeartbeat()
          if (!this.intentionalDisconnect) {
            this.attemptReconnect()
          }
        }

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)

            const { event: channel, data } = message
            if (channel && this.channelHandlers.has(channel)) {
              this.channelHandlers
                .get(channel)
                ?.forEach((handler) => handler(data))
            }

            this.messageHandlers.forEach((handler) => handler(message))
          } catch (err) {
            console.error('Error parsing WebSocket message:', err)
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Register a handler for all incoming WebSocket messages
   * @param handler Function to handle incoming messages
   * @returns Function to unsubscribe the handler
   */
  onMessage(handler: (data: any) => void): () => void {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler)
    }
  }

  /**
   * Subscribe to a specific WebSocket channel
   * @param channel Channel name to subscribe to
   * @param handler Function to handle channel messages
   */
  subscribe(channel: string, handler: (data: any) => void): void {
    if (!this.channelHandlers.has(channel)) {
      this.channelHandlers.set(channel, new Set())
    }
    this.channelHandlers.get(channel)?.add(handler)
  }

  /**
   * Unsubscribe from a specific WebSocket channel
   * @param channel Channel name to unsubscribe from
   * @param handler Handler function to remove
   */
  unsubscribe(channel: string, handler: (data: any) => void): void {
    const handlers = this.channelHandlers.get(channel)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.channelHandlers.delete(channel)
      }
    }
  }

  /**
   * Send data to the WebSocket server
   * @param data Object to be serialized and sent
   * @returns Boolean indicating if the send was successful
   */
  send(data: object): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected. Cannot send message.')
      return false
    }

    try {
      this.socket.send(JSON.stringify(data))
      return true
    } catch (err) {
      console.error('WebSocket send error:', err)
      return false
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    this.intentionalDisconnect = true
    if (this.socket) {
      this.socket.close()
      this.socket = null
      this.isConnected = false
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * Check if the WebSocket connection is active
   * @returns Boolean indicating connection status
   */
  isActive(): boolean {
    return this.isConnected
  }

  /**
   * Attempt to reconnect to the WebSocket server
   * Implements an exponential backoff strategy with a maximum number of attempts
   * Will not attempt to reconnect if:
   * - A reconnection is already in progress
   * - Maximum reconnect attempts have been reached
   * - The disconnect was intentional
   */
  private attemptReconnect() {
    if (
      this.reconnectTimer ||
      this.reconnectAttempts >= this.maxReconnectAttempts ||
      this.intentionalDisconnect
    ) {
      return
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.reconnectAttempts++
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      )
      this.connect().catch(() => {})
    }, this.reconnectDelay)
  }

  /**
   * Start the heartbeat mechanism
   * Sends a ping message to the server every 30 seconds
   * to keep the connection alive and detect disconnections early
   */
  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({ event: 'ping', data: { timestamp: Date.now() } }),
        )
      }
    }, 30000)
  }

  /**
   * Stop the heartbeat mechanism
   * Clears the heartbeat interval to prevent memory leaks
   * and unnecessary network traffic when disconnected
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }
}

const websocketService = new WebSocketService()
export default websocketService
