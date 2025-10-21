"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SharePage() {
  const [sharedData, setSharedData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Handle shared data from the share target
    if ('launchQueue' in window) {
      (window as any).launchQueue.setConsumer(async (launchParams: any) => {
        if (launchParams.files && launchParams.files.length > 0) {
          // Handle shared files
          const files = launchParams.files
          console.log('Shared files:', files)
          setSharedData({ type: 'files', files })
        } else if (launchParams.data) {
          // Handle shared data
          console.log('Shared data:', launchParams.data)
          setSharedData(launchParams.data)
        }
      })
    }

    // Check for URL parameters (fallback for browsers without launchQueue)
    const urlParams = new URLSearchParams(window.location.search)
    const title = urlParams.get('title')
    const text = urlParams.get('text')
    const url = urlParams.get('url')

    if (title || text || url) {
      setSharedData({ title, text, url })
    }
  }, [])

  const handleProcessShare = () => {
    // Process the shared data (e.g., save to database, create sale, etc.)
    console.log('Processing shared data:', sharedData)
    // Redirect back to main app
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Share Received</h1>

        {sharedData ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="font-semibold text-gray-700 mb-2">Shared Content:</h2>
              {sharedData.title && (
                <p className="text-sm text-gray-600"><strong>Title:</strong> {sharedData.title}</p>
              )}
              {sharedData.text && (
                <p className="text-sm text-gray-600"><strong>Text:</strong> {sharedData.text}</p>
              )}
              {sharedData.url && (
                <p className="text-sm text-gray-600"><strong>URL:</strong> {sharedData.url}</p>
              )}
              {sharedData.files && (
                <p className="text-sm text-gray-600"><strong>Files:</strong> {sharedData.files.length} file(s)</p>
              )}
            </div>

            <button
              onClick={handleProcessShare}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Process Share
            </button>
          </div>
        ) : (
          <p className="text-gray-600">No shared content received.</p>
        )}
      </div>
    </div>
  )
}