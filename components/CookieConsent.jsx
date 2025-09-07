import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    const consent = Cookies.get('cookieConsent')
    if (!consent) {
      setShowConsent(true)
    } else {
      const savedPreferences = Cookies.get('cookiePreferences')
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences))
      }
    }
  }, [])

  const acceptAll = () => {
    const allPreferences = {
      necessary: true,
      analytics: true,
      marketing: true
    }
    setPreferences(allPreferences)
    Cookies.set('cookieConsent', 'accepted', { expires: 365 })
    Cookies.set('cookiePreferences', JSON.stringify(allPreferences), { expires: 365 })
    setShowConsent(false)
  }

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false
    }
    setPreferences(necessaryOnly)
    Cookies.set('cookieConsent', 'accepted', { expires: 365 })
    Cookies.set('cookiePreferences', JSON.stringify(necessaryOnly), { expires: 365 })
    setShowConsent(false)
  }

  const savePreferences = () => {
    Cookies.set('cookieConsent', 'accepted', { expires: 365 })
    Cookies.set('cookiePreferences', JSON.stringify(preferences), { expires: 365 })
    setShowConsent(false)
    setShowPreferences(false)
  }

  const handlePreferenceChange = (type, value) => {
    if (type === 'necessary') return // Cannot disable necessary cookies
    setPreferences(prev => ({ ...prev, [type]: value }))
  }

  if (!showConsent) return null

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-700/50 p-4 z-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">🍪 Cookie Preferences</h3>
              <p className="text-white/70 text-sm">
                We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts.
                You can choose which cookies to accept.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 bg-neutral-700/50 hover:bg-neutral-700/70 text-white text-sm rounded-lg transition-colors duration-200"
              >
                Manage Preferences
              </button>
              <button
                onClick={acceptNecessary}
                className="px-4 py-2 bg-neutral-700/50 hover:bg-neutral-700/70 text-white text-sm rounded-lg transition-colors duration-200"
              >
                Necessary Only
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700/50 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold text-lg">Cookie Preferences</h3>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="text-white/50 hover:text-white"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="border border-neutral-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Necessary Cookies</h4>
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="rounded"
                    />
                  </div>
                  <p className="text-white/50 text-sm">
                    Required for the website to function properly. These cannot be disabled.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-neutral-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Analytics Cookies</h4>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  <p className="text-white/50 text-sm">
                    Help us understand how visitors interact with our website.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="border border-neutral-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Marketing Cookies</h4>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  <p className="text-white/50 text-sm">
                    Used to track visitors across websites for advertising purposes.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={acceptNecessary}
                  className="flex-1 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-700/70 text-white text-sm rounded-lg transition-colors duration-200"
                >
                  Necessary Only
                </button>
                <button
                  onClick={savePreferences}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}



