import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function HomeRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect /home to /
    router.replace('/')
  }, [router])

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p>Redirecting to home page...</p>
    </div>
  )
}
