'use client'

import { useEffect, useState } from 'react'

/**
 * WebSocketDebugger component
 * Shows information about the WebSocket connection for debugging purposes
 */
export default function WebSocketDebugger() {
  const [socketStatus, setSocketStatus] = useState<string>('Initializing...')
  const [messages, setMessages] = useState<string[]>([])
  const [showDebugger, setShowDebugger] = useState(true)
  const [testUrl, setTestUrl] = useState('wss://dlob.drift.trade/ws')
  const [corsStatus, setCorsStatus] = useState<string>('Not tested')
  const [isPaused, setIsPaused] = useState(false)

  // Test CORS issues with a fetch request
  const testCorsWithFetch = () => {
    setCorsStatus('Testing...')
    // Convert WebSocket URL to HTTPS for CORS test
    const httpUrl = testUrl.replace('wss://', 'https://').replace('/ws', '')

    fetch(httpUrl)
      .then((response) => {
        console.log('CORS test response:', response)
        setCorsStatus(`OK: ${response.status}`)
      })
      .catch((error) => {
        console.error('CORS test error:', error)
        setCorsStatus(`Error: ${error.message}`)
      })
  }

  useEffect(() => {
    // Test the WebSocket connection directly
    let ws: WebSocket

    try {
      ws = new WebSocket(testUrl)

      ws.onopen = () => {
        setSocketStatus('Connected')

        // Send a test ping
        const pingMessage = JSON.stringify({ type: 'ping' })
        ws.send(pingMessage)

        // Subscribe to SOL-PERP orderbook as a test
        const subscribeMessage = JSON.stringify({
          type: 'subscribe',
          marketType: 'perp',
          channel: 'orderbook',
          market: 'SOL-PERP',
        })
        ws.send(subscribeMessage)

        // Subscribe to trades as well
        const tradesSubscribeMessage = JSON.stringify({
          type: 'subscribe',
          marketType: 'perp',
          channel: 'trades',
          market: 'SOL-PERP',
        })
        ws.send(tradesSubscribeMessage)

        // Log the ready state for debugging
        setMessages((prev) => [
          `Connection established. Ready state: ${ws.readyState}`,
          ...prev,
        ])
      }

      ws.onmessage = (event) => {
        const msg = event.data as string

        // Only update messages if not paused
        if (!isPaused) {
          setMessages((prev) => {
            const newMessages = [msg, ...prev].slice(0, 10) // Keep only the last 10 messages
            return newMessages
          })
        }
      }

      ws.onerror = (error) => {
        setSocketStatus(`Error: ${JSON.stringify(error)}`)
        if (!isPaused) {
          setMessages((prev) => [
            `Error occurred: ${JSON.stringify(error)}`,
            ...prev,
          ])
        }
      }

      ws.onclose = (event) => {
        setSocketStatus(`Closed: ${event.code} ${event.reason}`)
        if (!isPaused) {
          setMessages((prev) => [
            `Connection closed: code=${event.code}, reason=${event.reason}`,
            ...prev,
          ])
        }
      }
    } catch (error) {
      setSocketStatus(
        `Creation Error: ${error instanceof Error ? error.message : String(error)}`,
      )
      if (!isPaused) {
        setMessages((prev) => [
          `Failed to create WebSocket: ${error instanceof Error ? error.message : String(error)}`,
          ...prev,
        ])
      }
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        // Unsubscribe before closing
        const unsubscribeMessage = JSON.stringify({
          type: 'unsubscribe',
          marketType: 'perp',
          channel: 'orderbook',
          market: 'SOL-PERP',
        })
        ws.send(unsubscribeMessage)

        // Unsubscribe from trades as well
        const tradesUnsubscribeMessage = JSON.stringify({
          type: 'unsubscribe',
          marketType: 'perp',
          channel: 'trades',
          market: 'SOL-PERP',
        })
        ws.send(tradesUnsubscribeMessage)

        ws.close()
      }
    }
  }, [testUrl, isPaused])

  const changeUrl = () => {
    // Toggle between URLs to test different connections
    if (testUrl === 'wss://dlob.drift.trade/ws') {
      setTestUrl('wss://api.drift.trade/ws')
    } else {
      setTestUrl('wss://dlob.drift.trade/ws')
    }

    // Clear previous messages
    setMessages([
      `Switching to ${testUrl === 'wss://dlob.drift.trade/ws' ? 'wss://api.drift.trade/ws' : 'wss://dlob.drift.trade/ws'}...`,
    ])
    setSocketStatus('Reconnecting...')
    setCorsStatus('Not tested')
  }

  // Toggle pause state
  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  // Clear current messages
  const clearMessages = () => {
    setMessages([])
  }

  if (!showDebugger) {
    return (
      <button
        onClick={() => setShowDebugger(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-md z-50"
      >
        Show Debugger
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-md shadow-lg z-50 max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">WebSocket Debugger</h3>
        <button
          onClick={() => setShowDebugger(false)}
          className="text-white hover:text-red-300"
        >
          ✕
        </button>
      </div>

      <div className="mb-2">
        <strong>URL:</strong> {testUrl}{' '}
        <button
          onClick={changeUrl}
          className="text-xs bg-blue-600 px-2 py-1 rounded ml-2"
        >
          Try Other URL
        </button>
      </div>

      <div className="mb-2">
        <strong>Status:</strong>{' '}
        <span
          className={
            socketStatus === 'Connected' ? 'text-green-400' : 'text-red-400'
          }
        >
          {socketStatus}
        </span>
      </div>

      <div className="mb-2">
        <strong>CORS:</strong>{' '}
        <span
          className={
            corsStatus.startsWith('OK') ? 'text-green-400' : 'text-yellow-400'
          }
        >
          {corsStatus}
        </span>{' '}
        <button
          onClick={testCorsWithFetch}
          className="text-xs bg-blue-600 px-2 py-1 rounded ml-2"
        >
          Test CORS
        </button>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <strong>Recent Messages:</strong>
          <div>
            <button
              onClick={togglePause}
              className={`text-xs ${isPaused ? 'bg-green-600' : 'bg-red-600'} px-2 py-1 rounded mr-2`}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={clearMessages}
              className="text-xs bg-gray-600 px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="mt-1 bg-gray-900 p-2 rounded-md max-h-64 overflow-auto text-xs">
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div key={index} className="mb-1 border-b border-gray-700 pb-1">
                {msg.length > 150 ? `${msg.substring(0, 150)}...` : msg}
              </div>
            ))
          ) : (
            <div className="text-gray-400">No messages received yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
