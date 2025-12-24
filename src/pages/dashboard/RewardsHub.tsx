import { FileStack, Gift, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner'
import { getSupabase, getSessionUser, getProfile, redeemReward } from '../../lib/supabase'

export default function RewardsHub({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const [tab, setTab] = useState<'earn' | 'redeem'>('earn')
  const [redeemTab, setRedeemTab] = useState<'all' | 'unlocked' | 'locked' | 'coming'>('all')
  const [userId, setUserId] = useState<string | null>(null)
  const [points, setPoints] = useState<number>(0)
  const [referralCode, setReferralCode] = useState<string>('')
  const [rewards, setRewards] = useState<Array<{id:string,title:string,description:string,points_required:number,active:boolean}>>([])
  const [claimMsg, setClaimMsg] = useState('')
  const [hasClaimed, setHasClaimed] = useState(false)
  const [todayIdx, _setTodayIdx] = useState<number>((() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1 })())
  const [streakDays, setStreakDays] = useState(0)
  const [claiming, setClaiming] = useState(false)
  const [loadingPage, setLoadingPage] = useState(true)
  const [loadingRewards, setLoadingRewards] = useState(true)
  const [copied, setCopied] = useState(false)
  const [referralCount, setReferralCount] = useState(0)
  const [referralPoints, setReferralPoints] = useState(0)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [claimEmail, setClaimEmail] = useState('')
  const [claimScreenshotUrl, setClaimScreenshotUrl] = useState('')
  const [submittingClaim, setSubmittingClaim] = useState(false)
  const [showDailySuccess, setShowDailySuccess] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const staticRewards: Array<{id:string,title:string,description:string,points_required:number,active:boolean}> = [
    { id:'r1', title:'$5 Bank Transfer', description:'The $5 equivalent will be transferred to your bank account.', points_required:5000, active:true },
    { id:'r2', title:'$5 PayPal International', description:'Receive a $5 PayPal balance transfer directly to your PayPal account email.', points_required:5000, active:true },
    { id:'r3', title:'$5 Virtual Visa Card', description:'Use your $5 prepaid card to shop anywhere Visa is accepted online.', points_required:5000, active:true },
    { id:'r4', title:'$5 Apple Gift Card', description:'Redeem this $5 Apple Gift Card for apps, games, music, movies, and more on the App Store and iTunes.', points_required:5000, active:true },
    { id:'r5', title:'$5 Google Play Card', description:'Use this $5 Google Play Gift Card to purchase apps, games, movies, books, and more on the Google Play Store.', points_required:5000, active:true },
    { id:'r6', title:'$5 Amazon Gift Card', description:'Get a $5 digital gift card to spend on your favorite tools or platforms.', points_required:5000, active:true },
    { id:'r7', title:'$10 Amazon Gift Card', description:'Get a $10 digital gift card to spend on your favorite tools or platforms.', points_required:10000, active:true },
    { id:'r8', title:'Free Udemy Course', description:'Coming Soon!', points_required:0, active:false },
  ]

  const refresh = async () => {
    setLoadingPage(true)
    setLoadingRewards(true)
    const started = Date.now()
    const user = await getSessionUser()
    setUserId(user?.id ?? null)
    if (user?.id) {
      const { data } = await getProfile(user.id)
      if (data) {
        setReferralCode(data.referral_code ?? '')
      }
    }
    setRewards(staticRewards)
    await Promise.all([checkClaimed(), fetchPointsDirect(), fetchStreak()])
    await fetchReferralStats()
    const elapsed = Date.now() - started
    if (elapsed < 500) await new Promise((r) => setTimeout(r, 500 - elapsed))
    setLoadingRewards(false)
    setLoadingPage(false)
  }

  const checkClaimed = async () => {
    const client = getSupabase()
    const { data: auth } = await client.auth.getUser()
    const u = auth?.user
    if (!u) return
    const start = new Date(); start.setHours(0,0,0,0)
    const today = start.toISOString()
    const { data } = await client
      .from('points_transactions')
      .select('id')
      .eq('user_id', u.id)
      .eq('type', 'daily_login')
      .gte('created_at', today)
    if (data && data.length > 0) setHasClaimed(true)
  }

  const fetchPointsDirect = async () => {
    const client = getSupabase()
    const { data: auth } = await client.auth.getUser()
    const u = auth?.user
    if (!u) return
    const { data: txs } = await client
      .from('points_transactions')
      .select('points, status')
      .eq('user_id', u.id)
    const total = (txs ?? [])
      .filter((t: any) => (t?.status ?? 'approved') === 'approved')
      .reduce((sum: number, t: any) => sum + (t?.points ?? 0), 0)
    setPoints(total)
  }

  const fetchStreak = async () => {
    const client = getSupabase()
    const { data: auth } = await client.auth.getUser()
    const u = auth?.user
    if (!u) return
    const { data } = await client
      .from('points_transactions')
      .select('created_at')
      .eq('user_id', u.id)
      .eq('type', 'daily_login')
      .order('created_at', { ascending: false })
    const format = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const da = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${da}`
    }
    const dates = Array.from(new Set((data ?? []).map((r: any) => (r.created_at as string).slice(0, 10))))
    let count = 0
    let cur = new Date()
    while (dates.includes(format(cur))) {
      count += 1
      cur.setDate(cur.getDate() - 1)
    }
    setStreakDays(count)
  }

  const fetchReferralStats = async () => {
    const client = getSupabase()
    const { data: auth } = await client.auth.getUser()
    const u = auth?.user
    if (!u) return
    const { count: rCount } = await client
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_id', u.id)
    setReferralCount(rCount ?? 0)
    const { data: ptsRows } = await client
      .from('points_transactions')
      .select('points')
      .eq('user_id', u.id)
      .eq('type', 'referral')
      .eq('status', 'approved')
    const total = (ptsRows ?? []).reduce((sum: number, row: any) => sum + (row?.points ?? 0), 0)
    setReferralPoints(total)
  }

  const claimDailyPointsLocal = async () => {
    if (hasClaimed || claiming) { setClaimMsg('Claimed today'); return }
    setClaiming(true)
    const client = getSupabase()
    const { data: auth } = await client.auth.getUser()
    const u = auth?.user
    if (!u) return
    const start = new Date(); start.setHours(0,0,0,0)
    const today = start.toISOString()
    const { data: existing } = await client
      .from('points_transactions')
      .select('id')
      .eq('user_id', u.id)
      .eq('type', 'daily_login')
      .gte('created_at', today)
    if (existing && existing.length > 0) { setHasClaimed(true); setClaimMsg('Already claimed today'); setClaiming(false); return }
    const { error } = await client
      .from('points_transactions')
      .insert({ user_id: u.id, type: 'daily_login', points: 5, status: 'approved' } as any)
    if (error) { setClaimMsg(error.message); return }
    await fetchPointsDirect()
    setHasClaimed(true)
    setClaimMsg('Claimed +5 points')
    setStreakDays((s) => s + 1)
    setClaiming(false)
    setShowDailySuccess(true)
  }

  useEffect(() => { refresh() }, [])

  return (
    <div className="w-full bg-gray-50 px-[1rem] lg:px-[2rem] lg:pt-[2rem] min-h-screen flex-grow md:overflow-y-auto box-border lg:min-h-0">
      <div className="relative bg-gray-50">
        <Toaster richColors position="top-center" />
        <div className="md:sticky md:top-0 md:z-10 bg-gray-50 pb-2 flex py-2 pt-3 lg:pt-0 lg:py-0">
          <div className="bg-gray-50 flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <button className="lg:hidden" onClick={onOpenSidebar}>
                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none" width="28">
                  <path fill="#000000" fillRule="evenodd" d="M19 4a1 1 0 01-1 1H2a1 1 0 010-2h16a1 1 0 011 1zm0 6a1 1 0 01-1 1H2a1 1 0 110-2h16a1 1 0 011 1zm-1 7a1 1 0 100-2H2a1 1 0 100 2h16z"></path>
                </svg>
              </button>
              <h1 className="text-xl md:text-[1.5rem] font-medium">Rewards Hub</h1>
            </div>
            <div className="mt-2">
              <div className="notification-container group">
                <button className="notification-bell has-unread" aria-label="Notifications (1 unread)">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bell" className="svg-inline--fa fa-bell text-[#2D3748] group-hover:text-[#9013fe]" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path fill="currentColor" d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"></path>
                  </svg>
                  <span className="notification-badge">1</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-gray-600">Earn points, unlock rewards, and celebrate your progress!</p>
          <div className="lg:h-[calc(100vh-110px)] [scrollbar-width:none] [-ms-overflow-style:none] overflow-x-hidden">
            <div className="ant-tabs ant-tabs-top css-1d4w9r2" style={{ marginTop: 20 }}>
              <div role="tablist" aria-orientation="horizontal" className="ant-tabs-nav">
                <div className="ant-tabs-nav-wrap">
                  <div className="ant-tabs-nav-list">
                    <button
                      className={`ant-tabs-tab px-3 ${tab === 'earn' ? 'py-2.5 border-b-2 border-[#9301fe] ant-tabs-tab-active text-[#9013fe] font-semibold bg-[#9031fe]/10' : 'py-2 text-[#2D3748] hover:text-[#9013fe]'} rounded-none text-sm`}
                      onClick={() => setTab('earn')}
                    >
                      <div role="tab" aria-selected={tab === 'earn'} className="ant-tabs-tab-btn">Earn Points</div>
                    </button>
                    <button
                      className={`ant-tabs-tab px-3 ${tab === 'redeem' ? 'py-2.5 border-b-2 border-[#9301fe] ant-tabs-tab-active text-[#9013fe] font-semibold bg-[#9031fe]/10' : 'py-2 text-[#2D3748] hover:text-[#9013fe]'} rounded-none text-sm`}
                      onClick={() => setTab('redeem')}
                    >
                      <div role="tab" aria-selected={tab === 'redeem'} className="ant-tabs-tab-btn">Redeem Rewards</div>
                    </button>
                    <div className="ant-tabs-ink-bar ant-tabs-ink-bar-animated transition-all duration-300 ease-out" style={{ width: tab === 'earn' ? 102 : 140, left: tab === 'earn' ? 51 : 170, transform: 'translateX(-50%)' }}></div>
                  </div>
                </div>
              </div>

              <div className="ant-tabs-content-holder">
                {tab === 'earn' ? (
                  <div className="ant-tabs-content ant-tabs-content-top animate-fadeInUp duration-500 ease-out">
                    <div role="tabpanel" className="ant-tabs-tabpane ant-tabs-tabpane-active">
                      <div>
                        <div>
                          <h2 className="text-lg md:text-2xl my-3 text-black border border-l-[4px] border-t-0 border-b-0 border-r-0 border-[#9301fe] pl-[0.75rem] font-semibold">Your Rewards Journey</h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="shadow-[0_5px_15px_rgba(0,_0,_0,_0.05)] transition-all rounded-[16px] hover:translate-y-[-5px] hover:shadow-[0_10px_25px_rgba(0,_0,_0,_0.1)] border border-[#f3f4f6] overflow-hidden duration-200">
                              <div className="p-[1rem] relative border border-b-[#f3f4f6] bg-[#eef2ff] border-t-0 border-r-0 border-l-0">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="award" className="svg-inline--fa fa-award h-5 w-5 text-[#9013fe]" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                    <path fill="currentColor" d="M173.8 5.5c11-7.3 25.4-7.3 36.4 0L228 17.2c6 3.9 13 5.8 20.1 5.4l21.3-1.3c13.2-.8 25.6 6.4 31.5 18.2l9.6 19.1c3.2 6.4 8.4 11.5 14.7 14.7L344.5 83c11.8 5.9 19 18.3 18.2 31.5l-1.3 21.3c-.4 7.1 1.5 14.2 5.4 20.1l11.8 17.8c7.3 11 7.3 25.4 0 36.4L366.8 228c-3.9 6-5.8 13-5.4 20.1l1.3 21.3c.8 13.2-6.4 25.6-18.2 31.5l-19.1 9.6c-6.4 3.2-11.5 8.4-14.7 14.7L301 344.5c-5.9 11.8-18.3 19-31.5 18.2l-21.3-1.3c-7.1-.4-14.2 1.5-20.1 5.4l-17.8 11.8c-11 7.3-25.4 7.3-36.4 0L156 366.8c-6-3.9-13-5.8-20.1-5.4l-21.3 1.3c-13.2 .8-25.6-6.4-31.5-18.2l-9.6-19.1c-3.2-6.4-8.4-11.5-14.7-14.7L39.5 301c-11.8-5.9-19-18.3-18.2-31.5l1.3-21.3c.4-7.1-1.5-14.2-5.4-20.1L5.5 210.2c-7.3-11-7.3-25.4 0-36.4L17.2 156c3.9-6 5.8-13 5.4-20.1l-1.3-21.3c-.8-13.2 6.4-25.6 18.2-31.5l19.1-9.6C65 70.2 70.2 65 73.4 58.6L83 39.5c5.9-11.8 18.3-19 31.5-18.2l21.3 1.3c7.1 .4 14.2-1.5 20.1-5.4L173.8 5.5zM272 192a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM1.3 441.8L44.4 339.3c.2 .1 .3 .2 .4 .4l9.6 19.1c11.7 23.2 36 37.3 62 35.8l21.3-1.3c.2 0 .5 0 .7 .2l17.8 11.8c5.1 3.3 10.5 5.9 16.1 7.7l-37.6 89.3c-2.3 5.5-7.4 9.2-13.3 9.7s-11.6-2.2-14.8-7.2L74.4 455.5l-56.1 8.3c-5.7 .8-11.4-1.5-15-6s-4.3-10.7-2.1-16z"></path>
                                  </svg>
                                  Points Balance
                                </h3>
                              </div>
                              <div className="p-[1rem]">
                                <div className="flex justify-between items-center">
                                  {loadingPage ? (
                                    <div className="w-full flex items-center justify-between">
                                      <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
                                      <div className="h-[100px] w-[100px] bg-gray-200 rounded-full animate-pulse" />
                                    </div>
                                  ) : (
                                    <>
                                      <div className="font-extrabold text-[36px] text-[#9013fe] m-[10px_0]">{points}</div>
                                      <div className="lf-player-container">
                                    <div style={{ height: 100, width: 100 }}>
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" width="480" height="480" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
                                        <defs>
                                          <clipPath id="clip0"><rect width="480" height="480" x="0" y="0"></rect></clipPath>
                                          <linearGradient id="lg1" x1="-50.07" y1="-91.039" x2="70.082" y2="67.803" gradientUnits="userSpaceOnUse">
                                            <stop offset="0%" stopColor="rgb(255,234,0)"></stop>
                                            <stop offset="50%" stopColor="rgb(255,199,0)"></stop>
                                            <stop offset="100%" stopColor="rgb(255,165,0)"></stop>
                                          </linearGradient>
                                          <linearGradient id="lg2" x1="-36.176" y1="-68.439" x2="52.76" y2="47.957" gradientUnits="userSpaceOnUse">
                                            <stop offset="0%" stopColor="rgb(255,233,0)"></stop>
                                            <stop offset="50%" stopColor="rgb(255,199,0)"></stop>
                                            <stop offset="100%" stopColor="rgb(255,166,0)"></stop>
                                          </linearGradient>
                                          <linearGradient id="lg3" x1="4" y1="-55" x2="4" y2="35.523" gradientUnits="userSpaceOnUse">
                                            <stop offset="0%" stopColor="rgb(255,173,0)"></stop>
                                            <stop offset="50%" stopColor="rgb(255,143,0)"></stop>
                                            <stop offset="100%" stopColor="rgb(255,113,0)"></stop>
                                          </linearGradient>
                                        </defs>
                                        <g clipPath="url(#clip0)">
                                          <g transform="matrix(1,0,0,1,237,247)">
                                            <path fill="rgb(255,159,0)" d="M2.875,93C-1.5,93 2.875,93 2.875,93 2.875,93 2.875,53 2.875,-7.051 2.875,-67 2.875,-107 2.875,-107 2.875,-107 -1.25,-107 2.875,-107 60,-107 102.75,-58.25 102.75,-7.25 102.75,45.5 59.5,93 2.875,93z"></path>
                                            <path fill="url(#lg1)" d="M103,-7C103,48.228 58.228,93 3,93 -52.228,93 -97,48.228 -97,-7 -97,-62.229 -52.228,-107 3,-107 58.228,-107 103,-62.229 103,-7z"></path>
                                            <path fill="rgb(255,187,0)" d="M83,-7C83,37.183 47.183,73 3,73 -41.183,73 -77,37.183 -77,-7 -77,-51.183 -41.183,-87 3,-87 47.183,-87 83,-51.183 83,-7z"></path>
                                            <path fill="url(#lg2)" d="M75.5,-7C75.5,33.041 43.041,65.5 3,65.5 -37.041,65.5 -69.5,33.041 -69.5,-7 -69.5,-47.041 -37.041,-79.5 3,-79.5 43.041,-79.5 75.5,-47.041 75.5,-7z"></path>
                                            <path fill="url(#lg3)" d="M6.631,-53.02C6.631,-53.02 18.62,-28.727 18.62,-28.727 19.393,-27.16 20.888,-26.073 22.618,-25.822 22.618,-25.822 49.428,-21.926 49.428,-21.926 51.606,-21.61 52.475,-18.934 50.899,-17.398 50.899,-17.398 31.5,1.512 31.5,1.512 30.249,2.732 29.678,4.489 29.973,6.212 29.973,6.212 34.552,32.913 34.552,32.913 34.924,35.082 32.648,36.736 30.7,35.712 30.7,35.712 6.721,23.105 6.721,23.105 5.174,22.292 3.326,22.292 1.779,23.105 1.779,23.105 -22.2,35.712 -22.2,35.712 -24.148,36.736 -26.424,35.082 -26.052,32.913 -26.052,32.913 -21.473,6.212 -21.473,6.212 -21.178,4.489 -21.749,2.732 -23,1.512 -23,1.512 -42.399,-17.398 -42.399,-17.398 -43.975,-18.934 -43.106,-21.61 -40.928,-21.926 -40.928,-21.926 -14.118,-25.822 -14.118,-25.822 -12.388,-26.073 -10.893,-27.16 -10.12,-28.727 -10.12,-28.727 1.869,-53.02 1.869,-53.02 2.843,-54.993 5.657,-54.993 6.631,-53.02z"></path>
                                          </g>
                                        </g>
                                      </svg>
                                    </div>
                                  </div>
                                    </>
                                  )}
                                </div>
                                <div className="mt-4">
                                  {loadingPage ? (
                                    <>
                                      <div className="flex justify-between text-sm mb-1">
                                        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                      </div>
                                      <div className="h-[8px] bg-[#e5e7eb] rounded-[9999px] overflow-hidden">
                                        <div className="h-full bg-gray-200 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                                      </div>
                                      <div className="h-3 w-52 bg-gray-200 rounded animate-pulse mt-2" />
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Progress to <span className="font-medium">$5 Gift Card</span></span>
                                        <span className="font-medium">{points}/5000</span>
                                      </div>
                                      <div className="h-[8px] bg-[#e5e7eb] rounded-[9999px] overflow-hidden">
                                        <div className="h-full bg-gradient-to-br from-[#9013fe] to-[#FF9FF5] rounded-full transition-[width] duration-500 ease-in-out" style={{ width: `${Math.min(100, (points/5000)*100)}%` }}></div>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-2">🚀 Just getting started — keep earning points!</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="shadow-[0_5px_15px_rgba(0,_0,_0,_0.05)] rounded-[16px] hover:translate-y-[-5px] hover:shadow-[0_10px_25px_rgba(0,_0,_0,_0.1)] border border-[#f3f4f6] overflow-hidden transition-shadow duration-200">
                              <div className="p-[1rem] relative border border-b-[#f3f4f6] bg-[#eef2ff] border-t-0 border-r-0 border-l-0">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                                  <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="calendar" className="svg-inline--fa fa-calendar text-[#70D6FF] h-5 w-5" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                    <path fill="currentColor" d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40L64 64C28.7 64 0 92.7 0 128l0 16 0 48L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-256 0-48 0-16c0-35.3-28.7-64-64-64l-40 0 0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40L152 64l0-40zM48 192l352 0 0 256c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256z"></path>
                                  </svg>
                                  Daily Streak
                                </h3>
                              </div>
                              <div className="p-4">
                                {loadingPage ? (
                                  <>
                                    <div className="h-9 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                                    <div className="flex mt-4 space-x-2 justify-center">
                                      {Array.from({length:7}).map((_,i)=> (
                                        <div key={i} className={`h-10 w-10 rounded-full bg-gray-200 animate-pulse`}></div>
                                      ))}
                                    </div>
                                    <div className="h-4 w-52 bg-gray-200 rounded animate-pulse mt-3 mx-auto" />
                                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse mt-3" />
                                  </>
                                ) : (
                                  <>
                                    <div className="font-extrabold text-[36px] text-[#9013fe] mb-2">{streakDays} day</div>
                                    <div className="flex mt-4 space-x-2 justify-center">
                                      {['M','T','W','T','F','S','S'].map((d,i)=> (
                                        <div key={d+i} className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${i===todayIdx ? 'bg-gray-200 text-gray-500 ring-2 ring-[#9013fe] ring-offset-2' : 'bg-gray-200 text-gray-500'}`}>{d}</div>
                                      ))}
                                    </div>
                                    <p className="text-[0.875rem] text-gray-600 text-center mt-3">Check in daily to to earn +5 points</p>
                                <button onClick={claimDailyPointsLocal} disabled={hasClaimed || claiming} className={`mt-3 w-full py-3 px-6 rounded-full font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${(hasClaimed || claiming) ? 'bg-gray-400 text-white' : 'bg-[#9013fe] text-white hover:shadow-[0_4px_12px_rgba(144,_19,_254,_0.2)] hover:translate-y-[-2px]'}`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap h-5 w-5"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
                                  {hasClaimed ? 'Claimed today' : (claiming ? 'Claiming...' : 'Claim 5 points')}
                                </button>
                                {claimMsg && <p className="text-center text-sm mt-2 text-[#9013fe]">{claimMsg}</p>}
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="hover:translate-y-[-3px] hover:shadow-[0_8px_20px_rgba(0,_0,_0,_0.1)] bg-white rounded-[16px] shadow-[0_5px_15px_rgba(0,0,0,0.05)] overflow-hidden border border-[#f3f4f6] transition-all duration-300 ease-in-out">
                              <div className="p-4 pt-10 bg-[linear-gradient(135deg,_#9013FE_0%,_#70D6FF_100%)] text-white relative overflow-hidden">
                                <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">Featured</span>
                                <div className="flex items-center justify-between">
                                  <h3 className="text-[1.25rem] font-bold relative z-[2]">Top Tool Spotlight</h3>
                                  <div className="overflow-hidden relative rounded-full size-10 md:size-16">
                                    <img alt="tool" src="https://api.flowvahub.com/storage/v1/object/public/icons//reclaim%20(1).png" />
                                  </div>
                                </div>
                                <p className="text-lg"><strong> Reclaim</strong></p>
                              </div>
                              <div className="p-[1rem]">
                                <div className="flex justify-start mb-[1rem]">
                                  <div className="w-[24px] h-[24px] animate-pulse bg-[#eef2ff] rounded-[6px] flex items-center justify-center mr-[1rem] flex-shrink-0 text-[#9013fe]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="mb-[0.25rem] font-semibold">Automate and Optimize Your Schedule</h4>
                                    <p className="text-[0.875rem] text-gray-600">Reclaim.ai is an AI-powered calendar assistant that automatically schedules your tasks, meetings, and breaks to boost productivity. Free to try — earn Flowva Points when you sign up!</p>
                                  </div>
                                </div>
                              </div>
                              <div className="px-[1rem] py-[5px] flex justify-between items-center border border-t-[#f3f4f6] border-b-0 border-r-0 border-l-0">
                                <a href="https://reclaim.ai/?utm_campaign=partnerstack&utm_term=ps_16ee8d9da128&pscd=go.reclaim.ai&ps_partner_key=MTZlZThkOWRhMTI4&ps_xid=gwtUfnjenYrHZS&gsxid=gwtUfnjenYrHZS&gspk=MTZlZThkOWRhMTI4" target="_blank" rel="noopener noreferrer" className="bg-[#9013fe] hover:bg-[#8628da] text-white py-3 px-6 rounded-full font-semibold transition-all duration-200 flex items-center justify-center gap-2 border-0 text-xs">
                                 <UserPlus size={16}/> Sign up
                                </a>
                                <button onClick={()=>setShowClaimModal(true)} className="bg-[linear-gradient(45deg,#9013FE,#FF8687)] text-white py-2 px-4 rounded-full font-semibold text-sm flex gap-1 items-center">
                                  <Gift/> Claim 50 pts
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h2 className="text-lg md:text-2xl my-3 text-black border border-l-[4px] border-t-0 border-b-0 border-r-0 border-[#9301fe] pl-[0.75rem] font-semibold">Earn More Points</h2>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="transition-all hover:border-[#9013fe] hover:translate-y-[-5px] hover:shadow-[0_10px_25px_rgba(0,_0,_0,_0.1)] ease-linear duration-200 border border-[#e5e7eb] rounded-xl overflow-hidden">
                              <div className="p-[1rem] border border-b-[#f3f4f6] border-t-0 border-r-0 border-l-0 bg-white flex items-center gap-[0.75rem]">
                                <div className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center flex-shrink-0 bg-[rgba(228,144,230,0.1)] text-[#9013fe]">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
                                </div>
                                <div>
                                  <h3 className="font-semibold">Refer and win 10,000 points!</h3>
                                </div>
                              </div>
                              <div className="p-[1rem]">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">Invite 3 friends by Nov 20 and earn a chance to be one of 5 winners of <span className="text-[#9013fe]">10,000 points</span>. Friends must complete onboarding to qualify.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="transition-all hover:border-[#9013fe] hover:translate-y-[-5px] hover:shadow-[0_10px_25px_rgba(0,_0,_0,_0.1)] ease-linear duration-200 border border-[#e5e7eb] rounded-xl overflow-hidden">
                              <div className="p-[1rem] border border-b-[#f3f4f6] border-t-0 border-r-0 border-l-0 bg-white flex items-center gap-[0.75rem]">
                                <div className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center flex-shrink-0 bg-[rgba(144,_19,_254,_0.1)] text-[#9013fe]">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line></svg>
                                </div>
                                <div>
                                  <h3 className="font-semibold">Share Your Stack</h3>
                                  <p className="text-xs text-gray-500">Earn +25 pts</p>
                                </div>
                              </div>
                              <div className="p-[1rem]">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">Share your tool stack</p>
                                  </div>
                                  <button onClick={()=>setShowShareModal(true)} className="bg-[#eef2ff] hover:text-white hover:bg-[#9013fe] text-[#9013fe] py-2 px-4 rounded-full font-semibold text-sm transition-all duration-200 inline-flex items-center gap-2 border-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line></svg>
                                    Share
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                        </div>

                        <div className="space-y-6">
                          <h2 className="text-lg md:text-2xl my-3 text-black border border-l-[4px] border-t-0 border-b-0 border-r-0 border-[#9301fe] pl-[0.75rem] font-semibold">Refer &amp; Earn</h2>
                          <div className="shadow-[0_5px_15px_rgba(0,_0,_0,_0.05)] rounded-[16px] hover:translate-y-[-5px] hover:shadow-[0_10px_25px_rgba(0,_0,_0,_0.1)] border border-[#f3f4f6] overflow-hidden transition-shadow duration-200">
                            <div className="p-[1rem] relative border border-b-[#f3f4f6] bg-[#eef2ff] border-t-0 border-r-0 border-l-0">
                              <div className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users h-6 w-6 text-[#9013fe]"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                <div>
                                  <h3 className="text-xl font-semibold text-gray-700">Share Your Link</h3>
                                  <p className="text-gray-500 text-sm">Invite friends and earn 25 points when they join!</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-[1rem]">
                              <div className="space-y-6">
                                <div className="flex justify-between mb-[1rem]">
                                  <div className="text-center p-[0.5rem] flex-1">
                                    <div className="text-[1.5rem] font-semibold text-[#9013fe]">{referralCount}</div>
                                    <div className="text-gray-600">Referrals</div>
                                  </div>
                                  <div className="text-center p-[0.5rem] flex-1">
                                    <div className="text-[1.5rem] font-semibold text-[#9013fe]">{referralPoints}</div>
                                    <div className="text-gray-600">Points Earned</div>
                                  </div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                  <p className="text-sm mb-2 text-gray-700">Your personal referral link:</p>
                                  <div className="relative">
                                    <input type="text" readOnly className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full pr-10" value={referralCode ? `https://flowvatest.vercel.app/signup?ref=${referralCode}` : ''} />
                                    <button type="button" title={copied ? 'Copied!' : 'Copy'} onClick={() => { const link = referralCode ? `https://flowvatest.vercel.app/signup?ref=${referralCode}` : ''; if (!link) return; navigator.clipboard && navigator.clipboard.writeText(link); setCopied(true); toast.success('Referral link copied'); setTimeout(()=>setCopied(false), 1200) }} className="absolute right-[10px] top-1/2 -translate-y-1/2 cursor-pointer z-10">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy text-[#9013fe]"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                                    </button>
                                  </div>
                                </div>
                                <div className="flex justify-center gap-[1rem] mt-[1rem]">
                                  {[
                                    { bg: 'rgb(24, 119, 242)', icon: <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="facebook-f" className="svg-inline--fa fa-facebook-f p-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z"></path></svg> },
                                    { bg: 'black', icon: <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="x-twitter" className="svg-inline--fa fa-x-twitter p-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path></svg> },
                                    { bg: 'rgb(0, 119, 181)', icon: <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="linkedin-in" className="svg-inline--fa fa-linkedin-in p-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"></path></svg> },
                                    { bg: 'rgb(37, 211, 102)', icon: <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="whatsapp" className="svg-inline--fa fa-whatsapp p-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg> },
                                  ].map((b, idx) => (
                                    <button key={idx} className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-white text-[18px] transition-transform duration-200 hover:translate-y-[-3px]" style={{ background: b.bg }}>
                                      {b.icon}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="ant-tabs-content ant-tabs-content-top animate-fadeInUp duration-500 ease-out">
                    <div role="tabpanel" className="ant-tabs-tabpane ant-tabs-tabpane-active">
                      <h2 className="text-lg md:text-2xl my-3 text-black border border-l-[4px] border-t-0 border-b-0 border-r-0 border-[#9301fe] pl-[0.75rem] font-semibold">Redeem Your Points</h2>

                      <div className="ant-tabs ant-tabs-top css-1d4w9r2">
                        <div role="tablist" aria-orientation="horizontal" className="ant-tabs-nav">
                          <div className="ant-tabs-nav-wrap">
                            <div className="ant-tabs-nav-list">
                              <button className={`ant-tabs-tab px-3 ${redeemTab === 'all' ? 'py-2.5 border-b-2 border-[#9301fe] ant-tabs-tab-active text-[#9013fe] font-semibold bg-[#9031fe]/10' : 'py-2 text-[#2D3748] hover:text-[#9013fe]'} rounded-none text-sm`} onClick={() => setRedeemTab('all')}>
                                <div className="flex items-center gap-1">All Rewards<span className="ml-2 text-xs rounded-full h-5 px-2 inline-flex justify-center items-center bg-[#9031fe]/10 text-[#9031fe] font-semibold">{rewards.length}</span></div>
                              </button>
                              <button className={`ant-tabs-tab px-3 ${redeemTab === 'unlocked' ? 'py-2.5 border-b-2 border-[#9301fe] ant-tabs-tab-active text-[#9013fe] font-semibold bg-[#9031fe]/10' : 'py-2 text-[#2D3748] hover:text-[#9013fe]'} rounded-none text-sm`} onClick={() => setRedeemTab('unlocked')}>
                                <div className="flex items-center gap-1">Unlocked<span className="ml-2 text-xs rounded-full h-5 px-2 inline-flex justify-center items-center bg-[#E2E8F0] text-[#CBD5E0]">{rewards.filter(r=>r.active && points >= r.points_required).length}</span></div>
                              </button>
                              <button className={`ant-tabs-tab px-3 ${redeemTab === 'locked' ? 'py-2.5 border-b-2 border-[#9301fe] ant-tabs-tab-active text-[#9013fe] font-semibold bg-[#9031fe]/10' : 'py-2 text-[#2D3748] hover:text-[#9013fe]'} rounded-none text-sm`} onClick={() => setRedeemTab('locked')}>
                                <div className="flex items-center gap-1">Locked<span className="ml-2 text-xs rounded-full h-5 px-2 inline-flex justify-center items-center bg-[#E2E8F0] text-[#CBD5E0]">{rewards.filter(r=>r.active && points < r.points_required).length}</span></div>
                              </button>
                              <button className={`ant-tabs-tab px-3 ${redeemTab === 'coming' ? 'py-2.5 border-b-2 border-[#9301fe] ant-tabs-tab-active text-[#9013fe] font-semibold bg-[#9031fe]/10' : 'py-2 text-[#2D3748] hover:text-[#9013fe]'} rounded-none text-sm`} onClick={() => setRedeemTab('coming')}>
                                <div className="flex items-center gap-1">Coming Soon<span className="ml-2 text-xs rounded-full h-5 px-2 inline-flex justify-center items-center bg-[#E2E8F0] text-[#CBD5E0]">{rewards.filter(r=>!r.active).length}</span></div>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div key={redeemTab} className="grid gap-[1.5rem] grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] mt-6 animate-fadeInUp duration-500 ease-out">
                        {loadingRewards ? (
                          Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="border border-[#E9D4FF] bg-white rounded-[12px] p-[1.5rem] shadow-[0_2px_8px_rgba(0,0,0,0.05)] relative overflow-hidden">
                              <div className="w-[48px] h-[48px] rounded-[12px] m-[0_auto_1rem] bg-[#E9D4FF] animate-pulse"></div>
                              <div className="h-4 w-2/3 mx-auto bg-gray-200 rounded animate-pulse mb-3"></div>
                              <div className="h-3 w-4/5 mx-auto bg-gray-200 rounded animate-pulse mb-4"></div>
                              <div className="h-9 w-full bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          ))
                        ) : (
                          rewards
                            .filter(r => {
                              if (redeemTab === 'all') return true
                              if (redeemTab === 'unlocked') return r.active && points >= r.points_required
                              if (redeemTab === 'locked') return r.active && points < r.points_required
                              if (redeemTab === 'coming') return !r.active
                              return true
                            })
                            .map((r) => (
                              <div key={r.id} className="border border-[#E9D4FF] bg-white rounded-[12px] p-[1.5rem] shadow-[0_2px_8px_rgba(0,0,0,0.05)] relative overflow-hidden transition-all duration-200 ease-linear hover:translate-y-[-5px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.1)]">
                                <div className="w-[48px] h-[48px] rounded-[12px] flex items-center justify-center m-[0_auto_1rem] text-[1.5rem] text-[#9013fe] bg-[#E9D4FF]">🎁</div>
                                <h4 className="text-center text-[1.1rem] font-semibold mb-2">{r.title}</h4>
                                <p className="text-center text-[0.9rem] text-[#2D3748] mb-4">{r.description ?? ''}</p>
                                <div className="flex items-center justify-center text-[#9013fe] font-semibold mb-4">⭐ {r.points_required} pts</div>
                                <button disabled={!userId || points < r.points_required} onClick={async()=>{ if(!userId) return; const { error } = await redeemReward(userId, r.id, r.points_required); if(!error) refresh() }} className="w-full font-semibold p-[0.75rem] rounded-[8px] transition-all duration-300 ease-in-out bg-[#9013fe] text-white disabled:bg-[#d7e0ed]">{points >= r.points_required ? 'Redeem' : 'Locked'}</button>
                              </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setShowClaimModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-xl w-[90%] max-w-[520px] p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Claim Your 25 Points</h3>
              <button className="text-gray-500" onClick={()=>setShowClaimModal(false)}>✕</button>
            </div>
            <div className="text-sm text-gray-700 space-y-2 mb-4">
              <p>1. Sign up for Reclaim (free), then fill the form below</p>
              <p>2. Enter your Reclaim sign-up email</p>
              <p>3. Upload a screenshot URL showing your Reclaim profile and email</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email used on Reclaim</label>
                <input value={claimEmail} onChange={(e)=>setClaimEmail(e.target.value)} type="email" placeholder="user@example.com" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Upload screenshot URL (mandatory)</label>
                <input value={claimScreenshotUrl} onChange={(e)=>setClaimScreenshotUrl(e.target.value)} type="url" placeholder="https://..." className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button className="px-4 py-2 rounded-md bg-gray-200 text-gray-800" onClick={()=>setShowClaimModal(false)}>Cancel</button>
              <button disabled={submittingClaim || !claimEmail || !claimScreenshotUrl} onClick={async()=>{ if (!userId) { toast.error('Login required'); return } setSubmittingClaim(true); const { error } = await getSupabase().from('external_signups').insert({ user_id: userId, email_used: claimEmail, screenshot_url: claimScreenshotUrl, status: 'pending' } as any); setSubmittingClaim(false); if (error) { toast.error(error.message) } else { toast.success('Submitted for review'); setShowClaimModal(false); setClaimEmail(''); setClaimScreenshotUrl('') } }} className="px-4 py-2 rounded-md bg-[#9013fe] text-white disabled:bg-gray-300">{submittingClaim ? 'Submitting...' : 'Submit Claim'}</button>
            </div>
          </div>
        </div>
      )}
      {showDailySuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setShowDailySuccess(false)}></div>
          <div className="relative bg-white rounded-xl shadow-xl md:w-[25%] w-[75%] px-9 max-w-[480px] p-6 text-center">
            <button className="absolute top-3 right-3 text-gray-500" onClick={()=>setShowDailySuccess(false)}>✕</button>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
            </div>
            <h3 className="text-xl font-bold mb-1">Level Up!</h3>
            <div className="text-2xl font-extrabold text-[#9013fe] mb-2">+5 Points</div>
            <p className="text-sm text-gray-600">You've claimed your daily points! Come back tomorrow for more.</p>
          </div>
        </div>
      )}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setShowShareModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-xl md:w-[25%] w-[75%] max-w-[520px] p-6 text-center">
            <button className="absolute top-3 right-3 text-gray-500" onClick={()=>setShowShareModal(false)}>✕</button>
            <h3 className="text-2xl font-bold mb-3">Share Your Stack</h3>
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-[#9013fe]/10 flex items-center justify-center">
              {/* <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9013fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg> */}
              <FileStack className='text-[#9013fe]'/>
            </div>
            <p className="text-sm text-gray-600">You have no stack created yet, go to Tech Stack to create one.</p>
          </div>
        </div>
      )}
    </div>
  )
}