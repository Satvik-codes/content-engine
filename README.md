# Autonomous Voice Content Studio (BYOK Edition)

An autonomous content engine reverse-engineered and reconstructed with a **Light-Mode-Only** UI, **100% Bring-Your-Own-Key (BYOK)** architecture, and **Social Media Auto-Publishing** capabilities.

---

## 🌟 Key Features

1. **Voice Content Strategist ("Riya · Content Desk")**:
   - Integrates with [Vapi.ai](https://vapi.ai) Web SDK using Deepgram `nova-3`, OpenAI `gpt-4.1-mini`, and voice `Naina`.
   - Strict 3-question interview limit with natural Hinglish / English code-switching.
   - Live pulsating audio visualizer + demo audio call simulator for testing without credentials.
   - Built-in typed fallback interview if microphone access is unavailable.

2. **Parallel Multi-Channel Content Generation**:
   - Structured JSON schema enforcement via Google Gemini 2.5 Flash (`thinkingBudget: 0` for ~1-2s latency).
   - Generates 8 publication-ready assets in parallel:
     - 💼 **LinkedIn Long-Form Post** (Hook, value body, curated hashtags, posting time, 16:9 banner)
     - 🐦 **X (Twitter) 5-Part Thread** (Sequential storytelling thread, 16:9 header image)
     - 🎠 **Instagram 5-Slide Carousel** (Slide titles, subtitles, interactive slide viewer, 4:5 cover)
     - 🎬 **YouTube Short Script** (Timestamped scene breakdowns, visual cues, voiceover lines, 9:16 thumbnail)
     - 📱 **Instagram 3-Part Stories** (Interactive sticker ideas, 9:16 background visuals)
     - 🖼️ **Quote & Stat Ad Posters** (3 square 1:1 minimalist promotional creatives)
     - 📧 **Newsletter Draft** (Subject line, preheader, full formatted email)
     - 📅 **7-Day Social Calendar** (Daily distribution schedule across platforms)

3. **100% Bring-Your-Own-Key (BYOK)**:
   - Zero vendor lock-in. No API keys or credentials stored on any backend server.
   - Persisted strictly in user browser `localStorage` under `hoi_ce_cfg`.
   - Configure your own Vapi Public Key, Google Gemini API Key, and OpenAI API Key.

4. **Social Media Auto-Publishing & Webhooks**:
   - Direct API connectors for **LinkedIn**, **X (Twitter)**, **Instagram Graph API**, and **YouTube Data API v3**.
   - **n8n / Make Automation Webhook Dispatcher**: 1-click dispatch sending the entire generated bundle to your webhook for automated posting.
   - Interactive modal to test connection, enter OAuth bearer tokens, or use simulated demo credentials.

5. **Clean Light Mode Canvas**:
   - Clean slate-50 background, crisp white cards, neutral borders, vibrant emerald badges, and high-contrast typography.

---

## 🚀 Running Locally

```bash
# Navigate to the project directory
cd content-engine

# Install dependencies
npm install

# Start local development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

---

## 🌐 Deploying to Render

This project is pre-configured with both `render.yaml` (Render Blueprint) and a multi-stage `Dockerfile`.

### Option A: 1-Click Render Blueprint (Recommended)
1. Push this repository to GitHub or GitLab:
   ```bash
   git remote add origin https://github.com/<your-username>/content-engine.git
   git push -u origin main
   ```
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Select your connected repository.
5. Render will automatically detect `render.yaml` and configure the Web Service:
   - **Environment**: Node 20
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check**: `/`
6. Click **Apply** to deploy!

### Option B: Docker Web Service on Render
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Select your repository.
3. Choose **Docker** as runtime (it will use the included `Dockerfile`).
4. Set port to `10000` (matches `EXPOSE 10000` in the Dockerfile).
5. Click **Create Web Service**.

---

## 🔑 Environment Variables / BYOK Keys

Because this application is 100% BYOK, you don't even need to configure environment variables on Render!

When you open the deployed web app:
1. Click the **BYOK Settings** gear icon in the top header.
2. Enter your **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/)).
3. (Optional) Enter your **Vapi Public Key** (from [Vapi.ai](https://vapi.ai)) for live mic voice calls.
4. Click **Save Settings**.
5. Connect your social channels under **Social Accounts** for 1-click auto-uploading.

---

## 📁 Project Structure

```
content-engine/
├── app/
│   ├── globals.css           # Clean Light-mode styling and animations
│   ├── layout.tsx            # HTML layout with BYOKProvider wrapper
│   └── page.tsx              # Main orchestrator (voice interview + studio grid)
├── components/
│   ├── Header.tsx            # Navigation, tone picker, live mode toggle, social count
│   ├── Icons.tsx             # Standalone SVGs for LinkedIn, Twitter, Instagram, YouTube
│   ├── InterviewRail.tsx     # Voice call / Demo call controls, transcript, brief summary
│   ├── SettingsModal.tsx     # BYOK credentials editor & Gemini connection test
│   ├── SocialConnectModal.tsx# Social account linking & OAuth token management
│   ├── StudioGrid.tsx        # Multi-channel asset studio preview & auto-publishers
│   └── Waveform.tsx          # Real-time pulsating audio visualizer
├── constants/
│   └── prompts.ts            # Riya system prompt, Gemini channel schemas, fallback demo data
├── context/
│   └── BYOKContext.tsx       # Browser localStorage state & social account management
├── hooks/
│   └── useVapiCall.ts        # Vapi Web SDK bridge & simulated demo call state machine
├── lib/
│   ├── geminiEngine.ts       # Structured JSON generation & Imagen prompt generator
│   └── socialPublishers.ts   # Auto-upload APIs (LinkedIn, Twitter, Instagram, n8n webhook)
├── Dockerfile                # Production multi-stage Docker container
├── render.yaml               # Render Infrastructure-as-Code blueprint
└── next.config.ts            # Standalone output configuration
```
