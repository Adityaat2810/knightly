import { WifiOff } from "lucide-react"

export const Disconnected = ()=>{
  return(
    <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <WifiOff className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <div className="text-yellow-600 text-xl font-medium mb-4">Disconnected from server</div>
          <div className="text-gray-600 mb-6">Attempting to reconnect...</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
  )
}