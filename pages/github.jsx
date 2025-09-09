import Head from 'next/head'
import Link from 'next/link'

export default function GitHub() {
  return (
    <>
      <Head>
        <title>GitHub Contributions - Wasiq Syed</title>
        <meta name="description" content="View my GitHub contributions and projects." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-10">
        <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors duration-200 ml-4 md:ml-8">
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Home
        </Link>

        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              GitHub Contributions
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Open source contributions and project activity.
            </p>
          </div>

          <div className="space-y-8">
            {/* GitHub Contribution Graph */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-8 border border-neutral-700/70 shadow-2xl">
              <h2 className="text-2xl font-semibold text-white mb-8 text-center">Contribution Activity</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-neutral-900/50 rounded-lg p-6 border border-neutral-700/50">
                    <img
                      src="https://github-readme-stats.vercel.app/api?username=wasiqonx&show_icons=true&theme=transparent&hide_border=true&bg_color=00000000&text_color=ffffff&icon_color=60a5fa&title_color=ffffff"
                      alt="GitHub Stats"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                  <div className="bg-neutral-900/50 rounded-lg p-6 border border-neutral-700/50">
                    <img
                      src="https://github-readme-stats.vercel.app/api/top-langs/?username=wasiqonx&layout=compact&theme=transparent&hide_border=true&bg_color=00000000&text_color=ffffff&title_color=ffffff"
                      alt="Top Languages"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
                <div className="bg-neutral-900/50 rounded-lg p-6 border border-neutral-700/50 flex items-center justify-center">
                  <img
                    src="https://github-readme-streak-stats.herokuapp.com/?user=wasiqonx&theme=transparent&hide_border=true&background=00000000&stroke=374151&ring=60a5fa&fire=60a5fa&currStreakLabel=ffffff&sideLabels=ffffff&currStreakNum=ffffff&sideNums=ffffff&dates=9ca3af"
                    alt="GitHub Streak"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* GitHub Profile Link */}
            <div className="text-center">
              <a
                href="https://github.com/wasiqonx"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 px-8 py-4 rounded-lg text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <i className="fab fa-github mr-3 text-xl"></i>
                View Full Profile on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
