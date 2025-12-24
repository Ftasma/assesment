import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/dashboard/Dashboard'
import { getSupabase } from './lib/supabase'
function LogoMark() {
  return (
    <div className="w-8 h-8 rounded-md bg-[#E9D4FF] flex items-center justify-center text-[#9013FE] font-bold">F</div>
  )
}

function PlaceholderIcon({ size = 48 }: { size?: number }) {
  const s = `${size}px`
  return (
    <div className="rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.15)] flex items-center justify-center" style={{ width: s, height: s }}>
      <div className="rounded-full" style={{ width: size * 0.6, height: size * 0.6, background: 'linear-gradient(135deg,#9013FE,#FF8687)' }} />
    </div>
  )
}

function Landing({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  const [audience, setAudience] = useState<'users' | 'brands'>('users')
  const [mobileOpen, setMobileOpen] = useState(false)
  const indicatorX = audience === 'users' ? 'translateX(0)' : 'translateX(100%)'

  return (
    <div>
      <div className="bg-black text-white flex w-full text-xs font-manrope md:text-sm h-14 items-center px-3">
        <p className="text-center w-full">🚀 Big news! The full Flowva experience + mobile apps are launching soon on iOS & Android</p>
      </div>
      <div className="px-2">
        <header className="left-1/2 right-1/2 -translate-x-1/2 md:border bg-white relative top-[10px] md:top-[20px] md:w-full font-manrope md:max-w-[80%] md:border-[#0000000D] rounded-[100px] h-[56px] py-[8px] px-[14px]">
          <nav className="flex items-center w-full">
            <div className="hidden md:flex items-center w-full">
              <div className="w-full font-semibold text-sm flex justify-between items-center">
                <div className="flex items-center">
                  <div className="flex gap-1.5 items-center"><LogoMark /></div>
                  <div className="border-[1px] h-[28px] mx-5 border-[#0000000D] w-0" />
                  <ul className="flex items-center gap-6 relative">
                    <li className="cursor-pointer relative"><span className="flex items-center gap-1 hover:text-[#9013fe] text-[#A5A5A5]">Hub</span></li>
                    <li className="cursor-pointer relative"><span className="flex items-center gap-1 hover:text-[#9013fe] text-[#A5A5A5]">Company</span></li>
                    <li className="cursor-pointer relative"><span className="flex items-center gap-1 hover:text-[#9013fe] text-[#A5A5A5]">Support</span></li>
                    <li className="cursor-pointer relative"><span className="flex items-center gap-1 hover:text-[#9013fe] text-[#A5A5A5]">Community</span></li>
                  </ul>
                </div>
                <div className="border-[1px] h-[28px] mx-5 border-[#0000000D] w-0" />
                <div className="w-[195px] font-manrope flex items-center gap-8 h-[40px]">
                  <button onClick={onLogin} className="w-[84px] h-[40px] text-sm font-bold border-[#9013FE1A] rounded-[100px] border p-[4px]"><div className="h-full w-full flex justify-center items-center px-[16px] transition-all ease-linear duration-200 rounded-[100px] bg-white hover:bg-[#111111] hover:shadow-[0px_2px_4px_0px_#0000001A,0px_6px_6px_0px_#00000017,0px_14px_9px_0px_#0000000D,0px_26px_10px_0px_#00000003,0px_40px_11px_0px_#00000000,-4px_13px_19px_0px_#ECD6FF80_inset] hover:text-white relative shadow-[0px_2px_4px_0px_#0000001A]">Login</div></button>
                  <button onClick={onSignup} className="w-[84px] font-manrope h-[40px] text-sm font-bold border-[#9013FE1A] rounded-[100px] border p-[4px]"><div className="h-full flex items-center justify-center w-full whitespace-nowrap px-[16px] rounded-[100px] relative bg-[#111111] hover:bg-[#b362fae3] transition-all ease-linear duration-200 text-white shadow-[0px_2px_4px_0px_#0000001A,0px_6px_6px_0px_#00000017,0px_14px_9px_0px_#0000000D,0px_26px_10px_0px_#00000003,0px_40px_11px_0px_#00000000,-4px_13px_19px_0px_#ECD6FF80_inset]">Sign up</div></button>
                </div>
              </div>
            </div>
            <div className="md:!hidden flex justify-between items-center w-full">
              <div><LogoMark /></div>
              <button onClick={() => setMobileOpen(true)}>
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 17H19M5 12H19M5 7H19" stroke="#141B34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </nav>
        </header>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 w-full bg-white mt-[80px] px-4 overflow-y-auto">
            <aside className="py-4">
              <div className="space-y-4">
                {['HUB', 'COMPANY', 'SUPPORT', 'COMMUNITY'].map((t) => (
                  <div key={t} className="border-b pb-3"><span className="text-[32px] font-semibold font-[impact]">{t}</span></div>
                ))}
              </div>
              <div className="flex mt-5 items-center gap-[12px] flex-col">
                <button onClick={onLogin} className="w-full h-[57px] text-sm font-bold border-[#9013FE1A] rounded-[100px] border p-[4px]"><span className="h-full flex justify-center items-center w-full p-[6px_16px] hover:bg-[#111111] hover:shadow-[0px_2px_4px_0px_#0000001A,0px_6px_6px_0px_#00000017,0px_14px_9px_0px_#0000000D,0px_26px_10px_0px_#00000003,0px_40px_11px_0px_#00000000,-4px_13px_19px_0px_#ECD6FF80_inset] hover:text-white rounded-[100px] relative shadow-[0px_2px_4px_0px_#0000001A]">Login</span></button>
                <button onClick={onSignup} className="w-full h-[57px] text-sm font-bold border-[#9013FE1A] rounded-[100px] border p-[4px]"><span className="h-full flex justify-center items-center w-full whitespace-nowrap p-[6px_16px] rounded-[100px] relative bg-[#111111] hover:bg-[#b362fae3] transition-all ease-linear duration-200 text-white shadow-[0px_2px_4px_0px_#0000001A,0px_6px_6px_0px_#00000017,0px_14px_9px_0px_#0000000D,0px_26px_10px_0px_#00000003,0px_40px_11px_0px_#00000000,-4px_13px_19px_0px_#ECD6FF80_inset]">Sign up</span></button>
              </div>
            </aside>
          </div>
        </div>
      )}
      <main>
        <div className="left-1/2 right-1/2 top-[25px] md:top-[70px] bg-[#F9F9F9] border border-[#0000000D] -translate-x-1/2 relative w-full max-w-[265px] h-[64px] flex items-center gap-[8px] rounded-[100px] p-[8px]">
          <div className="absolute top-[8px] h-[48px] w-[calc(50%-8px)] rounded-[100px] transition-transform duration-300 ease-in-out shadow-[0px_2px_4px_0px_#0000001A,0px_6px_6px_0px_#00000017,0px_14px_9px_0px_#0000000D,0px_26px_10px_0px_#00000003,0px_40px_11px_0px_#00000000,-4px_13px_19px_0px_#ECD6FF80_inset] bg-[#111111]" style={{ transform: indicatorX }} />
          <button onClick={() => setAudience('users')} className="relative z-10 flex items-center justify-center w-[50%] h-[48px] text-sm font-bold rounded-[100px] font-manrope"><PlaceholderIcon size={24} /><span className="ml-2 transition-colors duration-300 bg-gradient-to-r from-[#ECD6FF] to-[#FF8687] bg-clip-text text-transparent">For users</span></button>
          <button onClick={() => setAudience('brands')} className="relative z-10 flex items-center justify-center w-[50%] h-[48px] text-sm font-bold rounded-[100px] font-manrope"><PlaceholderIcon size={24} /><span className="ml-2 transition-colors duration-300 text-black">For brands</span></button>
        </div>
        <div>
          <h1 className="text-[40px] md:text-[72px] mt-[55px] md:mt-[130px] text-center font-[Impact] leading-[120%]">YOUR <span className="inline-flex px-5 rounded-[100px] text-white bg-[linear-gradient(90deg,#9013FE_0%,#FF8687_100%)]">SMART</span> SPACE <br className=" md:hidden" /> TO MANAGE YOUR <br /> DIGITAL LIFE AND BE REWARDED</h1>
          <button onClick={onSignup} className="mt-8 md:mt-10 relative left-1/2 -translate-x-1/2 w-[232px] rounded-[100px] border border-[#9013FE1A] p-[6px] font-bold text-sm font-manrope"><div className="w-full text-sm whitespace-nowrap p-[24px] rounded-[100px] relative bg-[#111111] hover:bg-[#b362fae3] transition-all ease-linear duration-200 text-white shadow-[0px_2px_4px_0px_#0000001A,0px_6px_6px_0px_#00000017,0px_14px_9px_0px_#0000000D,0px_26px_10px_0px_#00000003,0px_40px_11px_0px_#00000000,-4px_13px_19px_0px_#ECD6FF80_inset]">Start Earning Today</div></button>
          <div className="overflow-hidden mt-12 md:mt-20 relative w-full">
            <div className="flex w-max animate-scrollLeft">
              {Array.from({ length: 24 }).map((_, i) => (<div key={`row1-${i}`} className="mx-4"><PlaceholderIcon size={77} /></div>))}
            </div>
            <div className="flex w-max animate-scrollRight mt-5 md:mt-10">
              {Array.from({ length: 24 }).map((_, i) => (<div key={`row2-${i}`} className="mx-4"><PlaceholderIcon size={77} /></div>))}
            </div>
          </div>
          <p className="px-[14px] text-[20px] md:text-[36px] mt-[70px] mb-20 md:my-28 text-center font-semibold font-manrope leading-[32px] md:leading-[40px]">Turn productivity into rewards with a calm, smart <br className="hidden md:block" /> space that organizes your tools, and keeps you in control.</p>
          <section className="flex justify-center px-[14px]">
            <div className="flex flex-col md:flex-row w-full lg:w-[80%] items-center gap-5">
              <div className="w-full shadow-md max-w-[417.67px] pb-10 flex flex-col justify-between p-[16px] h-[327px] md:h-[384px] rotate-0 opacity-100 rounded-2xl border border-[#0000001F] bg-[#F5EBFF]">
                <div className="flex flex-col gap-[12px]"><h2 className="font-[impact] text-[56px]">10,000+</h2><p className="text-[24px]">Users</p></div>
                <p className="text-[20px] font-manrope text-[#5F5F5F]">Already simplifying their workflow with Flowva</p>
                <div className="flex items-center gap-2"><PlaceholderIcon size={24} /><span className="font-semibold font-manrope">10,000+</span></div>
              </div>
              <div className="w-full shadow-md max-w-[417.67px] pb-10 flex flex-col justify-between p-[16px] h-[327px] md:h-[384px] rotate-0 opacity-100 rounded-2xl border border-[#0000001F] bg-[#F5EBFF]">
                <div className="flex flex-col gap-[12px]"><h2 className="font-[impact] text-[56px]">200+</h2><p className="text-[24px]">Tools</p></div>
                <p className="text-[20px] font-manrope text-[#5F5F5F]">Curated and organized for you in the library</p>
                <div className="flex items-center gap-2"><PlaceholderIcon size={24} /><span className="font-semibold font-manrope">Top picks</span></div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <section className="my-24 px-[14px]">
        <h2 className="text-[56px] md:text-[64px] leading-[120%] font-[impact] mb-10 text-center">SIMPLE, REWARDING, CALM</h2>
        <JourneyCarousel />
      </section>
      <section className="mb-16 px-[14px]">
        <div className="flex justify-center">
          <svg width="73" height="51" viewBox="0 0 73 51" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32.3275 8.59811C24.8945 7.27805 21.9922 13.7634 21.9922 13.7634C21.9922 13.7634 15.8152 10.2518 10.6035 15.7135C4.29112 22.3286 9.00907 38.5919 30.4172 39.486C47.1481 26.0999 41.3302 10.1969 32.3275 8.59811Z" stroke="#141B34" strokeWidth="5" strokeLinecap="round"></path><path d="M51.5082 11.8063C51.5278 11.8317 51.5469 11.8567 51.5657 11.8814C51.5938 11.8684 51.6225 11.8553 51.6516 11.8422C52.367 11.5191 53.3873 11.146 54.6095 10.9494C57.0896 10.5504 60.3684 10.8912 63.4954 13.7232C67.3936 17.2538 68.1628 23.5668 65.2679 29.1475C62.3396 34.7924 55.7171 39.7049 44.7588 40.9448L44.2939 40.9974L43.9083 40.7324C34.8198 34.4857 31.2847 27.0364 31.3543 20.6775C31.4231 14.391 35.0702 9.18095 40.1707 7.89782C44.262 6.86855 47.316 8.10946 49.3174 9.6277C50.3036 10.3759 51.0288 11.1849 51.5082 11.8063Z" fill="#9013FE"></path></svg>
        </div>
        <h2 className="text-[56px] md:text-[64px] font-[impact] mb-10 text-center">JOIN A GROWING COMMUNITY</h2>
        <Testimonials />
      </section>
      <section className="flex justify-center mb-20 px-[14px]">
        <FinalHero onCTA={onSignup} />
      </section>
      <Footer />
    </div>
  )
}


function App() {
  const [route, setRoute] = useState(window.location.pathname)
  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) localStorage.setItem('ref', ref)
  }, [])
  const navigate = (path: string) => {
    if (path !== window.location.pathname) {
      window.history.pushState({}, '', path)
      setRoute(path)
    }
  }
  useEffect(() => {
    const client = getSupabase()
    client.auth.onAuthStateChange((_event, session) => {
      if (session && route === '/login') setRoute('/dashboard')
    })
  }, [route])
  if (route === '/login') {
    return <Login onNavigate={navigate} />
  }
  if (route === '/signup') {
    return <Signup onNavigate={navigate} />
  }
  if (route.startsWith('/dashboard')) {
    const section = route.replace('/dashboard', '').replace(/^\//, '') || 'rewards'
    return <Dashboard section={section} />
  }
  return <Landing onLogin={() => navigate('/login')} onSignup={() => navigate('/signup')} />
}

function JourneyCarousel() {
  const [active, setActive] = useState(0)
  const cards = [
    { id: 0, title: 'Sign up & Connect', desc: 'Set up your workspace in minutes' },
    { id: 1, title: 'Organize & Track', desc: 'Add your tools, subscriptions, and tasks.' },
    { id: 2, title: 'Earn & Enjoy', desc: 'Check in daily, try new tools, and watch your points grow.' },
  ]
  return (
    <div>
      <div className="hidden lg:grid grid-cols-12 gap-4 w-full lg:w-[80%] xl:max-w-[80%] mx-auto">
        {cards.map((c, idx) => (
          <div key={c.id} className={`${idx === active ? 'col-span-8' : 'col-span-2'} relative overflow-hidden bg-[#ECD6FF] border border-[#0000001F] rounded-xl p-6 transition-all duration-300`}
               onMouseEnter={() => setActive(idx)}>
            <div className="flex flex-col justify-between h-full">
              <h2 className="font-[impact] text-black text-[120px] xl:text-[180px]">{idx + 1}</h2>
              <div>
                <h3 className="text-[20px] xl:text-[36px] text-black font-manrope font-bold xl:font-semibold">{c.title}</h3>
                {idx === active && <p className="text-[20px] text-black font-manrope font-semibold">{c.desc}</p>}
              </div>
            </div>
            {idx === active && <div className="absolute right-5 -top-10 rounded-[32px] w-[300px]"><PlaceholderIcon size={80} /></div>}
          </div>
        ))}
      </div>
      <div className="flex flex-col lg:hidden w-full gap-4">
        {cards.map((c, idx) => (
          <div key={`m-${c.id}`} className="relative overflow-hidden bg-[#ECD6FF] border border-[#0000001F] rounded-xl p-6 h-[407px] pb-10">
            <div className="flex flex-col justify-between h-full">
              <h2 className="font-[impact] text-black text-[120px]">{idx + 1}</h2>
              <div>
                <h3 className="text-[36px] text-black font-manrope font-semibold">{c.title}</h3>
                <p className="text-[20px] text-black font-manrope font-semibold">{c.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden lg:flex justify-center items-center mt-6 gap-4 w-full max-w-md mx-auto">
        <button className="h-[53px] w-[52px] bg-[#F1F1F1] text-black rounded-full md:flex items-center justify-center" onClick={() => setActive((a) => (a === 0 ? 2 : a - 1))}>
          <svg viewBox="0 0 320 512" width="20" height="20"><path fill="currentColor" d="M34.9 239l194.3-194.3c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L121 256l165.7 165.7c9.4 9.4 9.4 24.6 0 33.9l-22.6 22.6c-9.4 9.4-24.6 9.4-33.9 0L34.9 273c-9.4-9.4-9.4-24.6 0-34z"/></svg>
        </button>
        <div className="h-[52px] w-[104px] bg-[#F1F1F1] flex justify-center items-center rounded-[100px] px-4">
          <div className="flex items-center gap-3 w-full">
            {[0,1,2].map(i => (
              <div key={`dot-${i}`} className={`h-2 rounded-full transition-all duration-300 ${i===active ? 'flex-[1_1_0%] bg-black' : 'flex-[0_0_8px] bg-[#5F5F5F]'}`} onClick={() => setActive(i)}></div>
            ))}
          </div>
        </div>
        <button className="h-[53px] w-[52px] bg-[#F1F1F1] text-black rounded-full md:flex items-center justify-center" onClick={() => setActive((a) => (a === 2 ? 0 : a + 1))}>
          <svg viewBox="0 0 320 512" width="20" height="20"><path fill="currentColor" d="M285.1 273L90.7 467.3c-9.4 9.4-24.6 9.4-33.9 0L34.2 444.7c-9.4-9.4-9.4-24.6 0-33.9L200 245.1 34.2 79.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0L285.1 239c9.4 9.4 9.4 24.6 0 34z"/></svg>
        </button>
      </div>
    </div>
  )
}

function Testimonials() {
  const [idx, setIdx] = useState(0)
  const items = [
    { text: 'Flowvahub makes finding tools effortless. Instead of wasting hours jumping between sites, I just open Discover Tools everything\'s clear, organized, and right there. Feels less like searching, more like unlocking possibilities. ☕💜', name: 'Ummaratu M.', role: 'Freelancer & Virtual Assistant', color: 'rgb(93,206,255)' },
    { text: 'The rewards make staying productive fun. I check in, try a new tool, and see points grow. It\'s simple and motivating.', name: 'Alex R.', role: 'Product Designer', color: 'rgb(255,223,233)' },
    { text: 'A calm space to manage my stack and subscriptions. Fewer tabs, more focus.', name: 'Sam K.', role: 'Engineer', color: 'rgb(239,239,239)' },
  ]
  const item = items[idx]
  return (
    <div className="flex justify-center">
      <div className="w-full md:max-w-[80%]">
        <div className="p-6 rounded-xl shadow-md flex flex-col justify-between min-h-[320px]" style={{ backgroundColor: item.color }}>
          <p className="text-[24px] font-semibold mb-4 font-manrope">{item.text}</p>
          <div className="flex items-center gap-4">
            <svg width="124" height="20" viewBox="0 0 124 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.99675 1.04199C10.8711 1.04199 11.5599 1.70244 11.9996 2.59359L13.468 5.55463C13.5125 5.64627 13.618 5.77531 13.7767 5.89336C13.9352 6.01128 14.0905 6.07634 14.1926 6.0935L16.8506 6.53876C17.8107 6.70011 18.6155 7.17074 18.8767 7.99024C19.1378 8.80907 18.7553 9.66 18.0649 10.3517L15.9993 12.4344C15.9174 12.5169 15.8257 12.6723 15.7682 12.8749C15.7111 13.076 15.7061 13.2592 15.732 13.3776L16.3231 15.9548C16.5681 17.0268 16.4869 18.0898 15.7309 18.6455C14.9723 19.2031 13.9356 18.9559 12.9938 18.395L10.5021 16.9078C10.3975 16.8453 10.2178 16.7947 10.0009 16.7947C9.78561 16.7947 9.60214 16.8447 9.4907 16.9095L7.0024 18.3947C6.06171 18.9575 5.02628 19.2003 4.26759 18.6422C3.51208 18.0863 3.42678 17.0254 3.67259 15.9543L4.26325 13.3793C4.28951 13.2592 4.28444 13.076 4.22733 12.8749C4.16983 12.6723 4.07815 12.5169 3.99631 12.4344L1.92988 10.3509C1.24387 9.65919 0.862672 8.809 1.12162 7.99137C1.38133 7.17136 2.18452 6.70016 3.14528 6.53871L5.8011 6.09382C5.89931 6.07678 6.05225 6.01246 6.2104 5.89423C6.36884 5.77578 6.47466 5.64645 6.51927 5.55463L7.98802 2.5928L7.9886 2.59164C8.43247 1.70122 9.12336 1.04199 9.99675 1.04199Z" fill="#141B34"></path></svg>
            <div><h4 className="font-semibold text-[28px]">{item.name}</h4><p className="text-[20px]">{item.role}</p></div>
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, i) => (
            <span key={`tb-${i}`} className={`w-2 h-2 rounded-full ${i===idx ? 'bg-black' : 'bg-gray-300'}`} onClick={() => setIdx(i)}></span>
          ))}
        </div>
      </div>
    </div>
  )
}

function FinalHero({ onCTA }: { onCTA: () => void }) {
  return (
    <div className="bg-[#F7FF5D] relative overflow-hidden min-h-[394px] md:min-h-[550px] py-16 border border-[#00000014] w-full rounded-[16px] md:rounded-[32px] md:max-w-[80%]">
      <div className="relative z-10 px-[45px]">
        <h2 className="text-[40px] md:text-[64px] leading-[120%] font-[impact] mb-10 text-center">STAY PRODUCTIVE. <br /> GET REWARDED.</h2>
        <p className="md:text-[28px] leading-[30px] md:leading-[35px] font-semibold text-center font-manrope">Turn your tools, subscriptions, and daily habits into <br className="hidden md:block" /> rewards all in one calm space</p>
        <button onClick={onCTA} className="mt-10 left-1/2 font-manrope right-1/2 -translate-x-1/2 relative w-[232px] text-sm font-bold border-[#9013FE1A] rounded-[100px] border p-[6px]"><div className="w-full text-sm whitespace-nowrap p-[24px] rounded-[100px] relative bg-[#111111] hover:bg-[#b362fae3] transition-all ease-linear duration-200 text-white shadow-[0px_2px_4px_0px_#0000001A,0px_6px_6px_0px_#00000017,0px_14px_9px_0px_#0000000D,0px_26px_10px_0px_#00000003,0px_40px_11px_0px_#00000000,-4px_13px_19px_0px_#ECD6FF80_inset]">Unlock Rewards Now</div></button>
      </div>
      <div className="absolute -left-16 top-[60%] md:-left-10 md:top-1/2 md:-translate-y-1/2">
        <PlaceholderIcon size={77} />
        <div className="ml-28 inline-block"><PlaceholderIcon size={77} /></div>
        <div className="ml-24 inline-block"><PlaceholderIcon size={77} /></div>
        <PlaceholderIcon size={77} />
      </div>
      <div className="absolute -right-24 -top-[68%] rotate-180 transition md:-right-10 md:top-1/2 md:-translate-y-1/2">
        <PlaceholderIcon size={77} />
        <div className="ml-28 inline-block"><PlaceholderIcon size={77} /></div>
        <div className="ml-24 inline-block"><PlaceholderIcon size={77} /></div>
        <PlaceholderIcon size={77} />
      </div>
    </div>
  )
}

function Footer() {
  const [email, setEmail] = useState('')
  return (
    <footer className="bg-black grid place-items-center rounded-tl-[16px] md:rounded-tl-[32px] rounded-tr-[32px] pb-14">
      <div className="bg-[#FFFFFF0D] w-full max-w-[745px] grid place-items-center pb-10 rounded-bl-[32px] rounded-br-[32px]">
        <div className="mt-10 md:mt-16"><LogoMark /></div>
        <div className="w-full flex justify-center mt-5">
          <form className="relative w-full max-w-[320px] md:max-w-[503px]" onSubmit={(e)=>e.preventDefault()}>
            <input type="email" placeholder="Enter email address" required className="w-full max-w-[320px] pr-[40%] border border-[#00000014] outline-none focus:border-[#9013FE] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(144,19,254,0.1)] transition md:max-w-[503px] text-white p-[16px] rounded-[24px] h-[64px] md:h-[68px] bg-[#FFFFFF29]" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <button className="bg.white hover:bg-[#b362fae3] transition-all hover:shadow-[0px_2px_4px_0px_#0000001A,0px_6px_6px_0px_#00000017,0px_14px_9px_0px_#0000000D,0px_26px_10px_0px_#00000003,0px_40px_11px_0px_#00000000,-4px_13px_19px_0px_#ECD6FF80_inset] group flex items-center hover:text-white text-black absolute p-[8px_16px] rounded-[100px] right-5 top-1/2 -translate-y-1/2">Submit<svg viewBox="0 0 448 512" width="16" height="16" className="ml-[0.5rem] group-hover:translate-x-[3px] transition-all duration-300 ease-in-out"><path fill="currentColor" d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg></button>
          </form>
        </div>
        <p className="text-[#FFFFFF80] text-sm md:text-base mt-5 text-center">10,000+ end their week inspired. Join Friday Flow.</p>
      </div>
      <div className="md:w-fit flex items-center gap-5 justify-between w-full mt-10 px-[14px]">
        <a className="flex items-center gap-2 hover:underline underline-offset-1" href="#" target="_blank"><svg width="30" height="35" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.268 6.12501C12.5384 6.12495 11.8895 6.1249 11.3657 6.19535C10.7963 6.27192 10.2214 6.44849 9.7515 6.91852C9.28162 7.38855 9.10511 7.96364 9.02856 8.53319C8.95813 9.05719 8.95819 9.70624 8.95825 10.4361L8.95825 11.1266H8.33325C7.75796 11.1266 7.29158 11.5931 7.29158 12.1686C7.29158 12.7441 7.75796 13.2106 8.33325 13.2106H8.95825V18.2085C8.95825 18.6037 8.95825 18.8013 8.83434 18.9237C8.71043 19.0461 8.51434 19.0436 8.12217 19.0386C7.13097 19.0261 6.28804 18.9913 5.57327 18.8952C4.42606 18.7409 3.51585 18.4183 2.80068 17.7029C2.08552 16.9875 1.76299 16.077 1.60875 14.9294C1.45823 13.8096 1.45824 12.3752 1.45825 10.5491V10.4537C1.45824 8.62757 1.45823 7.19321 1.60875 6.07335C1.76299 4.92577 2.08552 4.01527 2.80068 3.29988C3.51585 2.58449 4.42606 2.26186 5.57327 2.10757C6.69278 1.95701 8.1267 1.95702 9.95227 1.95703H10.0476C11.8731 1.95702 13.3071 1.95701 14.4266 2.10757C15.5738 2.26186 16.484 2.58449 17.1992 3.29988C17.9143 4.01527 18.2368 4.92577 18.3911 6.07335C18.5416 7.19321 18.5416 8.62758 18.5416 10.4537V10.5491C18.5416 12.3752 18.5416 13.8096 18.3911 14.9294C18.2368 16.077 17.9143 16.9875 17.1992 17.7029C16.484 18.4183 15.5738 18.7409 14.4266 18.8952C13.7118 18.9913 12.8689 19.0261 11.8777 19.0386C11.4855 19.0436 11.2894 19.0461 11.1655 18.9237C11.0416 18.8013 11.0416 18.6037 11.0416 18.2085V13.2106L12.4999 13.2106C13.0752 13.2106 13.5416 12.7441 13.5416 12.1686C13.5416 11.5931 13.0752 11.1266 12.4999 11.1266L11.0416 11.1266V10.5014C11.0416 9.68601 11.0438 9.1793 11.0933 8.81087C11.138 8.47834 11.204 8.41266 11.2236 8.39312C11.3108 8.30546 11.3108 8.30546 11.6433 8.26075C12.0116 8.21122 12.5181 8.20901 13.3333 8.20901H14.1666C14.7419 8.20901 15.2083 7.74249 15.2083 7.16701C15.2083 6.59153 14.7419 6.12502 14.1666 6.12502L13.268 6.12501Z" fill="white"></path></svg><span className="font-manrope text-[#A5A5A5] text-sm font-semibold whitespace-nowrap hidden md:block">Facebook</span></a>
      </div>
    </footer>
  )
}

export default App
