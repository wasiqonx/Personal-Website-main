import Head from 'next/head'
import Image from 'next/image'
import swr from '../lib/swr';


export default function Home() {
  const { data: _projects } = swr('/api/projects');
  const projects = _projects ? _projects : null;

  const downloadPGPKey = () => {
    const link = document.createElement('a');
    link.href = '/pgp-key.asc';
    link.download = 'wasiq-pgp-key.asc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="py-20">
        <p className="text-3xl text-white font-semibold text-center">Contact Me</p>
        <p className="text-xl text-white/50 font-normal text-center mb-5">Other addresses where you can contact me.</p>
        <div className=" flex justify-center flex-col items-center">
            <div className="max-w-lg w-full">
                <a target="_blank" rel="norefferer" href="https://discord.com/users/518341959765458985">
                    <div className="mt-2 flex justify-between bg-zinc-500/5 hover:bg-zinc-500/10 transition-all duration-200 px-4 py-2 rounded-lg items-center">
                        <i className="fab fa-discord fa-2x" />
                        <p className="font-semibold text-xl">@wasiqonx</p>
                    </div>
                </a>
                <a target="_blank" rel="norefferer" href="https://instagram.com/wasiqonx">
                    <div className="mt-2 flex justify-between bg-zinc-500/5 hover:bg-zinc-500/10 transition-all duration-200 px-4 py-2 rounded-lg items-center">
                        <i className="fab fa-instagram fa-2x" />
                        <p className="font-semibold text-xl">@wasiqonx</p>
                    </div>
                </a>
                <a target="_blank" rel="norefferer" href="https://t.me/wasiqtg">
                    <div className="mt-2 flex justify-between bg-zinc-500/5 hover:bg-zinc-500/10 transition-all duration-200 px-4 py-2 rounded-lg items-center">
                        <i className="fab fa-telegram fa-2x" />
                        <p className="font-semibold text-xl">@wasiqtg</p>
                    </div>
                </a>
                <a target="_blank" rel="norefferer" href="https://wasiqonx.substack.com">
                    <div className="mt-2 flex justify-between bg-zinc-500/5 hover:bg-zinc-500/10 transition-all duration-200 px-4 py-2 rounded-lg items-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 12h-6l-2 3h-4l-2-3H2"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
                            <line x1="6" y1="16" x2="6.01" y2="16"/>
                            <line x1="10" y1="16" x2="10.01" y2="16"/>
                        </svg>
                        <p className="font-semibold text-xl">@wasiqonx</p>
                    </div>
                </a>
                <a target="_blank" rel="norefferer" href="https://twitter.com/wasiqonx">
                    <div className="mt-2 flex justify-between bg-zinc-500/5 hover:bg-zinc-500/10 transition-all duration-200 px-4 py-2 rounded-lg items-center">
                        <i className="fab fa-twitter fa-2x" />
                        <p className="font-semibold text-xl">@wasiqonx</p>
                    </div>
                </a>
                <button
                    onClick={() => window.location.href = 'mailto:wasiq@wasiq.in'}
                    className="mt-2 flex justify-between bg-zinc-500/5 hover:bg-zinc-500/10 transition-all duration-200 px-4 py-2 rounded-lg items-center w-full cursor-pointer"
                >
                    <i className="fa fa-envelope fa-2x" />
                    <p className="font-semibold text-xl">wasiq@wasiq.in</p>
                </button>
                <button
                    onClick={downloadPGPKey}
                    className="mt-2 flex justify-between bg-zinc-500/5 hover:bg-zinc-500/10 transition-all duration-200 px-4 py-2 rounded-lg items-center w-full cursor-pointer group"
                    title="Download PGP public key for secure encrypted communication"
                >
                    <div className="flex items-center space-x-3">
                        <i className="fa fa-lock fa-2x group-hover:text-green-400 transition-colors" />
                        <div className="text-left">
                            <p className="font-semibold text-xl">PGP Key</p>
                            <p className="text-xs text-white/50">Encrypted mail</p>
                        </div>
                    </div>
                    <i className="fa fa-download group-hover:translate-y-1 transition-transform" />
                </button>
            </div>
        </div>
      </div>
    </>
  )
}
