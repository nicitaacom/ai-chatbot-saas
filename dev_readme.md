This project created for AI chatbot (better then on GHL because of UI)


Client flow: form filled out -> appointment booked -> team helped with AI chatbot setup -> client use AI chatbot

### How AI cahtbot works?
User DM support -> AI trained on CX reply to user immediately -> support (client) can response to user as well from support dashboard


### Infrastructure

login: ---> client (for payments / copy-paste script / manage prompt / support chat)
       |-------> support (CMS for users / and their subscriptions for AI chatbot / managing openAI gmail calendar API keys)

onboarding form: created by David - qualifying questions to understand their needs then book an appointment

fronted: any clients website on any framework/website builder + script that they copy after login client page