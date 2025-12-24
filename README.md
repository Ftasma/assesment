**Project Setup**
- Requires Node.js 18+ and npm.
- Install dependencies: `npm i`.
- Start dev server: `npm run dev` (opens at `http://localhost:5173`).
- Build for production: `npm run build`.

**Environment Variables**
- Create `./.env.local` (or `.env`) with:
  - `VITE_SUPABASE_URL=<your-supabase-url>`
  - `VITE_SUPABASE_ANON_KEY=<your-anon-key>`
- Do NOT use service role keys (`sb_secret_...`) in the browser.

**Supabase Auth Configuration**
- In Supabase Dashboard → Settings → Auth → URL Configuration:
  - Site URL: `http://localhost:5173`
  - Redirect URLs: `http://localhost:5173`, `http://localhost:5173/dashboard`
- Providers → Google: add the same `localhost` redirect URL if using Google login.

**Database Schema**
- Create tables and triggers in Supabase (SQL editor). Minimal set:
  - `profiles(id uuid primary key references auth.users(id), username text, referral_code text unique, points integer default 0, created_at timestamptz default now())`
  - `points_transactions(id uuid default gen_random_uuid(), user_id uuid references profiles(id), type text, points integer, status text default 'approved', metadata jsonb, created_at timestamptz default now())`
  - `referrals(id uuid default gen_random_uuid(), referrer_id uuid references profiles(id), referred_id uuid references profiles(id) unique, created_at timestamptz default now())`
  - `external_signups(id uuid default gen_random_uuid(), user_id uuid references profiles(id), email_used text, screenshot_url text, status text default 'pending', created_at timestamptz default now())`
  - `rewards(id uuid default gen_random_uuid(), title text, description text, points_required integer, active boolean default true, created_at timestamptz default now())`
  - `redemptions(id uuid default gen_random_uuid(), user_id uuid references profiles(id), reward_id uuid references rewards(id), status text default 'pending', created_at timestamptz default now())`
- Triggers:
  - `handle_new_user` on `auth.users` → inserts a row into `profiles` with username from email.
  - `generate_referral_code` on `profiles` → sets `referral_code` (can be DB-side)
  - `update_user_points` on `points_transactions` (optional if you aggregate from transactions; this project aggregates from transactions for accuracy).
- RLS policies (minimum):
  - `profiles`: select own — `using (auth.uid() = id)`
  - `points_transactions`: select own; insert own — `using/auth.uid() = user_id`, `with check (auth.uid() = user_id)`
  - `referrals`: insert own — `with check (auth.uid() = referrer_id)`; select own — `using (auth.uid() = referrer_id)`
  - `external_signups`: insert/select own — `with check (auth.uid() = user_id)` / `using (auth.uid() = user_id)`
  - `rewards`: anyone can select — `using (true)`
  - `redemptions`: insert/select own — `with check (auth.uid() = user_id)` / `using (auth.uid() = user_id)`

**Optional RPC (Server-Side) Functions**
- For production-grade privileged actions, create:
  - `rpc_award_referral(referral_code text, referred_id uuid)` — inserts `referrals` and awards points.
  - `rpc_claim_daily_points()` — awards +5 once per day.
  - `rpc_redeem_reward(reward_id uuid)` — inserts `redemptions` and deducts points.
- Grant execute to `anon` and `authenticated`.

**Login & Signup**
- Email/password login: `Login` page calls `supabase.auth.signInWithPassword(email, password)`.
- Google login: `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: <site>/dashboard } })`.
- Signup:
  - Creates/updates `profiles` with `id`, `username`, and default fields.
  - Generates a referral code.
  - If a referral code is present in the URL (e.g. `?ref=code`), awards 25 points to the referrer and records the referral.
  - Shows a success toast and routes to the dashboard.

**Referral Links**
- Live referral URL format: `https://flowvatest.vercel.app/signup?ref=<code>`.
- Dashboard → Rewards Hub → Refer & Earn shows your link and a copy button with a toast.
- Refer stats:
  - Referrals: count of rows in `referrals` where `referrer_id = current user`.
  - Points earned: sum of `points_transactions` where `type = 'referral'` and `status = 'approved'`.

**Daily Points**
- Users must click “Claim 5 points” to earn daily points; it is not automatic on login.
- Guard ensures one claim per day:
  - Checks `points_transactions` for `type = 'daily_login'` with `created_at >= midnight`.
- Successful claim:
  - Inserts a `points_transactions` row with `{ type: 'daily_login', points: 5, status: 'approved' }`.
  - Recomputes total points from transactions and shows a success modal.

**Points Calculation**
- Points displayed are aggregated from `points_transactions` for the current user, summing only rows with `status = 'approved'`.
- This avoids double-counting and keeps UI consistent with actual transactions.

**Rewards & Redemption**
- Rewards list is rendered from a static array for reliability; tabs filter:
  - All — all rewards
  - Unlocked — `active && points >= points_required`
  - Locked — `active && points < points_required`
  - Coming — `!active`
- Redemption flow calls `redeemReward` (RPC). Create `rpc_redeem_reward` or change to a direct insert if you prefer client-side only.

**External Signups Proof (Modal)**
- Top Tool Spotlight → “Claim 50 pts” opens a modal to submit proof.
- User enters email used and a screenshot URL; inserts into `external_signups` with `status = 'pending'`.

**Dashboard Sidebar**
- Desktop: shows user info at the bottom; click to toggle logout.
- Mobile: hamburger opens the drawer; user info and a toggleable logout appear at the bottom after tapping the email.


**Scripts**
- `npm run dev` — start Vite dev server.
- `npm run build` — build production assets.
