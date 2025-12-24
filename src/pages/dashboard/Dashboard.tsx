import { useEffect, useState } from 'react'
import { getSessionUser, getSupabase } from '../../lib/supabase'
import RewardsHub from './RewardsHub'

type Props = {
  section?: string
}

export default function Dashboard({ section = 'rewards' }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const isActive = (key: string) => (section === key ? 'bg-[rgba(144,_19,_254,_0.12)] text-[#9013FE]' : 'text-[#1f2937] hover:bg-[rgba(144,_19,_254,_0.08)] hover:text-[#9013FE]')

  const nav = [
    { key: 'home', label: 'Home', icon: (
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="house" className="h-5 w-5" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 .7 160.2c0 2.7-.2 5.4-.5 8.1l0 16.2c0 22.1-17.9 40-40 40l-16 0c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1L416 512l-24 0c-22.1 0-40-17.9-40-40l0-24 0-64c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"></path></svg>
    ) },
    { key: 'discover', label: 'Discover', icon: (
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="compass" className="h-5 w-5" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"></path></svg>
    ) },
    { key: 'library', label: 'Library', icon: (
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="box-open" className="h-5 w-5" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M58.9 42.1c3-6.1 9.6-9.6 16.3-8.7L320 64 564.8 33.4c6.7-.8 13.3 2.7 16.3 8.7l41.7 83.4c9 17.9-.6 39.6-19.8 45.1L439.6 217.3c-13.9 4-28.8-1.9-36.2-14.3L320 64 236.6 203c-7.4 12.4-22.3 18.3-36.2 14.3L37.1 170.6c-19.3-5.5-28.8-27.2-19.8-45.1L58.9 42.1zM321.1 128l54.9 91.4c14.9 24.8 44.6 36.6 72.5 28.6L576 211.6l0 167c0 22-15 41.2-36.4 46.6l-204.1 51c-10.2 2.6-20.9 2.6-31 0l-204.1-51C79 419.7 64 400.5 64 378.5l0-167L191.6 248c27.8 8 57.6-3.8 72.5-28.6L318.9 128l2.2 0z"></path></svg>
    ) },
    { key: 'tech-stack', label: 'Tech Stack', icon: (
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="layer-group" className="h-5 w-5" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M264.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 149.8C37.4 145.8 32 137.3 32 128s5.4-17.9 13.9-21.8L264.5 5.2zM476.9 209.6l53.2 24.6c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 277.8C37.4 273.8 32 265.3 32 256s5.4-17.9 13.9-21.8l53.2-24.6 152 70.2c23.4 10.8 50.4 10.8 73.8 0l152-70.2zm-152 198.2l152-70.2 53.2 24.6c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 405.8C37.4 401.8 32 393.3 32 384s5.4-17.9 13.9-21.8l53.2-24.6 152 70.2c23.4 10.8 50.4 10.8 73.8 0z"></path></svg>
    ) },
    { key: 'subscriptions', label: 'Subscriptions', icon: (
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="credit-card" className="h-5 w-5" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M64 32C28.7 32 0 60.7 0 96l0 32 576 0 0-32c0-35.3-28.7-64-64-64L64 32zM576 224L0 224 0 416c0 35.3 28.7 64 64 64l448 0c35.3 0 64-28.7 64-64l0-192zM112 352l64 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-64 0c-8.8 0-16-7.2-16-16s7.2-16 16-16zm112 16c0-8.8 7.2-16 16-16l128 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-128 0c-8.8 0-16-7.2-16-16z"></path></svg>
    ) },
    { key: 'rewards', label: 'Rewards Hub', icon: (
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="gem" className="h-5 w-5" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M116.7 33.8c4.5-6.1 11.7-9.8 19.3-9.8l240 0c7.6 0 14.8 3.6 19.3 9.8l112 152c6.8 9.2 6.1 21.9-1.5 30.4l-232 256c-4.5 5-11 7.9-17.8 7.9s-13.2-2.9-17.8-7.9l-232-256c-7.7-8.5-8.3-21.2-1.5-30.4l112-152zm38.5 39.8c-3.3 2.5-4.2 7-2.1 10.5l57.4 95.6L63.3 192c-4.1 .3-7.3 3.8-7.3 8s3.2 7.6 7.3 8l192 16c.4 0 .9 0 1.3 0l192-16c4.1-.3 7.3-3.8 7.3-8s-3.2-7.6-7.3-8L301.5 179.8l57.4-95.6c2.1-3.5 1.2-8.1-2.1-10.5s-7.9-2-10.7 1L256 172.2 165.9 74.6c-2.8-3-7.4-3.4-10.7-1z"></path></svg>
    ) },
    { key: 'settings', label: 'Settings', icon: (
      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="user-gear" className="h-5 w-5" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M224 0a128 128 0 1 1 0 256A128 128 0 1 1 224 0zM178.3 304l91.4 0c11.8 0 23.4 1.2 34.5 3.3c-2.1 18.5 7.4 35.6 21.8 44.8c-16.6 10.6-26.7 31.6-20 53.3c4 12.9 9.4 25.5 16.4 37.6s15.2 23.1 24.4 33c15.7 16.9 39.6 18.4 57.2 8.7l0 .9c0 9.2 2.7 18.5 7.9 26.3L29.7 512C13.3 512 0 498.7 0 482.3C0 383.8 79.8 304 178.3 304zM436 218.2c0-7 4.5-13.3 11.3-14.8c10.5-2.4 21.5-3.7 32.7-3.7s22.2 1.3 32.7 3.7c6.8 1.5 11.3 7.8 11.3 14.8l0 30.6c7.9 3.4 15.4 7.7 22.3 12.8l24.9-14.3c6.1-3.5 13.7-2.7 18.5 2.4c7.6 8.1 14.3 17.2 20.1 27.2s10.3 20.4 13.5 31c2.1 6.7-1.1 13.7-7.2 17.2l-25 14.4c.4 4 .7 8.1 .7 12.3s-.2 8.2-.7 12.3l25 14.4c6.1 3.5 9.2 10.5 7.2 17.2c-3.3 10.6-7.8 21-13.5 31s-12.5 19.1-20.1 27.2c-4.8 5.1-12.5 5.9-18.5 2.4l-24.9-14.3c-6.9 5.1-14.3 9.4-22.3 12.8l0 30.6c0 7-4.5 13.3-11.3 14.8c-10.5 2.4-21.5 3.7-32.7 3.7s-22.2-1.3-32.7-3.7c-6.8 1.5-11.3 7.8-11.3 14.8l0-30.5c-8-3.4-15.6-7.7-22.5-12.9l-24.7 14.3c-6.1 3.5-13.7 2.7-18.5-2.4c-7.6-8.1-14.3-17.2-20.1-27.2s-10.3-20.4-13.5-31c-2.1-6.7 1.1-13.7 7.2-17.2l24.8-14.3c-.4-4.1-.7-8.2-.7-12.4s.2-8.3 .7-12.4L343.8 325c-6.1-3.5-9.2-10.5-7.2-17.2c3.3-10.6 7.7-21 13.5-31s12.5-19.1 20.1-27.2c4.8-5.1 12.4-5.9 18.5-2.4l24.8 14.3c6.9-5.1 14.5-9.4 22.5-12.9l0-30.5zm92.1 133.5a48.1 48.1 0 1 0 -96.1 0 48.1 48.1 0 1 0 96.1 0z"></path></svg>
    ) },
  ]

  const renderMain = () => {
    if (section === 'rewards') return <RewardsHub onOpenSidebar={() => setMobileOpen(true)} />
    return (
      <div className="w-full bg-gray-50 px-[1rem] lg:px-[2rem] lg:pt-[2rem] min-h-screen flex-grow md:overflow-y-auto box-border lg:min-h-0">
        <div className="p-8 text-center text-gray-600">This section is coming soon.</div>
      </div>
    )
  }

  useEffect(() => {
    getSessionUser().then(u => {
      const email = u?.email || ''
      setUserEmail(email)
      setUserName(email ? email.split('@')[0] : '')
    })
  }, [])

  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] lg:h-screen lg:md:overflow-hidden w-full">
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setMobileOpen(false)}></div>
          <aside className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-50 md:hidden flex flex-col">
            <div className="p-3 border-b">
              <div className="h-[40px] w-[100px] rounded-md bg-[#E9D4FF] text-[#9013FE] font-bold text-sm flex items-center justify-center">Flowva</div>
            </div>
          <nav className="flex-grow px-3 py-2">
            <ul>
              {nav.map(item => (
                <li key={item.key} className={`flex items-center gap-2 px-3 py-2 mb-[7px] rounded-[8px] cursor-pointer duration-200 transition-all text-sm ${isActive(item.key)}`} onClick={() => { history.pushState({}, '', `/dashboard/${item.key}`); setMobileOpen(false) }}>
                  {item.icon}
                  <span className="tracking-wide truncate">{item.label}</span>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto py-3 relative flex justify-center">
            <div className="absolute top-0 left-4 right-4 border-t border-[#64748B]"></div>
            <div className="w-full flex items-center justify-between px-4 relative">
              <button className="flex items-center border-none" onClick={() => setUserMenuOpen((v)=>!v)}>
                <div className="w-[36px] h-[36px] relative overflow-hidden rounded-full font-semibold mr-[0.6rem] flex items-center justify-center text-[#9013FE] bg-[#E9D4FF]">{(userName || userEmail || 'F')[0]?.toUpperCase()}</div>
                <div className="text-start">
                  <span className="text-[0.9rem] font-semibold">{userName || 'User'}</span>
                  <p className="text-[0.8rem] text-[#718096] truncate overflow-x-hidden max-w-[153px]">{userEmail || '—'}</p>
                </div>
              </button>
              {userMenuOpen && (
                <div className="absolute bottom-[60px] right-4 z-50 bg-white border border-[#00000014] rounded-md shadow-md p-2 min-w-[150px]">
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-[#F5F3FF]" onClick={async()=>{ await getSupabase().auth.signOut(); setUserMenuOpen(false); setMobileOpen(false); history.pushState({}, '', '/login'); window.dispatchEvent(new PopStateEvent('popstate')); }}>Log out</button>
                </div>
              )}
            </div>
          </div>
        </aside>
        </>
      )}
      <aside className="hidden md:flex md:w-64 overflow-x-hidden flex-col h-screen shadow-md border-r border-black/10 text-black font-sans">
        <div className="flex flex-col h-full">
          <div className="p-2 px-6 my-1 flex justify-start">
            <div className="h-[48px] w-[110px] rounded-md bg-[#E9D4FF] text-[#9013FE] font-bold text-sm flex items-center justify-center">Flowva</div>
          </div>
          <nav className="flex-grow px-3">
            <ul>
              {nav.map(item => (
                <li key={item.key} className={`flex items-center gap-3 px-4 py-2.5 mb-[10px] rounded-[10px] cursor-pointer duration-200 transition-all text-[0.95rem] ${isActive(item.key)}`} onClick={() => history.pushState({}, '', `/dashboard/${item.key}`)}>
                  {item.icon}
                  <span className="tracking-wide truncate">{item.label}</span>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto py-3 relative flex justify-center">
            <div className="absolute top-0 left-4 right-4 border-t border-[#64748B]"></div>
            <div className="w-full flex items-center justify-between px-4">
              <button className="flex items-center border-none" onClick={() => setUserMenuOpen((v)=>!v)}>
                <div className="w-[40px] h-[40px] relative overflow-hidden rounded-full font-semibold mr-[0.75rem] flex items-center justify-center text-[#9013FE] bg-[#E9D4FF]">{(userName || userEmail || 'F')[0]?.toUpperCase()}</div>
                <div className="text-start">
                  <span className="text-[0.9rem] font-semibold">{userName || 'User'}</span>
                  <p className="text-[0.8rem] text-[#718096] truncate overflow-x-hidden max-w-[153px]">{userEmail || '—'}</p>
                </div>
              </button>
              {userMenuOpen && (
                <div className="absolute bottom-[60px] right-4 z-50 bg-white border border-[#00000014] rounded-md shadow-md p-2 min-w-[150px]">
                  <button className="w-full text-left px-3 py-2 rounded hover:bg-[#F5F3FF]" onClick={async()=>{ await getSupabase().auth.signOut(); setUserMenuOpen(false); history.pushState({}, '', '/login'); window.dispatchEvent(new PopStateEvent('popstate')); }}>Log out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
      <main className="w-full">{renderMain()}</main>
    </div>
  )
}