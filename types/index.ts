export type ToneType = "founder" | "punchy" | "hinglish" | "teacher";
export type ModeType = "demo" | "live" | "typed";
export type SocialPlatform = "linkedin" | "twitter" | "instagram" | "youtube";

export interface SocialAccount {
  connected: boolean;
  accountName?: string;
  avatarUrl?: string;
  accessToken?: string;
  userId?: string;
  expiresAt?: number;
}

export interface SocialAccountsState {
  linkedin: SocialAccount;
  twitter: SocialAccount;
  instagram: SocialAccount;
  youtube: SocialAccount;
}

export interface BYOKConfig {
  vapiPublicKey: string;
  vapiAssistantId?: string;
  geminiApiKey: string;
  openaiApiKey?: string;
  creatorName: string;
  creatorRole: string;
  preferredTone: ToneType;
  voiceId: string;
  textModel: string;
  imageModel: string;
  n8nWebhookUrl: string;
  notificationEmail: string;
  socialAccounts: SocialAccountsState;
}

export interface BriefArgs {
  idea: string;
  story?: string;
  proof?: string;
  hot_take?: string;
  audience?: string;
  quotes?: string;
}

export interface TranscriptLine {
  role: "ai" | "you";
  text: string;
  timestamp?: number;
}

// 1. LinkedIn Post
export interface LinkedInAsset {
  hook: string;
  body: string;
  hashtags: string[];
  best_time: string;
  image_prompt: string;
  imageUrl?: string;
}

// 2. X (Twitter) Thread
export interface XThreadAsset {
  posts: string[];
  image_prompt: string;
  imageUrl?: string;
}

// 3. Instagram Carousel
export interface CarouselSlide {
  title: string;
  sub: string;
  image_prompt: string;
  imageUrl?: string;
}

export interface CarouselAsset {
  slides: CarouselSlide[];
  cover_art_prompt: string;
  caption: string;
  coverImageUrl?: string;
}

// 4. YouTube Short
export interface ShortScene {
  time: string;
  visual: string;
  vo: string;
  frame_prompt: string;
  imageUrl?: string;
}

export interface ShortScriptAsset {
  title: string;
  scenes: ShortScene[];
  thumbnail_text: string;
  thumbnail_prompt: string;
  thumbnailUrl?: string;
}

// 5. Instagram Stories
export interface StoryFrame {
  text: string;
  sticker: string;
  image_prompt: string;
  imageUrl?: string;
}

export interface StoryAsset {
  frames: StoryFrame[];
}

// 6. Ad Posters
export interface PosterItem {
  kind: "quote" | "stat" | "offer";
  headline: string;
  sub: string;
  image_prompt: string;
  imageUrl?: string;
}

export interface AdsAsset {
  posters: PosterItem[];
}

// 7. Newsletter
export interface NewsletterAsset {
  subject: string;
  preheader: string;
  title: string;
  body: string;
  cta: string;
  hero_prompt: string;
  heroImageUrl?: string;
}

// 8. Posting Calendar
export interface CalendarDay {
  day: string;
  platform: string;
  asset: string;
  time: string;
}

export interface CalendarAsset {
  days: CalendarDay[];
}

export interface GeneratedWeek {
  li?: LinkedInAsset;
  x?: XThreadAsset;
  car?: CarouselAsset;
  short?: ShortScriptAsset;
  story?: StoryAsset;
  ads?: AdsAsset;
  news?: NewsletterAsset;
  cal?: CalendarAsset;
}

export interface ChannelStatus {
  writing: boolean;
  generatingImages: boolean;
  done: boolean;
  error?: string;
}
