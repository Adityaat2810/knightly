export const Connecting = () => {
  return(
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <div className="text-gray-800 text-xl font-medium mb-2">Connecting to server...</div>
          <div className="text-gray-500 text-sm">Make sure your backend server is running on port 8080</div>
        </div>
      </div>
  )
}