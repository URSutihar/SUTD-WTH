import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const Login = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect directly to the app since there's no authentication
    navigate('/welcome')
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jetlag-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Snorelags...</p>
      </div>
    </div>
  )
}
