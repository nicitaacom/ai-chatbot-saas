## Genaral information

This project created for AI chatbot (better then on GHL because of UI)<br/>
Client flow: form filled out -> appointment booked -> team helped with AI chatbot setup -> client use AI chatbot

<details> <summary><b>Promot for AI</b></summary>

```
it should be in design like whatsApp notion upwrok

follow my tailwind config and .css
follow 60 30 10 rule
create it in styles like bg-foreground/40 border rounded-lg border-border-color/20 blur-sm shadow-sm
use scale 98 when user press on button
use antd (for icons use react-icons)
and use t("some.message") for i18n

tailind.config.ts
```

</details>

<details> <summary><b>How AI cahtbot works?</b></summary>

User DM support -> AI trained on CX reply to user immediately -> support (client) can response<br/>
to user as well from support dashboard chat also includes buttons<br/>
if user need to select something or interact with something e.g input to enter your doctor's name etc

</details>

<br/>

<br/>

## TODO

implement /feedback and /utm and /auth (google/reg-validate-zerobounce/OTP/lambda-10m-encryption/login&pass/twilio-verify-SMS)<br/>
and also "Ask AI" so users can find what they want<br/>
Create a post in skool and discord that SMMA owners can use this at no cost for them

<br/>

## Arch & Infra & Code

<details> <summary><b>Infrastructure</b></summary>

login: ---> client (for payments / copy-paste script / manage prompt / support chat)
|-------> support (CMS for users / and their subscriptions for AI chatbot / managing openAI gmail calendar API keys)

onboarding form: created by David - qualifying questions to understand their needs then book an appointment

fronted: any clients website on any framework/website builder + script that they copy after login client page

</details>

<details> <summary><b>Infrastructure-logic</b></summary>

1. pusher - for instant notifications
2. supabase - to store users and auth (login with email even if logged in with google)
3. i18n - to show it on different languages
4. openAI - train on CX (it's initial prompt basically) - to reply to users fast
5. your WA API (to send messages) - David has WhatsApp API to send messages in WA (implement logic to send msgs from chat to WA)
6. stripe - to sync it with supabase and create recurrent+manuall payments for 1 month/1 year
7. twilio - to validate phone to avoid free trial abuse (if client don't want to enter credit card details)
8. resend - for payment-check and ToS updates

</details>

<details> <summary><b>Code architecture</b></summary>

Folder/

- components (for UI features and libs and utils)
- ts (interfaces and types for Folder)

Outside

- features/
  - feature1/
    - class (for modular.approach)
      - actions (for CRUD)
    - store (to set state)
    - hooks (to fetch&set state on mounting)
    - functions (to CRUD&set state on click e.g sendMessageFn use class and store)
- libs (so Folder use e.g supabaseAdmin and pusher)
- utils (so functions or components use them e.g formatTime, formatPrice)
  NOT feature/entiry related e.g getAnonymousId (auth) or getFreeSubscription (subscription)

**Note:** feature/entity should be simple unimplementable and it should not depend on another feature (e.g user and sub-feature is subscription)
because user has a subscription - or e.g Folder may user auth feature but it's not depend on it because auth feature can be simply removed

And don't be afraid to vioate DRY a bit - even if you create similar method in another class - code remains SOLID

</details>

<br/>

## FAQ

<details> <summary><b>Add new language</b></summary>

1. +-:server.ts
2. +:locales/lg.ts (lg any language tag e.g fr or ch or ru etc)
3. +-:client.ts (import new locale)
4. +-:middleware.ts ( locales: ["en", "lv"," "lt"] add new locale )
5. +-:app/locale/client/page.tsx ( add new button to select new locale )

</details>

<br/>

## DB

Created own auth because [this](https://i.imgur.com/vvERN0j.png)<br/>
So all actions instead of RLS performed on server

<details> <summary><b>SQL query for all DB</b></summary>

```sql
-- 👤 Users Table (must be created first)
create table public.users (
  id uuid not null,
  created_at timestamptz not null default now(),
  username text not null,
  email text not null,
  avatar_url text null,
  roles text[] not null default '{USER}'::text[],
  email_verified_at timestamptz null,
  phone_verified_at timestamptz  null,
  providers text[] not null default '{}'::text[],
  encrypted_password text null, -- nullable because user can login with google
  phone text null,
  is_otp_enabled boolean not null default false,
  otp_encrypted_secret text null,
  verification_email_sent_at timestamp with time zone null,
  constraint users_pkey primary key (id)
) TABLESPACE pg_default;

-- 🔐 RLS for Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;


-- 🛍️ Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    status TEXT NULL,
    price_id TEXT NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    current_period_start text not null,
    current_period_end text not null,
    created text not null,
    metadata jsonb null
);

-- Create indexes separately (PostgreSQL syntax)
CREATE INDEX idx_subscriptions_user_id ON subscriptions (user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);
CREATE INDEX idx_subscriptions_price_id ON subscriptions (price_id);

-- 🔐 RLS Policies for Users
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;




-- 💬 Messages (no auth.uid references)
CREATE TABLE public.messages (
  id text NOT NULL PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  sender_username text NOT NULL,
  body text NULL,
  image_url text NULL,
  seen boolean NOT NULL DEFAULT false
) TABLESPACE pg_default;

-- 🔐 RLS for Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;


-- 🎫 Tickets Table (no auth.uid references)
CREATE TABLE public.tickets (
  created_at timestamptz NOT NULL DEFAULT NOW(),
  owner_id uuid NOT NULL, -- can be anonymousId that's why no references to public.users
  rating smallint NULL,
  owner_username text NOT NULL DEFAULT '',
  is_open boolean NOT NULL DEFAULT true,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  amount_unseen_by_support integer NOT NULL DEFAULT 0,
  amount_unseen_by_user integer NOT NULL DEFAULT 0
) TABLESPACE pg_default;

-- 🔐 RLS for Tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;




-- 📦 Products Table (no auth.uid references)
create table public.products_live (
  id text not null,
  active boolean null,
  name text null,
  description text null,
  image text null,
  metadata jsonb null,
  constraint products_live_pkey primary key (id)
) TABLESPACE pg_default;

-- 🔐 RLS for products_live
ALTER TABLE public.products_live ENABLE ROW LEVEL SECURITY;


-- 📦 Products Table (no auth.uid references)
create table public.products_test (
  id text not null,
  active boolean null,
  name text null,
  description text null,
  image text null,
  metadata jsonb null,
  constraint products_test_duplicate_pkey primary key (id)
) TABLESPACE pg_default;

-- 🔐 RLS for Tickets
ALTER TABLE public.products_test ENABLE ROW LEVEL SECURITY;




-- 👨‍💼 Customers Table (no auth.uid references)
create table public.customers_live (
  id uuid not null,
  stripe_customer_id text null,
  constraint customers_live_pkey primary key (id),
  constraint customers_live_id_fkey foreign KEY (id) references public.users(id)
) TABLESPACE pg_default;

-- 🔐 RLS for customers_live
ALTER TABLE public.customers_live ENABLE ROW LEVEL SECURITY;

-- 👨‍💼 Customers Table (no auth.uid references)
create table public.customers_test (
  id uuid not null,
  stripe_customer_id text null,
  constraint customers_test_pkey primary key (id),
  constraint customers_test_id_fkey foreign KEY (id) references public.users(id)
) TABLESPACE pg_default;

-- 🔐 RLS for customers_test
ALTER TABLE public.customers_test ENABLE ROW LEVEL SECURITY;


-- 🏷️ Prices Table (no auth.uid references)
create table public.prices_live (
  id text not null,
  product_id text null,
  active boolean null,
  description text null,
  unit_amount bigint null,
  currency text null,
  type public.pricing_type null,
  interval public.pricing_plan_interval null,
  interval_count integer null,
  trial_period_days integer null,
  metadata jsonb null,
  constraint prices_live_pkey primary key (id),
  constraint prices_live_product_id_fkey foreign KEY (product_id) references products_live(id) on update CASCADE on delete CASCADE,
  constraint prices_currency_check check ((char_length(currency) = 3))
) TABLESPACE pg_default;

-- 🔐 RLS for prices_live
ALTER TABLE public.prices_live ENABLE ROW LEVEL SECURITY;

-- 🏷️ Prices Table (no auth.uid references)
create table public.prices_test (
  id text not null,
  product_id text null,
  active boolean null,
  description text null,
  unit_amount bigint null,
  currency text null,
  type public.pricing_type null,
  interval public.pricing_plan_interval null,
  interval_count integer null,
  trial_period_days integer null,
  metadata jsonb null,
  constraint prices_test_pkey primary key (id),
  constraint prices_test_product_id_fkey foreign KEY (product_id) references products_test (id) on update CASCADE on delete CASCADE,
  constraint prices_currency_check check ((char_length(currency) = 3))
) TABLESPACE pg_default;

-- 🔐 RLS for prices_test
ALTER TABLE public.prices_test ENABLE ROW LEVEL SECURITY;












-- 📊 UTM Stats Table
CREATE TABLE IF NOT EXISTS public.utm_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  utm_source VARCHAR NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT utm_stats_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 🔐 RLS for UTM Stats (public read-only)
ALTER TABLE utm_stats ENABLE ROW LEVEL SECURITY;
```

</details>

<details> <summary><b>Verify your email</b></summary>

```html
<table style="max-width: 640px; width: 100%;background-color:rgb(32,32,32)" align="center">
  <table style="min-width:100%;margin:0rem;padding:1rem 0rem;text-align:center">
    <tbody>
      <tr>
        <td></td>
      </tr>
    </tbody>
  </table>

  <tr>
    <td style="text-align:center">
      <img src="https://i.imgur.com/KmMEBux.png" alt="" style="width: 40%;" />
    </td>
  </tr>
  <tr>
    <td style="font-weight: bold; text-align:center;font-size: 18px; color: #666666; padding: 10px 0;">
      Verify your email on AI chatbot
    </td>
  </tr>
  <tr>
    <td style="text-align: center;">
      <a
        href="{{ .ConfirmationURL }}"
        style="display: inline-block; background-color: #4CAF50; color: #1f1f1f; padding: 10px 20px; text-align: center; text-decoration: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
        Verify email
      </a>
    </td>
  </tr>

  <table style="border-top:1px solid #999999;min-width:100%;margin:1rem 0rem;padding:1rem 0rem;text-align:center">
    <tbody>
      <tr>
        <td>
          <a
            href="http://localhost:3000/support"
            style="color:rgb(64,125,237);text-decoration:none;margin:0px;font-size:0.875rem;line-height:1.25rem;text-align:center;margin-right:1rem"
            target="_blank"
            data-saferedirecturl="https://www.google.com/url?q=http://localhost:3000/support&amp;source=gmail&amp;ust=1696683582414000&amp;usg=AOvVaw1cLGx1tiGtSp3MUWJAOiih"
            >Support</a
          >
          <a
            href="http://localhost:3000/feedback"
            style="color:rgb(64,125,237);text-decoration:none;margin:0px;font-size:0.875rem;line-height:1.25rem;text-align:center;margin-right:1rem"
            target="_blank"
            data-saferedirecturl="https://www.google.com/url?q=http://localhost:3000/feedback&amp;source=gmail&amp;ust=1696683582414000&amp;usg=AOvVaw2J2syDW1hX-6J6kkisMOBZ"
            >Feedback</a
          >
        </td>
      </tr>
    </tbody>
  </table>
</table>
```

</details>

<details> <summary><b>URL Configuration</b></summary>

Site URL - http://localhost:3000<br/>
Redirect URLs:<br/>
http://localhost:3000/auth/callback/oauth*<br/>
http://localhost:3000/auth/callback/credentials<br/>
http://localhost:3000/auth/callback/recover<br/>
https://chat.outreach-tool.com/auth/callback/oauth*<br/>
https://chat.outreach-tool.com/auth/callback/credentials<br/>
https://chat.outreach-tool.com/auth/callback/recover<br/>

</details>

<details> <summary><b>Sign In / Providers</b></summary>
Confirm email: off

Email: on
Google: on

</details>

<details> <summary><b>Database Enumerated Types</b></summary>

```sql
-- Pricing Type
CREATE TYPE pricing_type AS ENUM ('one_time', 'recurring');

-- Pricing Plan Interval
CREATE TYPE pricing_plan_interval AS ENUM ('day', 'week', 'month', 'year');

-- Subscription Status
CREATE TYPE subscription_status AS ENUM (
    'trialing',
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'unpaid'
);
```

</details>
