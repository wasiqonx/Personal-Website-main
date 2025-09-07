import { useEffect, useRef } from 'react'

const HCaptchaWidget = ({ onVerify, onExpire }) => {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    // Load hCaptcha script if not already loaded
    if (!document.querySelector('script[src*="hcaptcha.com"]')) {
      const script = document.createElement('script')
      script.src = 'https://hcaptcha.com/1/api.js'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    // Wait for hCaptcha to be available
    const initHCaptcha = () => {
      if (window.hcaptcha && containerRef.current) {
        // Clear any existing widget
        if (widgetIdRef.current !== null) {
          window.hcaptcha.reset(widgetIdRef.current)
        }

        // Render new widget
        widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
          sitekey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001',
          theme: 'dark',
          callback: (token) => {
            console.log('hCaptcha verified:', token)
            onVerify && onVerify(token)
          },
          'expired-callback': () => {
            console.log('hCaptcha expired')
            onExpire && onExpire()
          },
          'error-callback': (error) => {
            console.error('hCaptcha error:', error)
          }
        })
      } else {
        // Retry if hCaptcha not ready yet
        setTimeout(initHCaptcha, 100)
      }
    }

    initHCaptcha()

    // Cleanup
    return () => {
      if (widgetIdRef.current !== null && window.hcaptcha) {
        window.hcaptcha.reset(widgetIdRef.current)
      }
    }
  }, [onVerify, onExpire])

  return <div ref={containerRef} className="h-captcha-widget"></div>
}

export default HCaptchaWidget
