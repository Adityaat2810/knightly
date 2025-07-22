import { WifiOff } from "lucide-react"

export const ErrorMessage = ()=> {
  return(
    <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <WifiOff className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 text-xl font-medium mb-4">Failed to connect to server</div>
          <div className="text-gray-600 mb-6 text-left">
            Please check:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Backend server is running on port 8080</li>
              <li>No firewall blocking the connection</li>
              <li>WebSocket server is properly configured</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
  )
}