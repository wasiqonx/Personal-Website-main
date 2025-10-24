import Head from 'next/head'
import Image from 'next/image'
import swr from '../lib/swr'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Projects() {
  const { data: _projects } = swr('/api/projects')
  const projects = _projects ? _projects : null
  const [label, setLabel] = useState('Investment Theses')
  const [activeTab, setActiveTab] = useState('projects')

  useEffect(() => {
    fetchConfig()
  }, [])

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
        <title>Projects - Wasiq Syed</title>
      </Head>
      <div className="py-20">
        <p className="text-3xl text-white font-semibold text-center">My Work</p>
        <p className="text-xl text-white/50 font-normal text-center mb-8">Explore my projects and investment analysis</p>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium ${
              activeTab === 'projects'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-800/20 text-white/70 hover:bg-neutral-800/40'
            }`}
          >
            <i className="fas fa-code mr-2"></i>Projects
          </button>
          <Link
            href="/investment-theses"
            className="px-6 py-2 rounded-lg transition-all duration-200 font-medium bg-neutral-800/20 text-white/70 hover:bg-neutral-800/40"
          >
            <i className="fas fa-file-pdf mr-2"></i>{label}
          </Link>
        </div>

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 w-full gap-4 items-center mt-2">
            {_projects ? (
              projects ? (
                projects.map((_, __) => (
                  <a href={_.link} target="_blank" rel="noreferrer" key={__} className="bg-neutral-800/10 p-4 hover:bg-neutral-800/20 shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg w-full">
                    <img alt={_.name} src={_.image} width="1024" className="rounded-lg" height="512" />
                    <p className="text-xl font-semibold mt-5">{_.name}</p>
                    <p className="text-md font-normal text-white/50 h-24 overflow-small" style={{ "overflow": 'auto' }}>{_.description}</p>
                  </a>
                ))
              ) : (
                Array.from({ length: 3 }).map((_, __) => (
                  <div key={__} className="bg-neutral-800/20 p-4 rounded-lg w-full">
                    <div className="flex-shrink-0 w-[100%] h-[8.6rem]">
                      <div className="w-full h-full bg-neutral-700/30 rounded-lg animate-pulse" />
                    </div>
                    <div className="bg-neutral-700/30 animate-pulse w-1/2 h-[24px] rounded-md mt-5" />
                    <div className="mt-2 bg-neutral-700/30 animate-pulse w-full h-[96px] rounded-md" />
                  </div>
                ))
              )
            ) : (
              Array.from({ length: 3 }).map((_, __) => (
                <div key={__} className="bg-neutral-800/20 p-4 rounded-lg w-full">
                  <div className="flex-shrink-0 w-[100%] h-[8.6rem]">
                    <div className="w-full h-full bg-neutral-700/30 rounded-lg animate-pulse" />
                  </div>
                  <div className="bg-neutral-700/30 animate-pulse w-1/2 h-[24px] rounded-md mt-5" />
                  <div className="mt-2 bg-neutral-700/30 animate-pulse w-full h-[96px] rounded-md" />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  )
}
