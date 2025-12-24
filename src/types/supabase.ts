export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          referral_code: string | null
          points: number | null
          created_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          referral_code?: string | null
          points?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          referral_code?: string | null
          points?: number | null
          created_at?: string | null
        }
      }
      points_transactions: {
        Row: {
          id: string
          user_id: string | null
          type: string
          points: number
          status: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          points: number
          status?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          points?: number
          status?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string | null
          referred_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          referrer_id?: string | null
          referred_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          referrer_id?: string | null
          referred_id?: string | null
          created_at?: string | null
        }
      }
      external_signups: {
        Row: {
          id: string
          user_id: string | null
          email_used: string
          screenshot_url: string
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          email_used: string
          screenshot_url: string
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          email_used?: string
          screenshot_url?: string
          status?: string | null
          created_at?: string | null
        }
      }
      rewards: {
        Row: {
          id: string
          title: string
          description: string | null
          points_required: number
          active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          points_required: number
          active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          points_required?: number
          active?: boolean | null
          created_at?: string | null
        }
      }
      redemptions: {
        Row: {
          id: string
          user_id: string | null
          reward_id: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          reward_id?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          reward_id?: string | null
          status?: string | null
          created_at?: string | null
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}