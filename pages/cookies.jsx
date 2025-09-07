import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Cookies from 'js-cookie'

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    const savedPreferences = Cookies.get('cookiePreferences')
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences))
    }
  }, [])

  const handlePreferenceChange = (type, value) => {
    if (type === 'necessary') return // Cannot disable necessary cookies
    setPreferences(prev => ({ ...prev, [type]: value }))
  }

  const savePreferences = () => {
    Cookies.set('cookiePreferences', JSON.stringify(preferences), { expires: 365 })
    setMessage('Cookie preferences updated successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  const resetCookies = () => {
    // Clear all cookies except necessary ones
    Cookies.remove('cookiePreferences')
    Cookies.remove('cookieConsent')

    // Reset to defaults
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false
    })

    setMessage('All non-essential cookies have been cleared.')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <>
      <Head>
        <title>Cookie Settings - Wasiq Syed</title>
        <meta name="description" content="Manage your cookie preferences and privacy settings" />
      </Head>

      <div className="py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center mb-8">
            <Link href="/" className="text-blue-400 hover:text-blue-300 mr-4">
              <i className="fas fa-arrow-left mr-2"></i>Back to Home
            </Link>
            <h1 className="text-3xl text-white font-semibold">Cookie Settings</h1>
          </div>

          {message && (
            <div className="bg-green-600/20 border border-green-600/50 text-green-400 px-4 py-3 rounded-lg mb-6">
              {message}
            </div>
          )}

          <div className="bg-neutral-800/10 rounded-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl text-white font-semibold mb-4">Cookie Policy</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-white/70 mb-4">
                  This website uses cookies to enhance your browsing experience, analyze site traffic,
                  and personalize content. Cookies are small text files stored on your device when you
                  visit our website.
                </p>

                <p className="text-white/70 mb-4">
                  You can control which types of cookies are set on your device by adjusting your preferences below.
                  Please note that disabling certain cookies may affect the functionality of the website.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl text-white font-semibold mb-4">Cookie Preferences</h3>

              {/* Necessary Cookies */}
              <div className="border border-neutral-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium text-lg">Necessary Cookies</h4>
                  <div className="flex items-center">
                    <span className="text-green-400 text-sm mr-3">Always Active</span>
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="rounded"
                    />
                  </div>
                </div>
                <p className="text-white/70 text-sm mb-3">
                  These cookies are essential for the website to function properly and cannot be disabled.
                  They include cookies for security, authentication, and basic site functionality.
                </p>
                <div className="text-white/50 text-xs">
                  <strong>Examples:</strong> Authentication tokens, security cookies, session management
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-neutral-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium text-lg">Analytics Cookies</h4>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <span className="text-white/70">
                      {preferences.analytics ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>
                <p className="text-white/70 text-sm mb-3">
                  These cookies help us understand how visitors interact with our website by collecting
                  and reporting information anonymously. This helps us improve our website's performance.
                </p>
                <div className="text-white/50 text-xs">
                  <strong>Examples:</strong> Page views, time spent on site, bounce rate analysis
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-neutral-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium text-lg">Marketing Cookies</h4>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <span className="text-white/70">
                      {preferences.marketing ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>
                <p className="text-white/70 text-sm mb-3">
                  These cookies are used to track visitors across websites to display relevant advertisements
                  and measure the effectiveness of our marketing campaigns.
                </p>
                <div className="text-white/50 text-xs">
                  <strong>Examples:</strong> Targeted advertising, retargeting, conversion tracking
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={savePreferences}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Save Preferences
              </button>

              <button
                onClick={resetCookies}
                className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 rounded-lg transition-colors duration-200"
              >
                Clear Non-Essential Cookies
              </button>
            </div>
          </div>

          <div className="mt-8 bg-neutral-800/10 rounded-lg p-6">
            <h3 className="text-lg text-white font-semibold mb-4">Contact Us</h3>
            <p className="text-white/70 mb-4">
              If you have any questions about our cookie policy or need assistance with your privacy settings,
              please don't hesitate to contact us.
            </p>
            <Link href="/contact" className="text-blue-400 hover:text-blue-300">
              Get in touch →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}



