import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function InvestmentTheses() {
  const [theses, setTheses] = useState([])
  const [loading, setLoading] = useState(true)
  const [label, setLabel] = useState('Investment Theses')

  useEffect(() => {
    fetchTheses()
    fetchConfig()
  }, [])

  const fetchTheses = async () => {
    try {
      const response = await fetch('/api/admin/investment-theses')
      if (!response.ok) throw new Error('Failed to fetch theses')
      const data = await response.json()
      setTheses(data)
    } catch (error) {
      console.error('Failed to fetch theses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config')
      if (!response.ok) throw new Error('Failed to fetch config')
      const data = await response.json()
      setLabel(data.investmentThesesLabel)
    } catch (error) {
      console.error('Failed to fetch config:', error)
    }
  }

  return (
    <>
      <Head>
        <title>{label} - Wasiq Syed</title>
        <meta name="description" content={`View my ${label}`} />
      </Head>

      <div className="py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl text-white font-semibold mb-3">{label}</h1>
          <p className="text-xl text-white/50">
            A collection of my investment analysis and market insights
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <i className="fas fa-spinner fa-spin text-3xl text-white/50"></i>
          </div>
        ) : theses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/50 text-lg">No investment theses available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
            {theses.map((thesis) => (
              <a
                key={thesis.id}
                href={thesis.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-neutral-800/10 hover:bg-neutral-800/30 border border-neutral-700/30 hover:border-neutral-600 rounded-lg p-6 transition-all duration-300 hover:shadow-xl"
              >
                {/* PDF Icon */}
                <div className="mb-4 inline-flex p-3 bg-red-600/20 rounded-lg group-hover:bg-red-600/30 transition-colors">
                  <i className="fas fa-file-pdf text-2xl text-red-500"></i>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-red-400 transition-colors line-clamp-2">
                  {thesis.title}
                </h3>

                {/* Meta Info */}
                <div className="space-y-2 text-sm">
                  <p className="text-white/60">
                    <i className="fas fa-user mr-2 text-white/40"></i>
                    {thesis.author?.username || 'Admin'}
                  </p>
                  <p className="text-white/60">
                    <i className="fas fa-calendar mr-2 text-white/40"></i>
                    {new Date(thesis.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* CTA */}
                <div className="mt-6 pt-6 border-t border-neutral-700/20 flex items-center justify-between group-hover:justify-start group-hover:gap-2 transition-all">
                  <span className="text-blue-400 font-medium">View PDF</span>
                  <i className="fas fa-arrow-right text-blue-400 group-hover:translate-x-1 transition-transform"></i>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link href="/projects" className="text-blue-400 hover:text-blue-300 transition-colors">
            <i className="fas fa-arrow-left mr-2"></i>Back to Projects
          </Link>
        </div>
      </div>
    </>
  )
}
