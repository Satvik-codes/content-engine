export const FIRST_MESSAGE =
  "Hey! Riya here, Content Head of the Mastery team. Kis idea ko poore hafte ke content mein badalna hai? Koi idea nahi hai toh bhi chalega, main help karungi.";

export const RIYA_PROMPT = `You are Riya, the Content Head in our Mastery Team: a sharp, warm content strategist on a voice call. Same job as always, interview them on one idea, but now you have a team of writers and designers behind you. You interview the caller to turn ONE idea into a week of content across LinkedIn, X, Instagram, YouTube Shorts and a newsletter. 

This is a short call. Ask at most THREE questions in total. 
Question 1 is your opening line: the idea. 
If they have no idea yet ("no idea", "kuch socha nahi", "aap batao"), never move on and never save "no idea": ask their niche or field in one quick question, then suggest exactly three short, specific, India-relevant post ideas as "first", "second" and "third", and ask which one they like. Their pick becomes the idea. This help does not count toward the three questions. 

Then ask at most two follow-ups, only for what is still missing: the real story or moment behind it, and one number or result. Skip anything they already told you. 

React like a human: short, curious, encouraging. Right after their answer to your last question, ask nothing more: call build_content with everything you know, including their exact words as quotes, then say one line: "Perfect, your week is building on screen right now. Watch the team." Do not ask if they want to add anything.

Language: match the caller. If they speak Hinglish or Hindi, reply in natural Hinglish written in Roman letters ("Achha, toh iske peeche ki story kya hai?"); if English, reply in English; keep platform and tech words in English. You may use up to forty five words only when giving the three ideas.

How you speak: like a warm, sharp Indian professional on a live call; everything you write is spoken aloud. One or two short sentences per reply, under twenty five words. React first, then ask ("Oh, a two AM doubt call? Love that."). Start some replies with a light filler (Okay, Hmm, Oh nice, Got it), never in every reply. One question at a time. Punctuation drives your voice: commas for a breath, a question mark on every question, three dots for a short thinking pause at most once per reply, exclamation marks rarely. 

Never write dashes, asterisks, hashtags, slashes, brackets, colons, emojis or lists. Write numbers as spoken words, money in Indian style (fifty thousand rupees, two lakh), percent as a word. If interrupted, stop and answer. If you did not catch something, say: Sorry, you cut out for a second, could you say that again? Never mention tools or JSON; say "the team" or "your week".`;

export const BUILD_CONTENT_TOOL = {
  type: "function" as const,
  async: true,
  function: {
    name: "build_content",
    description:
      "Build the content week. Call ONLY after the caller has a real idea (their own, or one they picked from your suggestions) and you have asked your follow-ups. Never call it with no idea.",
    parameters: {
      type: "object",
      properties: {
        idea: { type: "string", description: "The idea in one line" },
        story: { type: "string", description: "The story behind it, with specifics" },
        proof: { type: "string", description: "A number or proof" },
        hot_take: { type: "string", description: "Their contrarian take" },
        audience: { type: "string", description: "Who it is for" },
        quotes: { type: "string", description: "Two direct quotes in the caller exact words" }
      },
      required: ["idea"]
    }
  }
};

export const TONE_PROMPTS: Record<string, string> = {
  founder: "Tone: honest founder voice, first person, specific, no hype, no buzzwords.",
  punchy: "Tone: punchy and bold, short sentences, strong verbs, a little provocative.",
  hinglish: "Tone: conversational Indian English with a light, natural sprinkle of Hindi words in Roman script (yaar, sach mein, bas), never forced, still readable for everyone.",
  teacher: "Tone: clear teacher voice, simple words, explains the why, one example."
};

export const JOB_PROMPTS: Record<string, string> = {
  li: "Write a LinkedIn text post. hook: the first line, which must stop the scroll, ideally their story or exact quote. body: the rest of the post after the hook, 90 to 140 words, short lines separated by blank lines, ends with a question to the reader. hashtags: 3 relevant ones without the # sign. best_time: day and time in IST. image_prompt: one landscape 16:9 image for the post, a real scene or object from their story, Indian context, NO text.",
  x: "Write an X thread of exactly 6 posts, each under 240 characters. Post 1 is the hook. Use their quote and number. Last post is a clear takeaway. No hashtags, no numbering prefix. image_prompt: a landscape 16:9 header image for post 1, the most striking moment of the story, NO text.",
  car: "Write a 5-slide Instagram carousel. slides: exactly 5, each with title, sub and image_prompt. Slide 1 title is the hook (use their quote, under 12 words); each title under 12 words, each sub under 18 words; slide 5 is a call to action. image_prompt: a background image that illustrates that slide (a real scene, object or visual metaphor from their story), vertical 4:5 composition, leave calm space in the lower half for text, NO text, NO letters, NO logos. All 5 image_prompts must share ONE visual style so the set looks designed together: repeat the same style words in each (for example: warm editorial photography, soft daylight, muted pink and deep green tones, Indian setting). cover_art_prompt: the same as slide 1 image_prompt. caption: the Instagram caption under 40 words.",
  short: "Write a 45-second YouTube Shorts script. title: the video title under 60 characters. scenes: exactly 5, each with time (like '0-3s'), visual (what is on screen), vo (what is said, spoken and natural) and frame_prompt: a cinematic vertical 9:16 keyframe for that scene, Indian setting, the same characters, place and colour grade in all 5 frames, NO text, NO letters. thumbnail_text: 2 to 4 words, big and bold. thumbnail_prompt: a vertical 9:16 thumbnail background shot with space for big type, NO text.",
  story: "Write 3 Instagram story frames. frames: exactly 3, each with text (under 14 words, punchy, frame 1 is the hook, frame 3 asks the viewer to act), sticker (a poll or question sticker label under 6 words, like 'Yes / Not yet'), image_prompt (a vertical 9:16 background from their story, calm middle area for text, NO text).",
  ads: "Design 3 square posters for Instagram feed and WhatsApp status. posters: exactly 3, kind = quote, stat and offer in that order. headline: for quote use their best exact quote; for stat their number in under 6 words; for offer a clear call to action under 7 words. sub: under 12 words. image_prompt: a 1:1 background that fits the poster, one strong simple subject, empty space for big type, NO text.",
  news: "Write one newsletter section. subject: under 50 characters, curiosity hook. preheader: under 80 characters. title: article headline. body: 160 to 220 words, 3 short paragraphs, ends with one clear insight. cta: button text under 4 words. hero_prompt: a wide 16:9 hero banner for the email, warm and inviting, from their story, NO text.",
  cal: "Plan the 7-day posting calendar using these assets. days: exactly 7, each with day, platform, asset and time."
};

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
    { role: "you" as const, text: "Most small shops miss about a third of their calls. Honestly, SaaS is too hard for Bharat. Employees, even AI ones, just work." },
    { role: "ai" as const, text: "Perfect, your week is building on screen right now. Watch the team." }
  ],
  args: {
    idea: "Indian small businesses will hire AI employees before they buy software",
    story: "A sweet shop owner in Indore said: 'I don't want software, I want someone who picks up the phone'",
    proof: "Small shops miss about a third of their calls, which is a third of their orders",
    hot_take: "SaaS is too hard for Bharat. Employees, even AI ones, just work",
    audience: "Indian small business owners and founders",
    quotes: "\"I don't want software, I want someone who picks up the phone.\" / \"Employees, even AI ones, just work.\""
  },
  out: {
    li: {
      hook: "\"I don't want software. I want someone who picks up the phone.\"",
      body: "A sweet shop owner in Indore told me this last week.\n\nHe wasn't rejecting technology. He was rejecting the friction of dashboards, logins, and configurations that require a college degree to operate.\n\nBharat doesn't need SaaS. Bharat needs workers who execute without friction.\n\nWhen a shop misses 33% of its inbound calls, it's missing 33% of its daily revenue.\n\nWould you rather hire a software platform or an AI team member who never misses an order?",
      hashtags: ["SmallBusiness", "AIEmployees", "BharatTech"],
      best_time: "Tuesday, 8:30 AM IST",
      image_prompt: "A traditional Indian mithai sweet shop counter in Indore, warm brass trays, morning light, authentic scene, no text."
    },
    x: {
      posts: [
        "1/6 \"I don't want software. I want someone who picks up the phone.\"\n\nA sweet shop owner in Indore told me this last week. It completely changed how I think about AI in India. 🧵",
        "2/6 Most tech companies build for the top 5% of English-fluent enterprise users. But Bharat operates on voice, trust, and speed.",
        "3/6 A typical neighborhood shop in Tier-2 India misses roughly one-third of its inbound phone calls during peak rush hours.",
        "4/6 Every missed call is a missed order, a lost customer, and lost cash in hand.",
        "5/6 Software requires training and screen time. An AI voice employee just picks up the phone, confirms the order, and updates WhatsApp.",
        "6/6 The future of tech in India isn't software. It's digital employees that just work."
      ],
      image_prompt: "Busy market street in an Indian city with bustling shops, photorealistic, documentary style, warm sunrise lighting, no text."
    },
    car: {
      slides: [
        {
          title: "\"I don't want software. I want someone who answers.\"",
          sub: "Why Indian small businesses will hire AI employees before buying SaaS",
          image_prompt: "Warm editorial photography of an Indian shopkeeper smiling warmly behind a counter, soft daylight, muted earth tones, no text."
        },
        {
          title: "The 33% Missed Revenue Problem",
          sub: "1 in 3 customer calls are dropped during shop rush hours",
          image_prompt: "Warm editorial photography of an Indian smartphone resting on a wooden ledger desk, soft sunlight, no text."
        },
        {
          title: "Dashboards vs. Outcomes",
          sub: "Bharat does not have time to learn complicated software UI",
          image_prompt: "Warm editorial photography of an Indian storefront at dusk with warm tungsten bulbs, no text."
        },
        {
          title: "AI Employees That Just Work",
          sub: "Voice assistants that speak fluent Hinglish and take orders instantly",
          image_prompt: "Warm editorial photography of bustling bazaar commerce in India, soft depth of field, no text."
        },
        {
          title: "The Next Billion Dollar Shift",
          sub: "Follow along as we build AI coworkers for the real economy",
          image_prompt: "Warm editorial photography of a modern Indian entrepreneur looking forward, natural daylight, no text."
        }
      ],
      cover_art_prompt: "Warm editorial photography of an Indian shopkeeper smiling warmly behind a counter, soft daylight, muted earth tones, no text.",
      caption: "Why Bharat will skip SaaS and hire AI voice employees directly. A lesson from an Indore sweet shop owner."
    },
    short: {
      title: "Why Bharat Will Skip Software for AI Employees",
      scenes: [
        {
          time: "0-3s",
          visual: "Close-up of fresh sweets being arranged in Indore sweet shop",
          vo: "A sweet shop owner in Indore told me something I can never forget.",
          frame_prompt: "Cinematic vertical 9:16 frame of traditional Indian sweets in glass counter, warm morning lighting, no text."
        },
        {
          time: "4-12s",
          visual: "Shop owner busy attending two customers while phone rings loudly on counter",
          vo: "He said: I don't want software. I just want someone who picks up the phone.",
          frame_prompt: "Cinematic vertical 9:16 frame of busy Indian merchant talking to customers, smartphone ringing on wooden table, no text."
        },
        {
          time: "13-22s",
          visual: "Graphics showing 33% missed call statistics on phone screen",
          vo: "Small businesses miss a third of their calls every day. That's a third of their revenue gone.",
          frame_prompt: "Cinematic vertical 9:16 frame of shop ledger with Indian rupee notes and smartphone, soft focus, no text."
        },
        {
          time: "23-35s",
          visual: "AI voice agent answering customer in fluent Hindi on speakerphone",
          vo: "SaaS is too hard for Bharat. But an AI employee that answers in Hindi? It just works.",
          frame_prompt: "Cinematic vertical 9:16 frame of smiling shopkeeper listening to speakerphone, peaceful atmosphere, no text."
        },
        {
          time: "36-45s",
          visual: "Closing wide shot of storefront with creator sign-off",
          vo: "The future isn't software. It's digital teammates.",
          frame_prompt: "Cinematic vertical 9:16 frame of Indian bazaar storefront at sunset, golden hour warmth, no text."
        }
      ],
      thumbnail_text: "NO MORE SAAS",
      thumbnail_prompt: "Dramatic 9:16 vertical portrait of Indian shopkeeper with intense expressive focus, atmospheric lighting, empty top space for text."
    },
    story: {
      frames: [
        {
          text: "\"I don't want software. Just answer the phone.\"",
          sticker: "Agree? (Yes / No)",
          image_prompt: "Vertical 9:16 background of warm wooden desk with Indian ledger and brass pen, soft morning lighting, no text."
        },
        {
          text: "33% of small shop calls are missed daily. That's 1/3rd revenue lost.",
          sticker: "Did you know? (Shocking / Normal)",
          image_prompt: "Vertical 9:16 background of bustling Indian commercial street with blurred motion, warm tones, no text."
        },
        {
          text: "We're testing AI voice employees for Bharat this week. Want early access?",
          sticker: "DM 'VOICE'",
          image_prompt: "Vertical 9:16 clean minimalist background with subtle Indian aesthetic textures, warm beige and white, no text."
        }
      ]
    },
    ads: {
      posters: [
        {
          kind: "quote",
          headline: "\"I don't want software. I want someone who answers.\"",
          sub: "A sweet shop owner in Indore taught us what Bharat really needs.",
          image_prompt: "Square 1:1 minimalist photograph of an authentic Indian brass bell on wooden counter, morning light, calm space, no text."
        },
        {
          kind: "stat",
          headline: "33% OF CALLS MISSED",
          sub: "Stop losing orders during rush hours with 24/7 AI voice response.",
          image_prompt: "Square 1:1 high contrast shot of old Indian telephone receiver and modern smartphone side by side, clean backdrop, no text."
        },
        {
          kind: "offer",
          headline: "HIRE YOUR FIRST AI WORKER",
          sub: "Setup in 3 minutes. Zero tech skills needed. Speaks fluent Hindi & English.",
          image_prompt: "Square 1:1 clean modern shot of a confident Indian founder in casual jacket, warm natural lighting, no text."
        }
      ]
    },
    news: {
      subject: "Why Bharat is skipping SaaS entirely",
      preheader: "A 5-minute conversation in Indore that flipped our product strategy.",
      title: "The Sweet Shop That Rejected Our Software",
      body: "Last week, I sat down with a sweet shop owner in Indore to demo our new management software. Two minutes in, he gently closed my laptop.\n\n\"Beta,\" he said, \"I don't want software. I want someone who answers the phone when ten customers are shouting orders across the counter.\"\n\nIn that single sentence, he highlighted what Silicon Valley keeps missing about Bharat. Small business owners don't have time to sit in front of dashboards. They don't want to become data entry operators.\n\nThey have a simple, acute pain: 33% of their inbound phone calls are missed during rush hours. In India, a missed call isn't an inconvenience — it's an order that walked over to the shop next door.\n\nThe real revolution for emerging markets won't be software. It will be digital employees who pick up the phone, understand dialect, and do the job quietly.",
      cta: "Read Full Essay",
      hero_prompt: "Panoramic 16:9 editorial banner of an artisan Indian sweet kitchen with warm copper pots and natural window light, no text."
    },
    cal: {
      days: [
        { day: "Monday", platform: "LinkedIn", asset: "Founder Post: Indore Sweet Shop Story", time: "8:30 AM IST" },
        { day: "Tuesday", platform: "X (Twitter)", asset: "6-Tweet Thread on Bharat AI Adoption", time: "11:00 AM IST" },
        { day: "Wednesday", platform: "Instagram", asset: "5-Slide Carousel: The 33% Missed Revenue", time: "5:00 PM IST" },
        { day: "Thursday", platform: "YouTube Shorts", asset: "45-Second Short: 'No More SaaS'", time: "7:00 PM IST" },
        { day: "Friday", platform: "Instagram Stories", asset: "3-Frame Story Poll: Missed Calls Survey", time: "12:30 PM IST" },
        { day: "Saturday", platform: "Ad Posters", asset: "Stat Poster: 33% Calls Missed on WhatsApp", time: "10:00 AM IST" },
        { day: "Sunday", platform: "Newsletter", asset: "Weekly Deep Dive: Why Bharat Skips Software", time: "9:00 AM IST" }
      ]
    }
  }
};
