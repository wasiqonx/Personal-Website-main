import { useEffect, useRef, useState } from 'react'

const HCaptchaWidget = ({ onVerify, onExpire }) => {
  const containerRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isRealHCaptcha, setIsRealHCaptcha] = useState(false)

  useEffect(() => {
    console.log('🔄 Initializing hCaptcha widget...')

    // Try to load real hCaptcha first
    const tryRealHCaptcha = () => {
      if (!document.querySelector('script[src*="hcaptcha.com"]')) {
        console.log('📥 Loading real hCaptcha script...')
        const script = document.createElement('script')
        script.src = 'https://hcaptcha.com/1/api.js'
        script.async = true
        script.defer = true

        script.onload = () => {
          console.log('✅ Real hCaptcha script loaded')

          // Wait a moment for hCaptcha to initialize
          let attempts = 0
          const checkHCaptcha = () => {
            attempts++
            if (window.hcaptcha && containerRef.current) {
              console.log('🎉 Real hCaptcha available!')

              try {
                const widgetId = window.hcaptcha.render(containerRef.current, {
                  sitekey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001',
                  theme: 'dark',
                  size: 'normal',
                  callback: (token) => {
                    console.log('✅ Real hCaptcha completed')
                    setIsRealHCaptcha(true)
                    setIsLoaded(true)
                    onVerify && onVerify(token)
                  },
                  'expired-callback': () => {
                    console.log('⏰ Real hCaptcha expired')
                    onExpire && onExpire()
                  },
                  'error-callback': (error) => {
                    console.log('❌ hCaptcha error:', error)
                    // If there's an error with real hCaptcha, fall back to test mode
                    initTestMode()
                  }
                })

                console.log('✅ hCaptcha widget rendered with ID:', widgetId)

                // Check if widget was actually created by looking for the iframe
                setTimeout(() => {
                  const iframe = containerRef.current?.querySelector('iframe')
                  if (!iframe) {
                    console.log('⚠️ No hCaptcha iframe found, falling back to test mode')
                    initTestMode()
                  } else {
                    console.log('✅ hCaptcha iframe found, widget is working')
                    setIsRealHCaptcha(true)
                    setIsLoaded(true)
                  }
                }, 2000)

              } catch (error) {
                console.log('❌ Real hCaptcha render failed:', error)
                initTestMode()
              }
            } else if (attempts < 50) {
              setTimeout(checkHCaptcha, 100)
            } else {
              console.log('❌ Real hCaptcha not available, using test mode')
              initTestMode()
            }
          }

          setTimeout(checkHCaptcha, 500)
        }

        script.onerror = () => {
          console.log('❌ Failed to load real hCaptcha, using test mode')
          initTestMode()
        }

        document.head.appendChild(script)
      } else {
        // Script already exists
        console.log('🔄 hCaptcha script already loaded')
        setTimeout(() => {
          if (window.hcaptcha) {
            console.log('✅ Using existing hCaptcha')
            setIsRealHCaptcha(true)
            setIsLoaded(true)
          } else {
            initTestMode()
          }
        }, 500)
      }
    }

    // Fallback test mode
    const initTestMode = () => {
      console.log('🎭 Using test hCaptcha mode')
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div style="
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: #fbbf24;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            border: 2px solid #fbbf24;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            font-family: ui-sans-serif, system-ui, sans-serif;
          ">
            <div style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">🧪 Test Mode</div>
            <div style="font-size: 14px; opacity: 0.8; margin-bottom: 16px;">Real hCaptcha not available</div>
            <button
              onclick="
                console.log('✅ Test captcha completed');
                this.disabled = true;
                this.innerHTML = '✅ Test Verified';
                this.style.background = '#d97706';
                setTimeout(() => {
                  if (window.hCaptchaCallback) {
                    window.hCaptchaCallback('test-verification-token-12345');
                  }
                }, 500);
              "
              style="
                background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(251, 191, 36, 0.2);
              "
              onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(251, 191, 36, 0.3)';"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(251, 191, 36, 0.2)';"
            >
              🧪 Complete Test
            </button>
            <div style="font-size: 12px; opacity: 0.6; margin-top: 12px;">Test Environment</div>
          </div>
        `

        // Set up callback
        window.hCaptchaCallback = (token) => {
          console.log('🎭 Test captcha completed with token:', token)
          setIsLoaded(true)
          onVerify && onVerify(token)
        }

        setIsLoaded(true)
      }
    }

    // Start with real hCaptcha attempt
    tryRealHCaptcha()

  }, [onVerify, onExpire])

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-24 w-full bg-neutral-800/20 rounded animate-pulse">
        <div className="text-white/50 text-sm">Loading security check...</div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-captcha-widget"
      style={{ minHeight: isRealHCaptcha ? '78px' : '120px', width: '100%' }}
    ></div>
  )
}

export default HCaptchaWidget
