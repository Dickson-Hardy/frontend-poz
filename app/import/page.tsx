"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ImportPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Handle files from file handler launch
    if ('launchQueue' in window) {
      (window as any).launchQueue.setConsumer(async (launchParams: any) => {
        if (launchParams.files && launchParams.files.length > 0) {
          const fileHandles = launchParams.files
          const loadedFiles: File[] = []

          for (const fileHandle of fileHandles) {
            try {
              const file = await fileHandle.getFile()
              loadedFiles.push(file)
            } catch (error) {
              console.error('Error loading file:', error)
            }
          }

          setFiles(loadedFiles)
        }
      })
    }
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files))
    }
  }

  const handleImport = async () => {
    if (files.length === 0) return

    setIsProcessing(true)

    try {
      // Process each file
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        // Here you would typically send the file to your backend for processing
        console.log('Processing file:', file.name)

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      alert('Files imported successfully!')
      router.push('/inventory')
    } catch (error) {
      console.error('Import failed:', error)
      alert('Import failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Import Data</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select files to import
            </label>
            <input
              type="file"
              multiple
              accept=".csv,.xls,.xlsx"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {files.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="font-semibold text-gray-700 mb-2">Selected Files:</h2>
              <ul className="space-y-1">
                {files.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={files.length === 0 || isProcessing}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Processing...' : 'Import Files'}
          </button>
        </div>
      </div>
    </div>
  )
}