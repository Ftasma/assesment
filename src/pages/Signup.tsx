import { useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner'
import { getSupabase } from '../lib/supabase'

export default function Signup({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refCode, setRefCode] = useState('')

  const handleReferral = async (newUserId: string, code: string) => {
    if (!code) return
    const client = getSupabase()
    const { data: referrer } = await client
      .from('profiles')
      .select('id')
      .eq('referral_code', code)
      .maybeSingle()
    if (!referrer || (referrer as any).id === newUserId) return
    await (client.from('referrals') as any).insert({ referrer_id: (referrer as any).id, referred_id: newUserId })
    const { data: existingPts } = await client
      .from('points_transactions')
      .select('id, metadata')
      .eq('user_id', (referrer as any).id)
      .eq('type', 'referral')
      .eq('status', 'approved')
    const alreadyAwarded = (existingPts ?? []).some((row: any) => row?.metadata?.referred_id === newUserId)
    if (!alreadyAwarded) {
      await (client.from('points_transactions') as any).insert({ user_id: (referrer as any).id, type: 'referral', points: 25, status: 'approved', metadata: { referred_id: newUserId } })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return }
    setLoading(true)
    getSupabase().auth.signUp({ email, password }).then(async ({ data, error }) => {
      setLoading(false)
      if (error) { toast.error(error.message); return }
      const user = data.user
      if (user) {
        const client = getSupabase()
        const uname = (user.email?.split('@')[0]) || 'user'
        const newProfile = {
          id: user.id,
          username: uname,
          points: 0,
          referral_code: null,
        } as any
        await (client.from('profiles') as any)
          .upsert(newProfile)
        const code = Math.random().toString(36).substring(2, 8)
        const updateProfile = { referral_code: code } as any
        await (client.from('profiles') as any)
          .update(updateProfile)
          .eq('id', user.id)
        await handleReferral(user.id, refCode)
      }
      toast.success('Check your email to complete sign up and verify your account')
    })
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const p = params.get('ref') || localStorage.getItem('ref') || ''
    setRefCode(p || '')
  }, [])

  return (
    <div className="min-h-[100dvh] flex justify-center py-[20px] px-3 items-center bg-gradient-to-br from-[#9013fe] to-[#6D28D9]">
      <div className="flex justify-center w-full max-w-[420px]">
        <div className="w-full shadow-[0_4px_6px_rgba(0,0,0,0.1)] py-[30px] px-[20px] lg:p-[40px] bg-white rounded-[10px] animate-fadeIn h-fit">
          <div className="mb-[30px]">
            <h1 className="text-2xl text-[#6D28D9] font-semibold mb-[8px] text-center w-full">Create Your Account</h1>
            <p className="text-sm text-[#6B7280] text-center w-full">Sign up to manage your tools</p>
          </div>
          <div className="w-full">
            <form className="w-full text-[#111827]" onSubmit={handleSubmit}>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-[#111827]">Email</label>
              <div className="relative group w-full mb-5">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  className="peer w-full border text-base py-[11px] px-3.5 border-[#EDE9FE] transition-all ease-linear duration-[.2s] rounded-md outline-none focus:border-[#9013fe]"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="pointer-events-none absolute inset-0 rounded-md peer-focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"></div>
              </div>

              <label htmlFor="password" className="block text-sm font-medium mb-2 text-[#111827]">Password</label>
              <div className="relative mb-5">
                <div className="relative group w-full">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    className="peer w-full border py-[11px] px-[14px] text-base border-[#EDE9FE] transition-all ease-linear duration-[.2s] rounded-md outline-none focus:border-[#9013fe]"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-md peer-focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"></div>
                </div>
                <button type="button" className="absolute right-3 border-none text-[#A78BFA] h-fit font-medium text-xs top-0 bottom-0 m-auto" onClick={() => setShowPwd((v) => !v)}>
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>

              <label htmlFor="confirm-password" className="block text-sm font-medium mb-2 text-[#111827]">Confirm Password</label>
              <div className="relative">
                <div className="relative group w-full mb-5">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    id="confirm-password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    className="peer w-full border py-[11px] px-[14px] text-base border-[#EDE9FE] transition-all ease-linear duration-[.2s] rounded-md outline-none focus:border-[#9013fe]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-md peer-focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]"></div>
                </div>
                <button type="button" className="absolute right-3 border-none text-[#A78BFA] h-fit font-medium text-xs top-0 bottom-0 m-auto" onClick={() => setShowConfirm((v) => !v)}>
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>

              <button type="submit" className="w-full text-base h-[55px] flex justify-center gap-2 items-center p-[11px] text-center bg-[#9013FE] text-white font-medium border-none transition-colors ease-linear duration-[.2s] rounded-[100px] hover:bg-[#6D28D9]">{loading ? 'Creating...' : 'Sign up Account'}</button>
              <Toaster richColors position="top-center" />
            </form>

            <div className="relative flex items-center w-full my-[20px]">
              <div className="flex-grow h-px bg-[#EDE9FE]"></div>
              <span className="text-[13px] text-[#A78BFA] font-medium bg-white px-3">or</span>
              <div className="flex-grow h-px bg-[#EDE9FE]"></div>
            </div>

            <button className="border py-[11px] px-[14px] text-sm w-full gap-2 text-[#111827] border-[#EDE9FE] rounded-md hover:bg-[#F5F3FF] transition-colors flex items-center justify-center relative">
              <svg width="24" height="24" viewBox="0 0 29 29" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                <path d="M27.1888 14.7814C27.1888 13.7382 27.1024 12.9769 26.9155 12.1875H14.7603V16.8959H21.8951C21.7513 18.066 20.9745 19.8282 19.2483 21.0123L19.2241 21.1699L23.0674 24.0877L23.3336 24.1137C25.779 21.9005 27.1888 18.644 27.1888 14.7814Z" fill="#4285F4" />
                <path d="M14.7593 27.1871C18.2548 27.1871 21.1893 26.0592 23.3327 24.1139L19.2474 21.0124C18.1541 21.7595 16.6868 22.2811 14.7593 22.2811C11.3357 22.2811 8.43002 20.0679 7.39421 17.0088L7.24238 17.0214L3.24611 20.0524L3.19385 20.1947C5.32279 24.3393 9.69579 27.1871 14.7593 27.1871Z" fill="#34A853" />
                <path d="M7.39501 17.0095C7.1217 16.2201 6.96353 15.3742 6.96353 14.5002C6.96353 13.6261 7.1217 12.7803 7.38063 11.9909L7.37339 11.8228L3.32703 8.74316L3.19464 8.80488C2.3172 10.5248 1.81372 12.4561 1.81372 14.5002C1.81372 16.5443 2.3172 18.4756 3.19464 20.1954L7.39501 17.0095Z" fill="#FBBC05" />
                <path d="M14.7594 6.7183C17.1904 6.7183 18.8302 7.74739 19.7653 8.60738L23.4191 5.11125C21.1751 3.06716 18.2549 1.8125 14.7594 1.8125C9.69583 1.8125 5.3228 4.66012 3.19385 8.80467L7.37985 11.9907C8.43004 8.93159 11.3358 6.7183 14.7594 6.7183Z" fill="#EB4335" />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <div className="text-center mt-5 text-sm">
              <p className="text-[#6B7280]">
                Already have an account{' '}
                <button type="button" className="text-[#9013fe] no-underline font-medium hover:underline" onClick={() => onNavigate?.('/login')}>
                  Log In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}