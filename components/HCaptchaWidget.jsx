import { useEffect, useRef, useState } from 'react'

const HCaptchaWidget = ({ onVerify, onExpire }) => {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let initAttempts = 0
    const maxAttempts = 30 // 3 seconds max

    // Load hCaptcha script if not already loaded
    if (!document.querySelector('script[src*="hcaptcha.com"]')) {
      console.log('Loading hCaptcha script...')
      const script = document.createElement('script')
      script.src = 'https://hcaptcha.com/1/api.js'
      script.async = true
      script.defer = true

      script.onload = () => {
        console.log('✅ hCaptcha script loaded successfully')
        // Wait a bit for the global object to be available
        setTimeout(() => {
          initHCaptcha()
        }, 500)
      }

      script.onerror = () => {
        console.error('❌ Failed to load hCaptcha script')
        // Fallback to test mode
        setTimeout(() => {
          console.log('🔄 Falling back to test mode')
          initTestMode()
        }, 1000)
      }

      document.head.appendChild(script)
    } else {
      console.log('hCaptcha script already loaded')
      initHCaptcha()
    }

    // Initialize hCaptcha widget
    const initHCaptcha = () => {
      initAttempts++
      console.log(`Attempt ${initAttempts}: Checking hCaptcha availability...`)

      if (window.hcaptcha && containerRef.current) {
        console.log('✅ window.hcaptcha is available, initializing widget...')

        try {
          // Render new widget
          widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
            sitekey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001',
            theme: 'dark',
            size: 'normal',
            callback: (token) => {
              console.log('✅ hCaptcha verified:', token.substring(0, 20) + '...')
              setIsLoaded(true)
              onVerify && onVerify(token)
            },
            'expired-callback': () => {
              console.log('⏰ hCaptcha expired')
              onExpire && onExpire()
            },
            'error-callback': (error) => {
              console.error('❌ hCaptcha error:', error)
            },
            'chalexpired-callback': () => {
              console.log('⏰ hCaptcha challenge expired')
            }
          })

          console.log('✅ hCaptcha widget initialized with ID:', widgetIdRef.current)
          setIsLoaded(true)

        } catch (error) {
          console.error('❌ Error initializing hCaptcha:', error)
          if (initAttempts < maxAttempts) {
            setTimeout(initHCaptcha, 200)
          } else {
            console.log('🔄 Switching to test mode after max attempts')
            initTestMode()
          }
        }
      } else {
        console.log(`⏳ window.hcaptcha not ready (attempt ${initAttempts}/${maxAttempts})`)
        if (initAttempts < maxAttempts) {
          setTimeout(initHCaptcha, 100)
        } else {
          console.log('🔄 Switching to test mode after max attempts')
          initTestMode()
        }
      }
    }

    // Fallback test mode
    const initTestMode = () => {
      console.log('🎭 Initializing test mode hCaptcha')
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div style="
            background: #374151;
            color: #10B981;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 2px dashed #10B981;
            font-family: monospace;
          ">
            <div style="font-size: 18px; margin-bottom: 8px;">🎭 Test Mode</div>
            <div style="font-size: 14px; opacity: 0.8;">hCaptcha Widget</div>
            <button
              onclick="console.log('Test captcha clicked'); window.testCaptchaCallback && window.testCaptchaCallback('test-token-123')"
              style="
                background: #10B981;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                margin-top: 12px;
                cursor: pointer;
              "
            >
              Complete Test Captcha
            </button>
          </div>
        `

        // Set up test callback
        window.testCaptchaCallback = (token) => {
          console.log('🎭 Test captcha completed with token:', token)
          setIsLoaded(true)
          onVerify && onVerify(token)
        }

        setIsLoaded(true)
      }
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
