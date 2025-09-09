import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

export default function Donate() {
  const [copied, setCopied] = useState(false)
  const xmrAddress = '8894XGTTAgrQhjJkj4DF4tYVLZbtLqZCWVrhSp664Du5PR2aiy7Lqkm8sdRPDeS1LoaWKEhHTBf8Q73MqxbZK3jWKkMW3Y7'

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(xmrAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = xmrAddress
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  return (
    <>
      <Head>
        <title>Donate - Support Wasiq Syed</title>
        <meta name="description" content="Support my work with cryptocurrency donations. XMR (Monero) address available." />
      </Head>

      <div className="py-10">
        <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors duration-200">
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Support My Work
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              My small github project helped you ? Donate some XMR and support me
            </p>
          </div>


          {/* XMR Donation Section */}
          <div className="bg-gradient-to-br from-yellow-600/10 to-orange-600/10 rounded-xl p-8 border border-yellow-500/20 mb-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fab fa-monero text-yellow-400 text-3xl"></i>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">XMR Donation</h2>
            </div>

            <div className="text-center">
              <p className="text-white/60 text-xs mb-2">(click to copy)</p>
              <button
                onClick={copyToClipboard}
                className="group relative w-full max-w-2xl mx-auto bg-neutral-800/80 hover:bg-neutral-800/60 rounded-lg p-4 border border-neutral-600/50 hover:border-yellow-500/50 transition-all duration-300"
              >
                <code className="text-yellow-400 font-mono text-sm break-all select-all">
                  {xmrAddress}
                </code>

                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {copied ? (
                    <div className="flex items-center text-green-400">
                      <i className="fas fa-check mr-2"></i>
                      <span className="text-sm">Copied!</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="fas fa-copy mr-2"></i>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* How to Get Monero */}
          <div className="bg-neutral-800/20 rounded-xl p-6 border border-neutral-700/30">
            <h3 className="text-lg font-medium text-white mb-3 text-center">How to Get Monero</h3>
            <div className="text-sm text-white/70 space-y-1">
              <p>• Buy XMR on exchanges (Binance, Kraken, Coinbase)</p>
              <p>• Mine XMR with CPU using XMRig</p>
              <p>• Download official wallet from getmonero.org</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
