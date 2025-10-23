import '../styles/globals.css'
import '../styles/tooltip.css'
import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import 'tippy.js/animations/scale-subtle.css';
import 'tippy.js/animations/scale-extreme.css';
import 'tippy.js/animations/shift-away.css';
import 'tippy.js/animations/shift-toward.css';
import Router, { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { Transition } from "@headlessui/react";
import { AuthProvider } from '../lib/auth';

const Header = dynamic(() => import('../components/Header'))
const CookieConsent = dynamic(() => import('../components/CookieConsent'))

function MyApp({ Component, pageProps }) {
  const [load, setLoad] = useState(true); // Start with loaded state to prevent hydration mismatch

  useEffect(() => {
    // Set initial pointer events
    if (typeof document !== 'undefined') {
      document.documentElement.style.pointerEvents = 'all';
    }

    const handleRouteChangeStart = () => {
      setLoad(false);
      if (typeof document !== 'undefined') {
        document.documentElement.style.pointerEvents = 'none';
      }
    };

    const handleRouteChangeComplete = () => {
      setTimeout(() => {
        setLoad(true);
        if (typeof document !== 'undefined') {
          document.documentElement.style.pointerEvents = 'all';
        }
      }, 1000);
    };

    const handleRouteChangeError = () => {
      setTimeout(() => {
        setLoad(true);
        if (typeof document !== 'undefined') {
          document.documentElement.style.pointerEvents = 'all';
        }
      }, 1000);
    };

    Router.events.on('routeChangeStart', handleRouteChangeStart);
    Router.events.on('routeChangeComplete', handleRouteChangeComplete);
    Router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      Router.events.off('routeChangeStart', handleRouteChangeStart);
      Router.events.off('routeChangeComplete', handleRouteChangeComplete);
      Router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, []);
  return (
    <AuthProvider>
      <Head>
          <title>Wasiq Syed</title>
          <link rel="shortcut icon" href="https://qph.cf2.quoracdn.net/main-thumb-1808496254-200-feflnioakkpdmkngzwegyghruwlomhjl.jpeg" type="image/x-icon" ></link>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Suppress hydration warnings in development */}
      {process.env.NODE_ENV === 'development' && (
        <Script
          id="suppress-hydration-warnings"
          strategy="afterInteractive"
        >
          {`
            window.addEventListener('error', function(e) {
              if (e.message && e.message.includes('hydration')) {
                e.preventDefault();
                console.warn('Hydration warning suppressed:', e.message);
              }
            });
          `}
        </Script>
      )}
      <Transition
            as={Fragment}
            show={!load ? true : false}
            enter="transform transition duration-[100ms]"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transform duration-[250ms] transition ease-in-out"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
          <div style={{ zIndex: 99999 }} className="fixed bg-black/75 w-full h-screen flex justify-center items-center pointer-events-none">
              <div className="flex items-center gap-x-6 animate-pulse">
                  <div className="text-center">
                      <p className="text-6xl mb-5 font-semibold">Wasiq Syed</p>
                      <p className="uppercase text-xl font-semibold text-white"><i className="fal fa-spinner-third fa-spin" /></p>
                  </div>
              </div>
          </div>
      </Transition>
      <main className="border-b-[7px] border-t-[7px] h-full border-neutral-800/50 w-full">
        <div className="min-h-screen max-w-screen-lg p-5 w-full md:w-10/12 lg:w-8/12 mx-auto transition-all duration-300">
          <Header />
          <Component {...pageProps} />
        </div>
        <div className="bg-neutral-800/5">
          <div className="max-w-screen-lg p-5 w-full md:w-10/12 lg:w-8/12 mx-auto transition-all duration-300">
            <div className="md:flex w-full items-center justify-between">
              <div>
                <p>❤️ Wasiq Syed</p></div>
              <div className="mt-2 md:mt-0 flex items-center space-x-2">
                <a href="https://t.me/wasiqtg" target="_blank" rel="noreferrer" className="w-full md:w-auto bg-neutral-700/5 hover:bg-neutral-700/20 px-4 py-2 rounded-md transition-all duration-200">
                  <i className="fab fa-telegram mr-2" />Join My Telegram
                </a>
                <Link href="/cookies" className="w-full md:w-auto bg-neutral-700/5 hover:bg-neutral-700/20 px-4 py-2 rounded-md transition-all duration-200 text-sm">
                  🍪 Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <CookieConsent />
    </AuthProvider>
  );
}

export default MyApp
