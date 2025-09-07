import Head from 'next/head'
import Image from 'next/image'
import swr from '../lib/swr';
import Tippy from '@tippyjs/react';


export default function Home() {
  // Removed unused repositories fetch

  return (
    <>
      <div className="bg-neutral-800/10 shadow-xl rounded-lg w-full h-auto mt-6">
          <div className="relative">
            <div className="flex flex-col lg:flex-row justify-between w-full p-6 px-8 items-center h-full">
              <div className="flex flex-col lg:justify-start justify-center items-center lg:items-start mt-5 lg:mt-0 w-full">
                <div className="flex items-center">
                <p className="flex items-center text-white text-4xl font-semibold">
                  Wasiq Syed (wasiqonx)
                </p>
                </div>
          <p className="text-white/50 text-md mt-3">
            (Investment Analyst/Technical Contributor)
          </p>
          <div className="mt-4 max-w-2xl text-center text-lg text-white/90">
            <p>Hi! I'm <strong>Wasiq</strong>, a software developer and content creator. I specialize in technology, software, and cryptocurrency.</p>
            <br></br>
            <h1 className="text-2xl font-bold text-white mt-6 mb-4"><strong>EXPERIENCE</strong></h1>
            <ul className="text-left list-disc list-inside space-y-2">
                <li><strong>Community Management:</strong> With 5 years of experience, I've worked on various projects, building and managing communities and developing social media strategies. During this time, I've successfully coordinated communities with thousands of members, adding value to multiple projects.</li>
                <li><strong>Software Development:</strong> As a full-stack web developer, I've been involved in various projects, including <strong>Code Share</strong>, a public platform for sharing software.</li>
                <li><strong>Content Creation:</strong> I create expert-level content about software and cryptocurrency on social media, where I've gained a following of over <strong>55,000 people</strong>.</li>
            </ul>
            <br></br>
            <h1 className="text-2xl font-bold text-white mt-6 mb-4"><strong>SOCIAL MEDIA AND COMMUNITY LINKS</strong></h1>
            <ul className="text-left list-disc list-inside space-y-1">
                <li><a href="https://github.com/wasiqonx" target="_blank" className="text-blue-400 hover:text-blue-300">wasiqonx - GitHub</a></li>
                <li><a href="https://instagram.com/wasiqonx" target="_blank" className="text-blue-400 hover:text-blue-300">wasiqonx - Instagram</a></li>
                <li><a href="https://twitter.com/wasiqonx" target="_blank" className="text-blue-400 hover:text-blue-300">wasiqonx - Twitter</a></li>
                <li><a href="https://t.me/wasigtg" target="_blank" className="text-blue-400 hover:text-blue-300">@wasiqtg - Telegram</a></li>
                <li><a href="https://youtube.com/@wasiqonx" target="_blank" className="text-blue-400 hover:text-blue-300">wasiqonx - YouTube</a></li>
                <li><a href="https://wasiqonx.substack.com" target="_blank" className="text-blue-400 hover:text-blue-300">wasiqonx - Substack</a></li>
            </ul>
            <br></br>
            <h1 className="text-2xl font-bold text-white mt-6 mb-4"><strong>PROJECTS</strong></h1>
            <p className="text-left"><strong>Code Share:</strong> My first project was a public platform for developers to share their software. This initiative helped me gain significant experience in planning, development, and project management. (<a href="https://codeshare.me" rel="follow" target="_blank" className="text-blue-400 hover:text-blue-300">codeshare.me</a>)</p>
            <br></br>
            <h1 className="text-2xl font-bold text-white mt-6 mb-4"><strong>GOALS</strong></h1>
            <p className="text-left">I aim to reach wider audiences by sharing knowledge in the fields of cryptocurrency and technology. With a focus on innovative thinking and professionalism, I strive to make a difference, especially in community management and social media.</p>
            <br></br>
            <p className="text-left">If you're interested in learning more about software, crypto, or community management, let's connect on my social media channels! 😊</p>
          </div>
              </div>
              <div className={`order-first lg:order-last flex-shrink-0 relative w-[160px] h-[160px] rounded-full pulse-avatar-online `}>
                <img alt="umutxyp" src={`https://ugc.production.linktr.ee/6RJk9s2pQZ2yAdcxw3Ir_TXX2dLlNmwM2OFdf?io=true&size=avatar-v3_0`} width="160" height="160" className={`bg-neutral-700 w-[160px] h-[160px] rounded-full`} />
              </div>
              
            </div>
            <br></br><br></br>
            <span style={{ zIndex: '-1' }} className="text-white/5 absolute bottom-3 left-7 text-xl sm:text-2xl md:text-4xl lg:text-3xl font-semibold">Content Creator / Community Manager</span>
          </div>
      </div>
    </>
  )
}
