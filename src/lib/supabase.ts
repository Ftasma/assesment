import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const url = (import.meta.env.VITE_SUPABASE_URL as string) || ''
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || ''
// Never use service role key in the browser

let client: SupabaseClient<Database> | null = null

try {
  if (url && anon) {
    client = createClient<Database>(url, anon)
  } else {
    console.error('Supabase env missing: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY')
  }
} catch (e) {
  console.error('Supabase init failed:', e)
}

export const supabase = client
export function getSupabase(): SupabaseClient<Database> {
  if (!client) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  return client
}

export async function getSessionUser() {
  const { data } = await getSupabase().auth.getUser()
  return data.user ?? null
}

export async function getProfile(userId: string) {
  if (!supabase) return { data: null, error: { message: 'supabase not initialized' } as any }
  return supabase
    .from('profiles')
    .select('id, username, referral_code, points')
    .eq('id', userId)
    .maybeSingle<Database['public']['Tables']['profiles']['Row']>()
}

export async function awardReferralPoints(referralCode: string, referredId: string) {
  const { error } = await getSupabase().rpc('rpc_award_referral', { referral_code: referralCode, referred_id: referredId } as any)
  return { error: error ?? null }
}

export async function claimDailyPoints(userId: string) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const { data: claimed, error } = await getSupabase()
    .from('points_transactions')
    .select('id, created_at')
    .eq('user_id', userId)
    .eq('type', 'daily_claim')
    .gte('created_at', start.toISOString())
  if (error) return { error }
  if (claimed && claimed.length > 0) return { error: { message: 'already claimed' } }
  const { error: rpcErr } = await getSupabase().rpc('rpc_claim_daily_points' as any)
  return { error: rpcErr ?? null }
}

export async function redeemReward(_userId: string, rewardId: string, _pointsRequired: number) {
  const { error } = await getSupabase().rpc('rpc_redeem_reward', { reward_id: rewardId } as any)
  return { error: error ?? null }
}