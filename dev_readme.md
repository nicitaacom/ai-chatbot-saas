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

# FAQ

### Add new language

1. +-:server.ts
2. +:locales/lg.ts (lg any language tag e.g fr or ch or ru etc)
3. +-:client.ts (import new locale)
4. +-:middleware.ts ( locales: ["en", "lt"," "lg"] add new locale )
5. +-:app/locale/client/pdage.tsx ( add new button to select new locale )
