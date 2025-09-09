
const items = [
        { icon: 'fab fa-instagram', link: 'https://instagram.com/wasiqonx' },
    { icon: 'fab fa-youtube', link: 'https://youtube.com/@wasiqonx' },
    { icon: 'fab fa-github', link: 'https://github.com/wasiqonx' },
    { icon: 'fab fa-twitter', link: 'https://twitter.com/wasiqonx' },
    { icon: 'fab fa-telegram', link: 'https://t.me/wasiqtg' },
    { icon: 'custom-substack', link: 'https://wasiqonx.substack.com', customIcon: true },
  ]

const navItems = [
    { icon: 'fal fa-home', active: 'fa fa-home', label: 'Home', href: '/' },
    { icon: 'fal fa-compass', active: 'fa fa-compass', label: 'Projects', href: '/projects' },
    { icon: 'fal fa-rss', active: 'fa fa-rss', label: 'Blog', href: '/blog' },
    { icon: 'fal fa-code-branch', active: 'fa fa-code-branch', label: 'GitHub', href: '/github' },
    { icon: 'fal fa-heart', active: 'fa fa-heart', label: 'Donate', href: '/donate' },
    { icon: 'fal fa-phone', active: 'fa fa-phone', label: 'Contact', href: '/contact' }
]

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';

const Header = () => {
    const router = useRouter();
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    
    const isActive = (href) => {
        if (href === '/blog' && router.asPath.startsWith('/blog')) return true;
        return router.asPath === href;
    };

    return <>
        <div className="w-full border-b-2 border-neutral-800/20 pb-2">
            <div className="flex flex-col md:flex-row w-full items-center md:justify-between">
                <p className="font-semibold font-Poppins text-xl">WS</p>
                <div className="flex items-center space-x-2">
                    {items.map(item => (
                        <a key={item.link} href={item.link} target="_blank" rel="noreferrer" className="flex items-center justify-center hover:bg-neutral-700/20 rounded-xl transition-all duration-150 p-2 px-3">
                            {item.customIcon ? (
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 12h-6l-2 3h-4l-2-3H2"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
                                    <line x1="6" y1="16" x2="6.01" y2="16"/>
                                    <line x1="10" y1="16" x2="10.01" y2="16"/>
                                </svg>
                            ) : (
                                <i className={`${item.icon} text-3xl`} />
                            )}
                        </a>
                    ))}
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center py-2">
                <div className="flex justify-center md:justify-start items-center space-x-4">
                    {navItems.map(item => (
                        <Link key={item.label} href={item.href} className={`flex items-center justify-center text-white/50 cursor-pointer hover:text-white/100 rounded-xl transition-all duration-150 ${isActive(item.href) && 'text-white/100'}`}>
                            <i className={`${isActive(item.href) ? item.active : item.icon} mr-2`} />{item.label}
                        </Link>
                    ))}
                    {isAdmin && (
                        <Link href="/admin" className={`flex items-center justify-center text-white/50 cursor-pointer hover:text-white/100 rounded-xl transition-all duration-150 ${isActive('/admin') && 'text-white/100'}`}>
                            <i className={`${isActive('/admin') ? 'fa fa-cog' : 'fal fa-cog'} mr-2`} />Admin
                        </Link>
                    )}
                </div>

                <div className="flex items-center space-x-3 mt-2 md:mt-0">
                    {isAuthenticated ? (
                        <>
                            <span className="text-white/70 text-sm">Hello, {user.username}</span>
                            <Link href="/profile" className="text-white/50 hover:text-white/100 transition-colors duration-150">
                                <i className="fal fa-user mr-1" />Profile
                            </Link>
                            <button
                                onClick={logout}
                                className="text-white/50 hover:text-white/100 transition-colors duration-150"
                            >
                                <i className="fal fa-sign-out-alt mr-1" />Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/login" className="text-white/50 hover:text-white/100 transition-colors duration-150">
                                <i className="fal fa-sign-in-alt mr-1" />Login
                            </Link>
                            <Link href="/auth/register" className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-sm transition-colors duration-150">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    </>
}

export default Header;
