This project created for AI chatbot (better then on GHL because of UI)

Client flow: form filled out -> appointment booked -> team helped with AI chatbot setup -> client use AI chatbot

### How AI cahtbot works?

User DM support -> AI trained on CX reply to user immediately -> support (client) can response to user as well from support dashboard
Chat also includes buttons if user need to select something or interact with something e.g input to enter your doctor's name etc

### Infrastructure

login: ---> client (for payments / copy-paste script / manage prompt / support chat)
|-------> support (CMS for users / and their subscriptions for AI chatbot / managing openAI gmail calendar API keys)

onboarding form: created by David - qualifying questions to understand their needs then book an appointment

fronted: any clients website on any framework/website builder + script that they copy after login client page

### Infrastructure-logic

1. pusher - for instant notifications
2. supabase - to store users and auth (login with email even if logged in with google)
3. i18n - to show it on different languages
4. openAI - train on CX (it's initial prompt basically) - to reply to users fast
5. your WA API (to send messages) - David has WhatsApp API to send messages in WA (implement logic to send msgs from chat to WA)
6. stripe - to sync it with supabase and create recurrent+manuall payments for 1 month/1 year
7. twilio - to validate phone to avoid free trial abuse (if client don't want to enter credit card details)
8. resend - for payment-check and ToS updates

### TODO

implement /feedback and /utm

## FAQ

### Add new language

1. +-:server.ts
2. +:locales/lg.ts (lg any language tag e.g fr or ch or ru etc)
3. +-:client.ts (import new locale)
4. +-:middleware.ts ( locales: ["en", "lt"," "lg"] add new locale )
5. +-:app/locale/client/pdage.tsx ( add new button to select new locale )

## DB

  <details> <summary><b>SQL query for all DB</b></summary>

```sql
-- 👥 Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid not null,
  created_at timestamp with time zone not null default now(),
  username text not null,
  email text not null,
  avatar_url text null,
  role text[] not null default '{USER}'::text[],
  email_verified_at timestamp with time zone null,
  phone_verified_at timestamp with time zone null,
  providers text[] null default '{}'::text[],
  constraint users_pkey primary key (id),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

-- 🔐 RLS Policies for Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Self select" ON users FOR SELECT USING (id = auth.uid());

-- -- 🛍️ Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
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
CREATE POLICY "Allow to select their own subscriptions" ON users FOR SELECT USING (id = auth.uid());

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

## Email templates

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
            data-saferedirecturl="https://www.google.com/url?q=http://localhost:8000/support&amp;source=gmail&amp;ust=1696683582414000&amp;usg=AOvVaw1cLGx1tiGtSp3MUWJAOiih"
            >Support</a
          >
          <a
            href="http://localhost:3000/feedback"
            style="color:rgb(64,125,237);text-decoration:none;margin:0px;font-size:0.875rem;line-height:1.25rem;text-align:center;margin-right:1rem"
            target="_blank"
            data-saferedirecturl="https://www.google.com/url?q=http://localhost:8000/feedback&amp;source=gmail&amp;ust=1696683582414000&amp;usg=AOvVaw2J2syDW1hX-6J6kkisMOBZ"
            >Feedback</a
          >
        </td>
      </tr>
    </tbody>
  </table>
</table>
```

</details>
