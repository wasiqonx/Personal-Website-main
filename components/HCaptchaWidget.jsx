import { useEffect, useRef, useState } from 'react'

const HCaptchaWidget = ({ onVerify, onExpire }) => {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let scriptLoaded = false
    let initAttempts = 0
    const maxAttempts = 50 // 5 seconds max

    // Load hCaptcha script if not already loaded
    if (!document.querySelector('script[src*="hcaptcha.com"]')) {
      const script = document.createElement('script')
      script.src = 'https://hcaptcha.com/1/api.js'
      script.async = true
      script.defer = true

      script.onload = () => {
        console.log('hCaptcha script loaded')
        scriptLoaded = true
        initHCaptcha()
      }

      script.onerror = () => {
        console.error('Failed to load hCaptcha script')
      }

      document.head.appendChild(script)
    } else {
      scriptLoaded = true
    }

    // Initialize hCaptcha widget
    const initHCaptcha = () => {
      initAttempts++

      if (window.hcaptcha && containerRef.current && scriptLoaded) {
        try {
          // Clear any existing widget
          if (widgetIdRef.current !== null) {
            window.hcaptcha.reset(widgetIdRef.current)
          }

          console.log('Initializing hCaptcha widget...')

          // Render new widget
          widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
            sitekey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001',
            theme: 'dark',
            size: 'normal',
            callback: (token) => {
              console.log('hCaptcha verified:', token)
              setIsLoaded(true)
              onVerify && onVerify(token)
            },
            'expired-callback': () => {
              console.log('hCaptcha expired')
              onExpire && onExpire()
            },
            'error-callback': (error) => {
              console.error('hCaptcha error:', error)
            },
            'chalexpired-callback': () => {
              console.log('hCaptcha challenge expired')
            }
          })

          console.log('hCaptcha widget initialized with ID:', widgetIdRef.current)
          setIsLoaded(true)

        } catch (error) {
          console.error('Error initializing hCaptcha:', error)
          if (initAttempts < maxAttempts) {
            setTimeout(initHCaptcha, 200)
          }
        }
      } else if (initAttempts < maxAttempts) {
        // Retry if hCaptcha not ready yet
        setTimeout(initHCaptcha, 100)
      } else {
        console.error('Failed to initialize hCaptcha after', maxAttempts, 'attempts')
      }
    }

    // Start initialization
    if (scriptLoaded) {
      initHCaptcha()
    }

    // Cleanup
    return () => {
      if (widgetIdRef.current !== null && window.hcaptcha) {
        try {
          window.hcaptcha.reset(widgetIdRef.current)
        } catch (error) {
          console.error('Error cleaning up hCaptcha:', error)
        }
      }
    }
  }, [onVerify, onExpire])

  // Show loading state until hCaptcha is ready
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-24 w-full bg-neutral-800/20 rounded animate-pulse">
        <div className="text-white/50 text-sm">Loading captcha...</div>
      </div>
    )
  }

  return <div ref={containerRef} className="h-captcha-widget"></div>
}

export default HCaptchaWidget
