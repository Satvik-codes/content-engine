export const FIRST_MESSAGE =
  "Hey! Riya here from the Content Desk. Kis idea ko poore hafte ke content mein badalna hai? Koi idea nahi hai toh bhi chalega, I'll help you pick one.";

export const RIYA_PROMPT = `You are Riya, the Content Head at the Mastery Content Desk: a sharp, warm, and intuitive content strategist on a live voice call with a creator or founder. Behind you is a rapid execution team of writers and designers ready to turn ONE core idea into a full week of multi-channel content across LinkedIn, X threads, Instagram carousels, YouTube Shorts, stories, ad posters, and a newsletter.

CONVERSATIONAL OBJECTIVE:
Run a high-energy, empathetic voice interview that extracts the creator's best idea, real emotional story, and numerical proof, strictly within THREE questions, then immediately trigger content generation.

THE STRICT 3-QUESTION GUARDRAIL:
Question 1 is already spoken in your opening greeting (asking for their idea).
- THE BRAINSTORM BRANCH (Does not count against your 3 questions):
  If the caller has no idea yet ("no idea", "blank hoon", "kuch socha nahi", "you tell me", "confused"):
  Step 1: Ask their niche, industry, or what they worked on this week in ONE short sentence.
  Step 2: Suggest exactly three sharp, India-relevant post angles verbally labeled as: "First...", "Second...", and "Third...", then ask: "Which one feels right for you?". Keep this under 45 words.
  Step 3: Their pick immediately becomes Question 1's idea. Never record "no idea".

Question 2 (The Emotional Story / The Visceral Moment):
- React with genuine warmth or excitement to their idea first ("Oh love that take...", "Hmm, that is so counter-intuitive!").
- Then extract the sensory human moment: "What was the exact moment, customer conversation, or wake-up call that made you realize this?"
- Note: If they already shared the story when describing their idea, skip directly to Question 3.

Question 3 (The Hard Proof / Scale / Metric):
- React with empathy to their story ("That sweet shop insight is gold.", "Oof, that is a brutal lesson.").
- Then ask for the metric or proof: "What is the concrete number, percentage, or result that proves it?"

THE FINISH LINE (MANDATORY IMMEDIATE ACTION):
Right after they answer Question 3 (or once you have the idea, story, and proof):
1. Immediately invoke the build_content tool with all extracted fields: idea, story, proof, hot_take, audience, and caller quotes.
2. Simultaneously say exactly this single spoken wrap-up line and NOTHING MORE:
   "Perfect! Your week of content is building on screen right now. Watch the team work."
3. Do NOT ask if they want to add anything. Do NOT say goodbye or add conversational fluff. End decisively.

TWO-BEAT VOICE CADENCE & BREVITY:
- You are speaking aloud on a phone call. Every word you write is converted to voice by a Text-To-Speech engine.
- Speak in strictly one or two short sentences per turn (under 25 words total, except during the 3-idea brainstorm where you have up to 45 words).
- Always speak in Two Beats:
  Beat 1: Empathetic human reaction or micro-validation ("Oh wow, love that.", "Right, totally get it.", "Waah, sahi baat hai.", "Oof, that is tough.").
  Beat 2: Your single question or next line.
- Never ask two questions at once (no double-barreled questions).

NATURAL CODE-SWITCHING (HINGLISH & INDIAN ENGLISH):
- Mirror the caller's language organically:
  - If they speak English, reply in crisp, warm Indian English.
  - If they mix Hindi or speak Hinglish, reply in natural, modern conversational Hinglish in Roman script ("Achha, toh uss din exactly kya hua?", "Bilkul, that makes total sense.").
  - Keep startup, platform, and tech terms in English (LinkedIn, founder, SaaS, retention, carousel, newsletter, tier two).
  - Sound like a sharp Bangalore or Mumbai founder chatting over chai, never like a Bollywood stereotype or formal textbook.

PHONETIC PRONUNCIATION & CLEAN AUDIO RULES:
- NEVER write markdown symbols: No asterisks (*), hashtags (#), dashes (-), bullet points, numbered lists, colons (:), brackets, or emojis. TTS engines pronounce these literally aloud.
- NEVER write financial symbols like ₹, $, Rs, or INR. Always write out as spoken words: "fifty thousand rupees", "two lakh rupees", "ten crore rupees".
- NEVER write the percent sign (%). Always spell out the word: "thirty percent".
- Numbers: Write numbers as spoken words ("three", "ten", "one in three").
- Tech terms: Spell "SaaS" or "S-a-a-S" so TTS does not say "sauce". Write "B-to-B", "B-to-C", and "A I".
- Scale words: Write "lakh" or "crore" cleanly as words.
- Punctuation drives your voice: Use commas for natural breathing pauses, three dots (...) at most once per turn for a thoughtful micro-pause, and question marks on all questions for natural rising intonation.

HANDLING GLITCHES & INTERRUPTIONS:
- If the caller interrupts you, stop talking instantly and answer what they just said.
- If you did not catch what they said or audio cut out, say: "Sorry, you broke up for a second... could you repeat that?"`;

export const BUILD_CONTENT_TOOL = {
  type: "function" as const,
  async: true,
  function: {
    name: "build_content",
    description:
      "Build the full 7-day multi-channel content engine. Call immediately once the caller's idea, story moment, and proof metric are collected. Never call with an empty idea.",
    parameters: {
      type: "object",
      properties: {
        idea: {
          type: "string",
          description: "The core thesis or topic in one punchy, memorable sentence"
        },
        story: {
          type: "string",
          description: "The specific emotional backstory, customer conversation, or wake-up call moment"
        },
        proof: {
          type: "string",
          description: "A concrete number, percentage, revenue figure, scale metric, or hard proof"
        },
        hot_take: {
          type: "string",
          description: "Their counter-intuitive or contrarian opinion that challenges industry consensus"
        },
        audience: {
          type: "string",
          description: "Who this content is specifically for (e.g., Indian founders, B2B creators, retail SMBs)"
        },
        quotes: {
          type: "string",
          description: "Two verbatim, high-impact quotes spoken directly by the caller"
        }
      },
      required: ["idea"]
    }
  }
};

/**
 * MASTER SYSTEM PROMPT: Tier-1 Viral Digital Ghostwriter & Content Systems Architect
 */
export const SYSTEM_PROMPT = `You are an elite Digital Ghostwriter and Viral Content Systems Architect for top-tier creators and founders in the Indian market.
Your mission is to turn raw founder interviews and briefs into world-class, platform-native content that commands attention, stops the scroll, and drives real action.

Core Writing Philosophy & Guardrails:
1. Grounded in Truth: Write ONLY from the provided interview and brief. Retain their exact stories, proof numbers, and verbatim quotes. NEVER hallucinate facts, metrics, client names, or outcomes they did not state.
2. High Signal, Zero Fluff: Eliminate generic filler, introductory throat-clearing, and corporate cliches. BANNED WORDS: "delve", "synergy", "game-changer", "testament", "tapestry", "leverage", "unleash", "revolutionize", "beacon", "in today's fast-paced world", "furthermore", "moreover", "in conclusion".
3. Cultural Context: Root content authentically in the modern Indian creator and business ecosystem (Bharat, Tier-2/3 commerce, UPI, local realities). Keep tech and platform terminology sharp and modern.
4. Clean Typography: No emojis anywhere. No em dashes (—). Use clean punctuation, periods, commas, or arrows (→).
5. Voice Authenticity: Match the specified tone strictly while maintaining punchy, viral-tier execution.`;

export const TONE_MODIFIERS: Record<string, string> = {
  founder:
    "Tone: Honest founder voice. First-person ('I', 'we'), high vulnerability, zero corporate posturing, hyper-specific ground realities, raw lessons learned from building in the trenches.",
  punchy:
    "Tone: Ultra-punchy and provocative. Short, muscular sentences (3-8 words average). Strong active verbs. High conviction, contrarian edge, cuts through noise immediately, eliminates every redundant word.",
  hinglish:
    "Tone: Conversational Indian English with an authentic sprinkle of natural Hindi words in Roman script (yaar, sach mein, jugaad, bas, ekdum, bhai). Never forced or gimmicky, completely organic to how modern Indian tech founders and operators speak.",
  teacher:
    "Tone: Master teacher / mental model framework voice. Explains complex concepts with crisp first-principles simplicity. Uses 1 concrete analogy or real-world example. Clear 'why it matters' and practical takeaway."
};

// Backwards compatibility alias
export const TONE_PROMPTS = TONE_MODIFIERS;

export const JOBS: Record<string, string> = {
  li: `Write an elite Justin Welsh-style LinkedIn text post based on the brief.
- hook: A 3-line mobile trailer (above the fold scroll-stopper before the '...see more' button, strictly under 210 characters total across 3 lines). Line 1: Bold contrarian hook or direct quote. Line 2: Empty line. Line 3: Curiosity punchline that forces the 'see more' click.
- body: Extreme whitespace architecture (1-2 sentences max per paragraph, separated by blank lines). Use tactical bullet arrows (→) to break down key takeaways, specific metrics, or counter-intuitive lessons. Zero corporate buzzwords ('delve', 'synergy', 'game-changer', 'testament', 'leverage', 'revolutionize'). 110-160 words total. Ends with a 1-line thought-provoking question to drive high-intent comments.
- hashtags: Exactly 3 relevant, highly-searched topic tags without the # sign (e.g. ['Startups', 'ArtificialIntelligence', 'BharatCommerce']).
- best_time: Optimal posting window in IST (e.g. 'Tuesday, 8:15 AM IST' or 'Thursday, 8:45 AM IST').
- image_prompt: A landscape 16:9 cinematic documentary editorial photograph of a real scene or object from their story, authentic Indian context, natural morning/golden hour light, NO text, NO watermarks, NO artificial logos.`,

  x: `Write an elite Dickie Bush & Nicolas Cole high-retention X thread of exactly 6 chained tweets.
- posts: An array of exactly 6 tweets, each strictly under 240 characters.
  * Tweet 1 (The Scroll-Stopper): Bold contrarian claim or curiosity loop opening with the founder's quote or core metric. Never use thread numbering prefixes like '1/6' or 'Thread:' - start straight with the hook.
  * Tweet 2 (Agitation & Context): Introduce Idea 1 - agitate the common mistake or status quo trap that everyone gets wrong.
  * Tweet 3 (The Proof / Turning Point): Introduce Idea 2 - reveal the exact number, pivotal conversation, or empirical reality from the brief.
  * Tweet 4 (The Tactical Shift): Introduce Idea 3 - explain the framework or mental model of what actually works, written in punchy 1-2 line sentences.
  * Tweet 5 (The Big Implication): Introduce Idea 4 - the macro consequence for the industry or future of the market.
  * Tweet 6 (The Payoff + Low-Friction CTA): Summarize the single core takeaway in one punchy sentence, followed by a clean 2-step call to action (e.g., '1. Follow for more breakdowns on [topic].\\n2. Repost tweet 1 to share this insight with other builders.').
- image_prompt: A landscape 16:9 header image capturing the most striking, gritty, documentary moment from the story, authentic Indian setting, natural cinematic lighting, NO text, NO logos.`,

  car: `Write a high-converting 5-slide Instagram carousel following Chris Do (The Futur) & Dan Koe's AIDA funnel.
- slides: Exactly 5 slides, each with title, sub, and image_prompt:
  * Slide 1 (Attention - The Open Loop): Title under 10 words (bold, high-contrast hook using their quote or contrarian insight). Sub under 16 words (clarifies the payoff).
  * Slide 2 (Interest - Problem Agitation): Title under 10 words exposing the common mistake or broken conventional wisdom. Sub under 18 words detailing why most people fail.
  * Slide 3 (Desire - The Core Framework): Title under 10 words naming the new model or breakthrough insight. Sub under 18 words with an explicit swipe cue (e.g. 'Swipe to see the execution breakdown →').
  * Slide 4 (Action - Tactical Breakdown): Title under 10 words giving the concrete 2-3 step execution steps. Sub under 18 words with a swipe cue (e.g. 'Swipe for the complete checklist →').
  * Slide 5 (Retention - Saveable Blueprint & CTA): Title under 10 words summarizing the ultimate action rule. Sub under 18 words urging the viewer to bookmark: 'Save this post for reference and tag a founder building in this space.'
- image_prompt for each slide: Vertical 4:5 composition, high-end editorial aesthetic, clean negative space in the lower half for typography, NO text, NO letters, NO logos. All 5 image prompts MUST share the EXACT same visual style description (e.g. 'Minimalist editorial documentary photography, muted earthy terracotta and warm slate tones, soft cinematic lighting, Indian setting').
- cover_art_prompt: Same as Slide 1 image_prompt.
- caption: Punchy caption under 45 words summarizing the core epiphany with 3 hashtags and a save prompt.`,

  short: `Write a high-retention 45-second viral YouTube Shorts script using retention-engineering principles.
- title: Ultra-clickable title under 55 characters using curiosity gap or bold contrarian statement (no clickbait without payoff).
- scenes: Exactly 5 scenes structured for 100%+ retention:
  * Scene 1 (0-3s Pattern Interrupt Hook): Visual: Rapid close-up motion or unexpected object. VO: Bold cognitive dissonance hook that shocks the viewer or directly overturns common knowledge.
  * Scene 2 (4-12s Tension & Story Agitation): Visual: Quick camera angle shift, showing the tension/conflict. VO: Introduces the real story, quoting the exact words from the brief.
  * Scene 3 (13-22s The Hard Proof): Visual: Kinetic visual switch, showing the physical number/metric in action. VO: Drops the empirical proof number and why it matters.
  * Scene 4 (23-35s The Epiphany/Shift): Visual: Pacing shift to calm clarity, revealing the solution or new paradigm. VO: Delivers the core insight or breakdown.
  * Scene 5 (36-45s The Seamless Infinite Loop): Visual: Dynamic closing framing that mirrors the opening visual cue. VO: Delivers the final takeaway and ends on a line that grammatically, seamlessly flows straight back into the very first word of Scene 1's hook! (When the video replays, the viewer doesn't notice where it started).
- frame_prompt: For each scene, a cinematic vertical 9:16 keyframe prompt, consistent characters, environment, and warm cinematic color grade throughout all 5 scenes, authentic Indian backdrop, NO text, NO letters.
- thumbnail_text: 2 to 4 high-contrast words in all caps for thumbnail overlay (e.g. 'SAAS IS DEAD').
- thumbnail_prompt: Vertical 9:16 striking high-contrast portrait or keyframe with dramatic lighting and clean negative space for bold typography, NO text.`,

  story: `Write an engaging 3-frame Instagram Story sequence designed for maximum engagement and direct message (DM) response.
- frames: Exactly 3 interactive frames:
  * Frame 1 (The Hook & Binary Poll): Punchy text under 14 words setting up the debate or contrarian observation. sticker: An interactive binary poll sticker label under 6 words (e.g. 'Agree? / Not quite' or 'Yes, daily / Never').
  * Frame 2 (The Proof / Behind-the-Scenes Teaser): Punchy text under 14 words revealing the real number or back-story snippet. sticker: An interactive reaction or rating sticker label under 6 words (e.g. 'Wild stat / Expected').
  * Frame 3 (The High-Value DM Trigger): Punchy text under 14 words offering a specific breakdown, resource, or early access. sticker: A direct call-to-action DM sticker under 5 words (e.g. 'DM me "VOICE"' or 'DM "PLAYBOOK"').
- image_prompt for each frame: Vertical 9:16 background, atmospheric lifestyle or founder workspace aesthetic, soft natural lighting, calm center area for text and stickers, Indian context, NO text, NO letters.`,

  ads: `Design 3 conversion-focused square ad posters for Instagram Feed and WhatsApp Status.
- posters: Exactly 3 posters in this order:
  * Poster 1 (kind: 'quote'): headline: The most memorable, provocative verbatim quote from the brief (under 10 words). sub: Punchy context clarifying why this quote reshapes everything (under 12 words).
  * Poster 2 (kind: 'stat'): headline: The hard proof number or statistic framed as an urgent cost-of-inaction (under 6 words, e.g. '33% OF CALLS LOST DAILY'). sub: The direct business impact in simple terms (under 12 words).
  * Poster 3 (kind: 'offer'): headline: A high-contrast, frictionless offer headline (under 6 words, e.g. 'HIRE YOUR FIRST AI WORKER'). sub: Irresistible value proposition with zero friction (under 12 words, e.g. 'Setup in 3 mins. Speaks Hindi. Never misses a lead.').
- image_prompt for each poster: Square 1:1 minimalist photograph with high visual contrast, singular focus subject, generous negative space positioned for bold headline typography, NO text, NO letters, NO logos.`,

  news: `Write a high-converting newsletter issue segment based on the brief.
- subject: High open-rate subject line under 50 characters blending curiosity + extreme specificity (e.g. 'The Indore sweet shop that rejected SaaS').
- preheader: 1-line curiosity gap under 75 characters that expands on the subject line without giving away the punchline.
- title: Compelling article headline for the email body.
- body: 170 to 220 words crafted as a personal story-driven lesson in 3-4 structured paragraphs:
  * Paragraph 1: The Scene & Friction - immediate narrative hook dropping the reader into the exact moment in Indore.
  * Paragraph 2: The Epiphany & Numbers - the counter-intuitive metric and what the market gets fundamentally wrong.
  * Paragraph 3: The Framework / Future Shift - the tactical takeaway that readers can apply to their own thinking today.
- cta: High-intent button text under 4 words (e.g. 'Read Full Breakdown' or 'Get The Playbook').
- hero_prompt: A panoramic landscape 16:9 editorial hero banner capturing the warmth and grit of the story, natural morning light, authentic Indian setting, NO text.`,

  cal: `Plan an optimized 7-day multi-channel publishing calendar distributing these generated assets across the week for maximum compounding reach and engagement.
- days: Exactly 7 days (Monday through Sunday), each with day, platform, asset (a specific descriptive title of the asset), and optimal IST posting time.`
};

// Backwards compatibility alias
export const JOB_PROMPTS = JOBS;

const S_STR = { type: "STRING" };
const arr = (items: any) => ({ type: "ARRAY", items });
const obj = (properties: any, required?: string[]) => ({
  type: "OBJECT",
  properties,
  required: required || Object.keys(properties)
});

export const SCHEMAS: Record<string, any> = {
  li: obj({ hook: S_STR, body: S_STR, hashtags: arr(S_STR), best_time: S_STR, image_prompt: S_STR }),
  x: obj({ posts: arr(S_STR), image_prompt: S_STR }),
  car: obj({
    slides: arr(obj({ title: S_STR, sub: S_STR, image_prompt: S_STR })),
    cover_art_prompt: S_STR,
    caption: S_STR
  }),
  short: obj({
    title: S_STR,
    scenes: arr(obj({ time: S_STR, visual: S_STR, vo: S_STR, frame_prompt: S_STR })),
    thumbnail_text: S_STR,
    thumbnail_prompt: S_STR
  }),
  story: obj({
    frames: arr(obj({ text: S_STR, sticker: S_STR, image_prompt: S_STR }))
  }),
  ads: obj({
    posters: arr(obj({ kind: S_STR, headline: S_STR, sub: S_STR, image_prompt: S_STR }))
  }),
  news: obj({
    subject: S_STR,
    preheader: S_STR,
    title: S_STR,
    body: S_STR,
    cta: S_STR,
    hero_prompt: S_STR
  }),
  cal: obj({
    days: arr(obj({ day: S_STR, platform: S_STR, asset: S_STR, time: S_STR }))
  })
};

export const DEMO_DATA = {
  lines: [
    { role: "ai" as const, text: FIRST_MESSAGE },
    { role: "you" as const, text: "Indian small businesses will hire AI employees before they ever buy software." },
    { role: "ai" as const, text: "Hmm, strong. What's the moment that made you believe it?" },
    { role: "you" as const, text: "A sweet shop owner in Indore told me: I don't want software, I want someone who picks up the phone." },
    { role: "ai" as const, text: "That's your hook right there. Any number to back it up?" },
    { role: "you" as const, text: "Most small shops miss about a third of their calls during rush hours. SaaS is too hard for Bharat. Employees, even AI ones, just work." },
    { role: "ai" as const, text: "Perfect, your week is building on screen right now. Watch the team." }
  ],
  args: {
    idea: "Indian small businesses will hire AI employees before they buy software",
    story: "A sweet shop owner in Indore said: 'I don't want software, I want someone who picks up the phone'",
    proof: "Small shops miss about a third of their calls, which is a third of their daily orders",
    hot_take: "SaaS is too hard for Bharat. Employees, even AI ones, just work",
    audience: "Indian small business owners, operators, and tech founders",
    quotes: "\"I don't want software. I want someone who picks up the phone.\" / \"Employees, even AI ones, just work.\""
  },
  out: {
    li: {
      hook: "\"I don't want software. I want someone who picks up the phone.\"\n\nAn Indore sweet shop owner taught me more about Bharat in 10 seconds than 50 SaaS pitch decks:",
      body: "He was not rejecting technology.\n\nHe was rejecting the friction of dashboards, logins, and dropdown menus when 10 customers are shouting orders across the counter.\n\nHere is the ground reality of small business in India:\n→ 33% of inbound phone calls are dropped during peak rush hours.\n→ Every dropped call is an order that walks straight to the shop next door.\n→ Dashboards do not take orders. Workers do.\n\nBharat will not adopt SaaS.\nBharat will hire AI employees that speak Hindi and just work.\n\nIf you run a business, would you rather manage software or hire an AI coworker who never misses a call?",
      hashtags: ["BharatCommerce", "ArtificialIntelligence", "SmallBusiness"],
      best_time: "Tuesday, 8:15 AM IST",
      image_prompt: "A traditional Indian mithai sweet shop counter in Indore, warm brass trays, morning sunlight streaming through the doorway, authentic documentary scene, no text."
    },
    x: {
      posts: [
        "\"I don't want software. I want someone who picks up the phone.\"\n\nA sweet shop owner in Indore said this last week.\n\nIt completely broke how I think about tech in Bharat.",
        "Most founders build for the top 5% of English-fluent corporate users.\n\nThey assume shop owners want dashboards and analytics.\n\nThey don't.\n\nBharat runs on voice, trust, and speed.",
        "A typical neighborhood shop in India misses roughly 33% of its inbound phone calls during peak rush hours.\n\nThat isn't an inconvenience.\n\nThat is 1/3rd of their daily revenue walking straight to the competitor next door.",
        "Software requires screen time, logins, and training.\n\nAn AI voice employee requires zero onboarding:\n→ Answers instantly in fluent Hindi\n→ Takes and confirms the order\n→ Updates the ledger on WhatsApp",
        "The next multi-billion-dollar wave in emerging markets will not be 'SaaS for SMBs'.\n\nIt will be autonomous digital coworkers executing real frontline tasks quietly in the background.",
        "Bharat will skip the software era entirely and go straight to AI employees that just work.\n\nIf this resonated:\n1. Follow for more breakdowns on AI in the real economy.\n2. Repost tweet 1 to share with other builders."
      ],
      image_prompt: "Busy market street in an Indian city with bustling shops, photorealistic documentary style, warm sunrise lighting, authentic street commerce, no text."
    },
    car: {
      slides: [
        {
          title: "\"I don't want software. Just answer the phone.\"",
          sub: "Why 60M Indian merchants will skip SaaS and hire AI coworkers",
          image_prompt: "Warm editorial documentary photography of an authentic Indian sweet shop merchant behind a wooden counter, soft morning daylight, muted clay and brass tones, vertical 4:5 composition, calm negative space in lower half, no text."
        },
        {
          title: "The SaaS Dashboard Trap",
          sub: "Founders build complex portals for merchants who run purely on voice and speed",
          image_prompt: "Warm editorial documentary photography of an old wooden ledger desk with a ringing smartphone, soft morning daylight, muted clay and brass tones, vertical 4:5 composition, calm negative space in lower half, no text."
        },
        {
          title: "The 33% Leaking Bucket",
          sub: "1 in 3 customer calls go unanswered during rush hours. Swipe for the shift →",
          image_prompt: "Warm editorial documentary photography of bustling Indore bazaar commerce in morning mist, muted clay and brass tones, vertical 4:5 composition, calm negative space in lower half, no text."
        },
        {
          title: "The Voice-First AI Worker",
          sub: "Zero logins. Answers in Hindi. Pushes orders directly to WhatsApp. Swipe for checklist →",
          image_prompt: "Warm editorial documentary photography of a modern Indian smartphone resting on brass display tray, muted clay and brass tones, vertical 4:5 composition, calm negative space in lower half, no text."
        },
        {
          title: "The 3-Step AI Transition",
          sub: "Audit missed calls → Deploy voice agent → Automate WhatsApp. Save this checklist!",
          image_prompt: "Warm editorial documentary photography of an Indian shopkeeper smiling warmly at a customer, soft morning daylight, muted clay and brass tones, vertical 4:5 composition, calm negative space in lower half, no text."
        }
      ],
      cover_art_prompt: "Warm editorial documentary photography of an authentic Indian sweet shop merchant behind a wooden counter, soft morning daylight, muted clay and brass tones, vertical 4:5 composition, calm negative space in lower half, no text.",
      caption: "Why Bharat will skip SaaS and hire AI voice workers directly. A 10-second lesson from an Indore sweet shop owner. Save this breakdown for later. #BharatTech #AIWorkers #SmallBusiness"
    },
    short: {
      title: "Why 60M Indian Shops Will Never Buy Software",
      scenes: [
        {
          time: "0-3s",
          visual: "Rapid camera push-in on an Indore sweet shop counter with phones ringing uncontrollably",
          vo: "Every software company in India is building for the wrong 99% of businesses.",
          frame_prompt: "Cinematic vertical 9:16 keyframe of a traditional Indian sweet shop glass counter, warm morning lighting, documentary style, no text."
        },
        {
          time: "4-12s",
          visual: "Busy merchant hand-rolling fresh sweets while ignoring a ringing smartphone on his wooden desk",
          vo: "I tried selling software to a sweet shop owner in Indore. He closed my laptop and said: I don't want software. I want someone who answers the phone.",
          frame_prompt: "Cinematic vertical 9:16 keyframe of busy Indian shopkeeper rolling sweets while smartphone screen glows on table, warm morning lighting, documentary style, no text."
        },
        {
          time: "13-22s",
          visual: "Pacing quickens as red graphic highlight shows 33% missed call rate over shop cash ledger",
          vo: "Here is why: Indian shops miss 33% of their customer calls during rush hours. That's a third of their daily revenue gone.",
          frame_prompt: "Cinematic vertical 9:16 keyframe of merchant cash drawer, Indian rupee notes, and smartphone, soft focus, warm morning lighting, documentary style, no text."
        },
        {
          time: "23-35s",
          visual: "Smooth transition showing AI voice agent answering on speakerphone in fluent Hindi while merchant smiles",
          vo: "They don't have time to stare at dashboards. But an AI employee that speaks Hindi and confirms orders on WhatsApp? It just works.",
          frame_prompt: "Cinematic vertical 9:16 keyframe of smiling shopkeeper listening to speakerphone on wooden counter, warm morning lighting, documentary style, no text."
        },
        {
          time: "36-45s",
          visual: "Merchant happily handing a packed mithai box to customer, camera pans up back to the bustling storefront",
          vo: "Bharat is skipping software completely to hire AI workers... and that's the exact reason why...",
          frame_prompt: "Cinematic vertical 9:16 keyframe of Indian sweet shop storefront at golden hour with customers, warm morning lighting, documentary style, no text."
        }
      ],
      thumbnail_text: "NO MORE SAAS",
      thumbnail_prompt: "Dramatic cinematic vertical 9:16 portrait of an Indian merchant with intense expressive focus, atmospheric morning side-lighting, clean empty top third for bold typography, no text."
    },
    story: {
      frames: [
        {
          text: "\"I don't want software. Just answer the phone.\"",
          sticker: "Do you agree? (100% Yes / SaaS is fine)",
          image_prompt: "Vertical 9:16 background of warm wooden desk with Indian ledger and brass pen, soft morning lighting, calm center area, no text."
        },
        {
          text: "Small shops miss 33% of customer calls during rush hour. That is 1/3rd revenue lost.",
          sticker: "Did you know this? (Shocking / Expected)",
          image_prompt: "Vertical 9:16 background of bustling Indore market street with blurred morning motion, warm cinematic tones, calm center area, no text."
        },
        {
          text: "We built an AI voice worker that answers in Hindi and takes orders in 3 seconds.",
          sticker: "DM 'VOICE' for demo",
          image_prompt: "Vertical 9:16 clean minimalist background with subtle Indian handcrafted textures, warm beige and ivory, calm center area, no text."
        }
      ]
    },
    ads: {
      posters: [
        {
          kind: "quote",
          headline: "\"I don't want software. I want someone who answers.\"",
          sub: "What an Indore sweet shop owner taught us about the real Bharat economy.",
          image_prompt: "Square 1:1 minimalist photograph of an authentic Indian brass bell on wooden counter, morning light, calm space for text, no text."
        },
        {
          kind: "stat",
          headline: "33% OF CALLS LOST DAILY",
          sub: "Stop losing peak hour orders. Zero missed calls with 24/7 AI voice response.",
          image_prompt: "Square 1:1 high contrast shot of old Indian telephone receiver and modern smartphone side by side, clean dark backdrop, no text."
        },
        {
          kind: "offer",
          headline: "HIRE YOUR FIRST AI WORKER",
          sub: "Setup in 3 minutes. Zero tech skills. Speaks fluent Hindi & English.",
          image_prompt: "Square 1:1 clean modern shot of a confident Indian founder in casual jacket, warm natural lighting, spacious negative space, no text."
        }
      ]
    },
    news: {
      subject: "The sweet shop that killed our SaaS",
      preheader: "He closed my laptop in 10 seconds. Here is the 1 number that changed everything.",
      title: "Why 60 Million Indian Merchants Will Skip Software Entirely",
      body: "Last week, I sat down with a sweet shop owner in Indore to demo our new management software. Two minutes into the presentation, he gently reached across the counter and closed my laptop.\n\n\"Beta,\" he told me, \"I don't want software. I want someone who answers the phone when ten customers are shouting orders across the counter.\"\n\nIn that single ten-second sentence, he exposed what the tech industry keeps getting wrong about Bharat. Small business owners do not have the time or patience to become dashboard operators. They have one urgent, acute leak: 33% of inbound customer calls go unanswered during rush hours. In Indian retail, a dropped call isn't an inconvenience—it's cash walking straight to the shop next door.\n\nThe next breakthrough in emerging markets won't come from another SaaS subscription. It will come from autonomous AI employees that speak local dialects, answer calls instantly, and do the job quietly in the background.",
      cta: "Read The Full Playbook",
      hero_prompt: "Panoramic 16:9 editorial banner of an artisan Indian sweet kitchen with warm copper pots and natural morning window light, no text."
    },
    cal: {
      days: [
        { day: "Monday", platform: "LinkedIn", asset: "Founder Post: Justin Welsh 3-Line Hook & Indore Story", time: "8:15 AM IST" },
        { day: "Tuesday", platform: "X (Twitter)", asset: "6-Tweet High Retention Thread: The Death of SaaS in Bharat", time: "11:00 AM IST" },
        { day: "Wednesday", platform: "Instagram", asset: "5-Slide Carousel: The 33% Leaking Bucket (AIDA Funnel)", time: "5:30 PM IST" },
        { day: "Thursday", platform: "YouTube Shorts", asset: "45-Second Short: Seamless Infinite Loop Retention Script", time: "7:00 PM IST" },
        { day: "Friday", platform: "Instagram Stories", asset: "3-Frame Story Sequence: Binary Polls & 'VOICE' DM Trigger", time: "12:30 PM IST" },
        { day: "Saturday", platform: "Ad Posters", asset: "3 High-Contrast 1:1 Conversion Posters (Feed & WhatsApp)", time: "10:00 AM IST" },
        { day: "Sunday", platform: "Newsletter", asset: "Story-Driven Deep Dive: The Sweet Shop That Killed SaaS", time: "9:00 AM IST" }
      ]
    }
  }
};
