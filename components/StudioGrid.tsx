"use client";

import React, { useState } from "react";
import { GeneratedWeek, ChannelStatus } from "@/types";
import { useBYOK } from "@/context/BYOKContext";
import {
  publishToLinkedIn,
  publishToTwitter,
  publishToInstagramCarousel,
  dispatchToN8nWebhook
} from "@/lib/socialPublishers";
import { LinkedinIcon, TwitterIcon, InstagramIcon, YoutubeIcon } from "./Icons";
import {
  Calendar,
  Sparkles,
  Copy,
  Check,
  Send,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Download,
  FileText,
  RefreshCw,
  Eye,
  LayoutGrid,
  AlertCircle,
  X as CloseIcon,
  Mic,
  Clapperboard,
  Mail,
  Layers,
  ArrowRight
} from "lucide-react";

interface StudioGridProps {
  content: GeneratedWeek;
  status: Record<string, ChannelStatus>;
  isBuilding?: boolean;
  onRegenerateChannel?: (channel: string) => void;
  onRegenerateImage?: (channel: string, prompt: string, aspect: "1:1" | "16:9" | "4:5" | "9:16") => void;
}

interface ToastNotification {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

/**
 * Download text or SVG file client-side
 */
function downloadClientFile(filename: string, content: string, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate downloadable SVG graphic for a carousel slide
 */
function downloadSlideSvg(slideNum: number, title: string, sub: string) {
  const cleanTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const cleanSub = sub.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f43f5e" />
        <stop offset="100%" stop-color="#fb7185" />
      </linearGradient>
    </defs>
    <rect width="1080" height="1350" fill="url(#bg)"/>
    <circle cx="950" cy="150" r="300" fill="#f43f5e" opacity="0.08"/>
    <circle cx="100" cy="1200" r="250" fill="#38bdf8" opacity="0.05"/>
    <rect x="80" y="80" width="140" height="44" rx="22" fill="#f43f5e" opacity="0.2"/>
    <text x="150" y="108" fill="#fda4af" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" text-anchor="middle">SLIDE ${slideNum}/5</text>
    <g transform="translate(80, 720)">
      <foreignObject width="920" height="520">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: system-ui, -apple-system, sans-serif; color: white;">
          <h1 style="font-size: 54px; font-weight: 800; line-height: 1.25; margin-bottom: 24px; color: #ffffff;">${cleanTitle}</h1>
          <p style="font-size: 32px; font-weight: 400; line-height: 1.45; color: #cbd5e1;">${cleanSub}</p>
        </div>
      </foreignObject>
    </g>
  </svg>`;

  downloadClientFile(`carousel-slide-${slideNum}.svg`, svgContent, "image/svg+xml");
}

export function StudioGrid({
  content,
  status,
  isBuilding = false,
  onRegenerateChannel
}: StudioGridProps) {
  const { config } = useBYOK();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCarouselSlide, setActiveCarouselSlide] = useState(0);
  const [carouselViewMode, setCarouselViewMode] = useState<"player" | "grid">("player");
  const [activeShortScene, setActiveShortScene] = useState(0);
  const [shortsViewMode, setShortsViewMode] = useState<"scenes" | "teleprompter">("scenes");
  const [publishing, setPublishing] = useState<Record<string, boolean>>({});
  const [publishUrls, setPublishUrls] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [activeTabExtra, setActiveTabExtra] = useState<"ads" | "news">("ads");

  // Show Toast helper
  const addToast = (toast: Omit<ToastNotification, "id">) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Generic copy helper with instant visual feedback
  const handleCopy = (key: string, text: string, label = "Post") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast({
      type: "success",
      title: "Copied to Clipboard",
      message: `${label} ready to paste.`
    });
    setTimeout(() => setCopiedKey(null), 2200);
  };

  // 1. Publish to LinkedIn handler
  const handlePublishLinkedIn = async () => {
    if (!content.li) return;
    setPublishing((p) => ({ ...p, li: true }));
    const commentary = `${content.li.hook}\n\n${content.li.body}\n\n${content.li.hashtags
      .map((h) => `#${h}`)
      .join(" ")}`;
    const token = config.socialAccounts.linkedin.accessToken || "demo_token";
    const personUrn = config.socialAccounts.linkedin.userId || "demo_user";

    const res = await publishToLinkedIn(token, personUrn, commentary, content.li.imageUrl);
    setPublishing((p) => ({ ...p, li: false }));
    if (res.success && res.publishedUrl) {
      setPublishUrls((u) => ({ ...u, li: res.publishedUrl! }));
      addToast({
        type: "success",
        title: "Published to LinkedIn",
        message: res.message || "Your post is now live.",
        actionUrl: res.publishedUrl,
        actionText: "View Post"
      });
    } else {
      addToast({
        type: "error",
        title: "LinkedIn Publish Notice",
        message: res.error || "Unable to reach LinkedIn API. Check OAuth credentials."
      });
    }
  };

  // 2. Publish to Twitter handler
  const handlePublishTwitter = async () => {
    if (!content.x) return;
    setPublishing((p) => ({ ...p, x: true }));
    const token = config.socialAccounts.twitter.accessToken || "demo_token";
    const res = await publishToTwitter(token, content.x.posts);
    setPublishing((p) => ({ ...p, x: false }));
    if (res.success && res.publishedUrl) {
      setPublishUrls((u) => ({ ...u, x: res.publishedUrl! }));
      addToast({
        type: "success",
        title: "Posted to X (Twitter)",
        message: res.message || "Sequential thread published.",
        actionUrl: res.publishedUrl,
        actionText: "View Thread"
      });
    } else {
      addToast({
        type: "error",
        title: "X Publish Notice",
        message: res.error || "Unable to reach X API. Check OAuth credentials."
      });
    }
  };

  // 3. Publish to Instagram Carousel handler
  const handlePublishInstagram = async () => {
    if (!content.car) return;
    setPublishing((p) => ({ ...p, car: true }));
    const token = config.socialAccounts.instagram.accessToken || "demo_token";
    const userId = config.socialAccounts.instagram.userId || "demo_user";
    const res = await publishToInstagramCarousel(token, userId, content.car.slides, content.car.caption);
    setPublishing((p) => ({ ...p, car: false }));
    if (res.success && res.publishedUrl) {
      setPublishUrls((u) => ({ ...u, car: res.publishedUrl! }));
      addToast({
        type: "success",
        title: "Instagram Carousel Dispatched",
        message: res.message || "Carousel posted to your feed.",
        actionUrl: res.publishedUrl,
        actionText: "View on IG"
      });
    } else {
      addToast({
        type: "error",
        title: "Instagram Publish Notice",
        message: res.error || "Meta Graph API requires public HTTPS image URLs."
      });
    }
  };

  // 4. Schedule Entire Week to n8n Webhook
  const handleScheduleWeek = async () => {
    if (!config.n8nWebhookUrl) {
      addToast({
        type: "error",
        title: "Missing Webhook URL",
        message: "Please configure your n8n or Make webhook endpoint in Settings."
      });
      return;
    }
    setPublishing((p) => ({ ...p, week: true }));
    const payload = {
      creator: config.creatorName,
      role: config.creatorRole,
      email: config.notificationEmail,
      timestamp: new Date().toISOString(),
      assets: content
    };
    const res = await dispatchToN8nWebhook(config.n8nWebhookUrl, payload);
    setPublishing((p) => ({ ...p, week: false }));
    if (res.success) {
      addToast({
        type: "success",
        title: "Workflow Dispatched!",
        message: `7-Day Content Schedule sent to webhook & queued for ${config.notificationEmail}`
      });
    } else {
      addToast({
        type: "error",
        title: "Webhook Failed",
        message: res.error || "Endpoint rejected the payload."
      });
    }
  };

  // Check if any channel is generating or has finished content
  const hasContent = Boolean(
    content.li || content.x || content.car || content.short || content.ads || content.news || content.cal
  );
  const isAnyActive = Object.values(status).some((s) => s.writing || s.generatingImages || s.done);
  const showGrid = hasContent || isAnyActive || isBuilding;

  if (!showGrid) {
    return (
      <div className="flex-1 bg-white rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Studio is Standing By</h3>
        <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
          Start a voice call with Riya on the left rail, or play the demo call. Once you share your core idea,
          all 6 platform-native previews will generate here in parallel with live status indicators.
        </p>
      </div>
    );
  }

  // Formatting helpers for Dual Copy (Markdown vs Plain Text)
  const getLinkedInPlain = () =>
    content.li ? `${content.li.hook}\n\n${content.li.body}\n\n${content.li.hashtags.map((h) => `#${h}`).join(" ")}` : "";
  const getLinkedInMarkdown = () =>
    content.li
      ? `### Hook\n> ${content.li.hook}\n\n### Body\n${content.li.body}\n\n**Hashtags:** ${content.li.hashtags
          .map((h) => `#${h}`)
          .join(" ")}\n\n*Best Time (IST):* \`${content.li.best_time}\``
      : "";

  const getTwitterPlain = () =>
    content.x ? content.x.posts.map((p, i) => `${i + 1}/6 ${p}`).join("\n\n") : "";
  const getTwitterMarkdown = () =>
    content.x ? `## X (Twitter) Thread\n\n` + content.x.posts.map((p, i) => `**Tweet ${i + 1}/6:**\n${p}`).join("\n\n---\n\n") : "";

  const getCarouselPlainAll = () =>
    content.car
      ? content.car.slides.map((s, i) => `[Slide ${i + 1}]\nTitle: ${s.title}\nSubtitle: ${s.sub}`).join("\n\n") +
        `\n\nCaption: ${content.car.caption}`
      : "";
  const getCarouselMarkdownAll = () =>
    content.car
      ? `## Instagram Carousel (5 Slides)\n\n` +
        content.car.slides
          .map((s, i) => `### Slide ${i + 1}: ${s.title}\n> *${s.sub}*\n*Visual Prompt:* \`${s.image_prompt}\``)
          .join("\n\n---\n\n") +
        `\n\n**Caption:**\n${content.car.caption}`
      : "";

  const getShortsPlain = () =>
    content.short
      ? `TITLE: ${content.short.title}\nTHUMBNAIL: ${content.short.thumbnail_text}\n\n` +
        content.short.scenes.map((s) => `[${s.time}] VO: ${s.vo}\nVISUAL: ${s.visual}`).join("\n\n")
      : "";
  const getShortsTeleprompter = () =>
    content.short
      ? `## 45s Shorts Teleprompter Script\nTitle: ${content.short.title}\nThumbnail Cue: ${content.short.thumbnail_text}\n\n` +
        content.short.scenes
          .map(
            (s, i) =>
              `### Scene ${i + 1} (${s.time})\n[STAGE DIRECTION: ${s.visual}]\n\n**SPOKEN VOICEOVER:**\n"${s.vo}"`
          )
          .join("\n\n---\n\n")
      : "";

  const getCalendarMarkdown = () =>
    content.cal
      ? `| Day | Platform | Time (IST) | Scheduled Asset |\n|---|---|---|---|\n` +
        content.cal.days.map((d) => `| **${d.day}** | ${d.platform} | \`${d.time}\` | ${d.asset} |`).join("\n")
      : "";

  // Render a standard Card Loading Skeleton
  const renderCardSkeleton = (title: string, subtitle: string, icon: React.ReactNode, progressMsg: string) => (
    <div className="py-10 px-4 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center animate-pulse text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
      </div>
      <div className="space-y-1.5 max-w-xs">
        <p className="text-xs font-semibold text-slate-800">{progressMsg}</p>
        <p className="text-[11px] text-slate-400">Writing from interview insights and founder voice...</p>
      </div>
      {/* Shimmering placeholder lines */}
      <div className="w-full max-w-xs space-y-2 pt-2 opacity-60">
        <div className="h-3.5 bg-slate-200/80 rounded-md animate-pulse w-3/4 mx-auto" />
        <div className="h-2.5 bg-slate-200/60 rounded-md animate-pulse w-full" />
        <div className="h-2.5 bg-slate-200/60 rounded-md animate-pulse w-5/6 mx-auto" />
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col gap-5 relative">
      {/* Floating In-App Toast Stack */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-3.5 rounded-xl shadow-lg border pointer-events-auto flex items-start justify-between gap-3 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200 ${
                toast.type === "success"
                  ? "bg-slate-900/95 text-white border-slate-800"
                  : toast.type === "error"
                  ? "bg-rose-950/95 text-white border-rose-800"
                  : "bg-white text-slate-900 border-slate-200"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {toast.type === "success" ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <span className="font-semibold block">{toast.title}</span>
                  <p className="text-[11px] opacity-80 mt-0.5 leading-snug">{toast.message}</p>
                  {toast.actionUrl && (
                    <a
                      href={toast.actionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:underline mt-1.5"
                    >
                      <span>{toast.actionText || "View Asset"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 2-Column Grid of Core Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ================= 1. LinkedIn Post ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <LinkedinIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">LinkedIn Post</h3>
                  <span className="text-[10px] text-slate-400">Founder voice · Scroll-stopping hook</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {content.li?.best_time && (
                  <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                    {content.li.best_time}
                  </span>
                )}
                {onRegenerateChannel && (
                  <button
                    onClick={() => onRegenerateChannel("li")}
                    disabled={status.li?.writing}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 transition-colors"
                    title="Regenerate LinkedIn Post"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${status.li?.writing ? "animate-spin" : ""}`} />
                  </button>
                )}
              </div>
            </div>

            {status.li?.writing || (!content.li && !status.li?.error) ? (
              renderCardSkeleton("LinkedIn", "Drafting", <LinkedinIcon />, "AI drafting LinkedIn post & hook...")
            ) : status.li?.error ? (
              <div className="py-8 text-center text-rose-600 text-xs flex flex-col items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <span>{status.li.error}</span>
                {onRegenerateChannel && (
                  <button
                    onClick={() => onRegenerateChannel("li")}
                    className="text-[11px] font-semibold text-rose-700 underline mt-1"
                  >
                    Retry Generation
                  </button>
                )}
              </div>
            ) : content.li ? (
              <div className="space-y-3 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">THE HOOK</span>
                  <p className="font-semibold text-slate-900 leading-snug">{content.li.hook}</p>
                </div>

                <div className="text-slate-700 whitespace-pre-line leading-relaxed max-h-[160px] overflow-y-auto pr-1">
                  {content.li.body}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {content.li.hashtags?.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[11px] text-blue-600 font-medium bg-blue-50/60 px-2 py-0.5 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {content.li.imageUrl ? (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-200">
                    <img src={content.li.imageUrl} alt="LinkedIn Hero" className="w-full h-36 object-cover" />
                  </div>
                ) : status.li?.generatingImages ? (
                  <div className="h-28 rounded-xl border border-dashed border-blue-200 bg-blue-50/30 flex items-center justify-center gap-2 text-xs text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span>Generating 16:9 hero visual...</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Action Footer: Dual Copy Mode & Publish */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 mt-4">
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
              <button
                onClick={() => handleCopy("li-plain", getLinkedInPlain(), "LinkedIn Plain Text")}
                disabled={!content.li}
                className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 rounded-md hover:bg-white flex items-center gap-1 transition-all disabled:opacity-40"
                title="Copy unformatted text ready for posting"
              >
                {copiedKey === "li-plain" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copiedKey === "li-plain" ? "Copied!" : "Plain Text"}</span>
              </button>
              <button
                onClick={() => handleCopy("li-md", getLinkedInMarkdown(), "LinkedIn Markdown")}
                disabled={!content.li}
                className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 rounded-md hover:bg-white flex items-center gap-1 transition-all disabled:opacity-40"
                title="Copy formatted Markdown with headings & blockquotes"
              >
                {copiedKey === "li-md" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copiedKey === "li-md" ? "Copied!" : "Markdown"}</span>
              </button>
            </div>

            {publishUrls.li ? (
              <a
                href={publishUrls.li}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline"
              >
                <span>View on LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                onClick={handlePublishLinkedIn}
                disabled={publishing.li || !content.li}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                {publishing.li ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Post to LinkedIn</span>
              </button>
            )}
          </div>
        </div>

        {/* ================= 2. X (Twitter) Thread ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center">
                  <TwitterIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">X (Twitter) Thread</h3>
                  <span className="text-[10px] text-slate-400">6 chained posts · High engagement</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  {content.x?.posts?.length || 0} Tweets
                </span>
                {onRegenerateChannel && (
                  <button
                    onClick={() => onRegenerateChannel("x")}
                    disabled={status.x?.writing}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 transition-colors"
                    title="Regenerate Twitter Thread"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${status.x?.writing ? "animate-spin" : ""}`} />
                  </button>
                )}
              </div>
            </div>

            {status.x?.writing || (!content.x && !status.x?.error) ? (
              renderCardSkeleton("X", "Thread", <TwitterIcon />, "Composing 6-part viral thread...")
            ) : status.x?.error ? (
              <div className="py-8 text-center text-rose-600 text-xs flex flex-col items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <span>{status.x.error}</span>
                {onRegenerateChannel && (
                  <button
                    onClick={() => onRegenerateChannel("x")}
                    className="text-[11px] font-semibold text-rose-700 underline mt-1"
                  >
                    Retry Generation
                  </button>
                )}
              </div>
            ) : content.x ? (
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 text-xs">
                {content.x.posts.map((post, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl relative group">
                    <span className="text-[10px] font-mono text-slate-400 absolute top-2 right-2.5">
                      {idx + 1}/6 · {post.length}c
                    </span>
                    <p className="text-slate-800 leading-relaxed pr-8">{post}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Action Footer: Dual Copy Mode & Publish */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 mt-4">
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
              <button
                onClick={() => handleCopy("x-plain", getTwitterPlain(), "Twitter Plain Thread")}
                disabled={!content.x}
                className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 rounded-md hover:bg-white flex items-center gap-1 transition-all disabled:opacity-40"
                title="Copy numbered plain text"
              >
                {copiedKey === "x-plain" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copiedKey === "x-plain" ? "Copied!" : "Plain Thread"}</span>
              </button>
              <button
                onClick={() => handleCopy("x-md", getTwitterMarkdown(), "Twitter Markdown")}
                disabled={!content.x}
                className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 rounded-md hover:bg-white flex items-center gap-1 transition-all disabled:opacity-40"
                title="Copy formatted Markdown with tweet dividers"
              >
                {copiedKey === "x-md" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copiedKey === "x-md" ? "Copied!" : "Markdown"}</span>
              </button>
            </div>

            {publishUrls.x ? (
              <a
                href={publishUrls.x}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-slate-900 flex items-center gap-1 hover:underline"
              >
                <span>View on X</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                onClick={handlePublishTwitter}
                disabled={publishing.x || !content.x}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                {publishing.x ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Post Thread to X</span>
              </button>
            )}
          </div>
        </div>

        {/* ================= 3. Instagram Carousel ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Instagram Carousel</h3>
                  <span className="text-[10px] text-slate-400">5 slides · 4:5 visual narrative</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* View Mode Toggle: Interactive Player vs Grid Strip */}
                {content.car && (
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setCarouselViewMode("player")}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                        carouselViewMode === "player"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      title="Single Slide Viewer"
                    >
                      <Eye className="w-3 h-3 inline mr-1" />
                      Slide
                    </button>
                    <button
                      onClick={() => setCarouselViewMode("grid")}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                        carouselViewMode === "grid"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      title="View all 5 slides in grid"
                    >
                      <LayoutGrid className="w-3 h-3 inline mr-1" />
                      All 5
                    </button>
                  </div>
                )}
                {onRegenerateChannel && (
                  <button
                    onClick={() => onRegenerateChannel("car")}
                    disabled={status.car?.writing}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 transition-colors"
                    title="Regenerate Instagram Carousel"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${status.car?.writing ? "animate-spin" : ""}`} />
                  </button>
                )}
              </div>
            </div>

            {status.car?.writing || (!content.car && !status.car?.error) ? (
              renderCardSkeleton("Instagram", "Carousel", <InstagramIcon />, "Designing 5-slide editorial carousel...")
            ) : status.car?.error ? (
              <div className="py-8 text-center text-rose-600 text-xs flex flex-col items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <span>{status.car.error}</span>
                {onRegenerateChannel && (
                  <button
                    onClick={() => onRegenerateChannel("car")}
                    className="text-[11px] font-semibold text-rose-700 underline mt-1"
                  >
                    Retry Generation
                  </button>
                )}
              </div>
            ) : content.car ? (
              <div className="space-y-3">
                {/* Mode 1: Interactive Slide Player */}
                {carouselViewMode === "player" ? (
                  content.car.slides?.[activeCarouselSlide] && (
                    <div className="space-y-2.5">
                      <div className="relative aspect-4/5 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-5 flex flex-col justify-between overflow-hidden shadow-inner border border-slate-800">
                        {content.car.slides[activeCarouselSlide].imageUrl && (
                          <img
                            src={content.car.slides[activeCarouselSlide].imageUrl}
                            alt="Slide Background"
                            className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay"
                          />
                        )}

                        {/* Slide Top Bar with Slide Indicators */}
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {content.car.slides.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveCarouselSlide(idx)}
                                className={`h-1.5 rounded-full transition-all ${
                                  activeCarouselSlide === idx ? "w-6 bg-rose-500 shadow-sm" : "w-2 bg-white/30 hover:bg-white/60"
                                }`}
                                title={`Jump to Slide ${idx + 1}`}
                              />
                            ))}
                          </div>

                          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/60">
                            Slide {activeCarouselSlide + 1} of {content.car.slides.length}
                          </span>
                        </div>

                        {/* Slide Body */}
                        <div className="relative z-10 space-y-2 mt-auto">
                          <h4 className="text-sm font-bold leading-snug tracking-tight text-white">
                            {content.car.slides[activeCarouselSlide].title}
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {content.car.slides[activeCarouselSlide].sub}
                          </p>
                        </div>

                        {/* Prev / Next Chevrons */}
                        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 z-20">
                          <button
                            onClick={() => setActiveCarouselSlide((s) => Math.max(0, s - 1))}
                            disabled={activeCarouselSlide === 0}
                            className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center disabled:opacity-20 transition-all border border-white/10"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setActiveCarouselSlide((s) => Math.min((content.car?.slides?.length || 5) - 1, s + 1))
                            }
                            disabled={activeCarouselSlide >= (content.car?.slides?.length || 5) - 1}
                            className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center disabled:opacity-20 transition-all border border-white/10"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Quick Download Slide & Jump Bar */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                        <div className="flex items-center gap-1">
                          {content.car.slides.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveCarouselSlide(idx)}
                              className={`w-6 h-6 rounded-md text-[10px] font-mono font-medium transition-all ${
                                activeCarouselSlide === idx
                                  ? "bg-slate-900 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {idx + 1}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() =>
                            downloadSlideSvg(
                              activeCarouselSlide + 1,
                              content.car!.slides[activeCarouselSlide].title,
                              content.car!.slides[activeCarouselSlide].sub
                            )
                          }
                          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                          title="Download high-resolution SVG graphic of this slide"
                        >
                          <Download className="w-3 h-3 text-slate-500" />
                          <span>Save Slide SVG</span>
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  /* Mode 2: All 5 Slides Grid Rack */
                  <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                    {content.car.slides.map((slide, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setActiveCarouselSlide(idx);
                          setCarouselViewMode("player");
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          activeCarouselSlide === idx
                            ? "bg-rose-50/70 border-rose-200 shadow-2xs"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold text-rose-600">
                            SLIDE {idx + 1} OF {content.car?.slides.length}
                          </span>
                          <span className="text-[10px] text-slate-400">Click to preview</span>
                        </div>
                        <h5 className="text-xs font-semibold text-slate-900 leading-snug">{slide.title}</h5>
                        <p className="text-[11px] text-slate-600 mt-0.5">{slide.sub}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Caption Snippet */}
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs text-slate-600">
                  <span className="truncate pr-2 italic">
                    Caption: &ldquo;{content.car.caption}&rdquo;
                  </span>
                  <button
                    onClick={() => handleCopy("car-caption", content.car?.caption || "", "Instagram Caption")}
                    className="shrink-0 text-[10px] font-semibold text-pink-600 hover:underline flex items-center gap-0.5"
                  >
                    {copiedKey === "car-caption" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "car-caption" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Action Footer: Quick Copy All Slides & Export & Publish */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 mt-4">
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
              <button
                onClick={() => handleCopy("car-all-plain", getCarouselPlainAll(), "All 5 Slides")}
                disabled={!content.car}
                className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 rounded-md hover:bg-white flex items-center gap-1 transition-all disabled:opacity-40"
                title="Copy all 5 slides text and caption"
              >
                {copiedKey === "car-all-plain" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copiedKey === "car-all-plain" ? "Copied All!" : "Copy All Slides"}</span>
              </button>
              <button
                onClick={() =>
                  downloadClientFile("instagram-carousel.txt", getCarouselMarkdownAll(), "text/plain")
                }
                disabled={!content.car}
                className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 rounded-md hover:bg-white flex items-center gap-1 transition-all disabled:opacity-40"
                title="Download complete carousel as a text/markdown file"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export TXT</span>
              </button>
            </div>

            <button
              onClick={handlePublishInstagram}
              disabled={publishing.car || !content.car}
              className="px-3.5 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              {publishing.car ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Publish to IG</span>
            </button>
          </div>
        </div>

        {/* ================= 4. YouTube Shorts ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <YoutubeIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">YouTube Shorts</h3>
                  <span className="text-[10px] text-slate-400">45s Script + Keyframe Prompts</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* View Mode Toggle: Scene Breakdown vs Teleprompter */}
                {content.short && (
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setShortsViewMode("scenes")}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                        shortsViewMode === "scenes"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      title="Scene by scene breakdown"
                    >
                      <Clapperboard className="w-3 h-3 inline mr-1" />
                      Scenes
                    </button>
                    <button
                      onClick={() => setShortsViewMode("teleprompter")}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                        shortsViewMode === "teleprompter"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      title="Continuous creator teleprompter view with time markers"
                    >
                      <Mic className="w-3 h-3 inline mr-1" />
                      Prompter
                    </button>
                  </div>
                )}
                {onRegenerateChannel && (
                  <button
                    onClick={() => onRegenerateChannel("short")}
                    disabled={status.short?.writing}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 transition-colors"
                    title="Regenerate Shorts Script"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${status.short?.writing ? "animate-spin" : ""}`} />
                  </button>
                )}
              </div>
            </div>

            {status.short?.writing || (!content.short && !status.short?.error) ? (
              renderCardSkeleton("Shorts", "Script", <YoutubeIcon />, "Writing 45-second high-retention Shorts script...")
            ) : status.short?.error ? (
              <div className="py-8 text-center text-rose-600 text-xs flex flex-col items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <span>{status.short.error}</span>
                {onRegenerateChannel && (
                  <button
                    onClick={() => onRegenerateChannel("short")}
                    className="text-[11px] font-semibold text-rose-700 underline mt-1"
                  >
                    Retry Generation
                  </button>
                )}
              </div>
            ) : content.short ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 truncate pr-2">{content.short.title}</h4>
                  {content.short.thumbnail_text && (
                    <span className="shrink-0 text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                      THUMB: {content.short.thumbnail_text}
                    </span>
                  )}
                </div>

                {/* View 1: Scene breakdown selector */}
                {shortsViewMode === "scenes" ? (
                  <>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {content.short.scenes.map((scene, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveShortScene(i)}
                          className={`px-2 py-1 rounded-md text-[11px] font-mono whitespace-nowrap transition-colors ${
                            activeShortScene === i
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Scene {i + 1} ({scene.time})
                        </button>
                      ))}
                    </div>

                    {content.short.scenes[activeShortScene] && (
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 block">VISUAL DIRECTION</span>
                          <p className="text-slate-700 mt-0.5">{content.short.scenes[activeShortScene].visual}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-red-500 block">VOICEOVER TELEPROMPTER</span>
                          <p className="font-medium text-slate-900 mt-0.5 leading-relaxed">
                            &ldquo;{content.short.scenes[activeShortScene].vo}&rdquo;
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* View 2: Full High-Contrast Creator Teleprompter with Timeline Markers */
                  <div className="p-3.5 bg-slate-950 text-white rounded-xl space-y-3 max-h-[220px] overflow-y-auto pr-1 border border-slate-800 font-sans shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        TELEPROMPTER · 45s DURATION
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Natural speaking pace</span>
                    </div>

                    <div className="space-y-3">
                      {content.short.scenes.map((sc, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold bg-slate-800 text-rose-300 px-1.5 py-0.2 rounded">
                              ⏱️ {sc.time}
                            </span>
                            <span className="text-[10px] text-slate-400 italic truncate max-w-[200px]">
                              [{sc.visual}]
                            </span>
                          </div>
                          <p className="text-xs text-slate-100 font-medium pl-2 border-l-2 border-red-500/80 leading-relaxed">
                            &ldquo;{sc.vo}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Action Footer: Dual Copy Mode */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 mt-4">
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
              <button
                onClick={() => handleCopy("short-plain", getShortsPlain(), "Shorts Script")}
                disabled={!content.short}
                className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 rounded-md hover:bg-white flex items-center gap-1 transition-all disabled:opacity-40"
                title="Copy script with scene times & voiceovers"
              >
                {copiedKey === "short-plain" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copiedKey === "short-plain" ? "Copied!" : "Copy Script"}</span>
              </button>
              <button
                onClick={() => handleCopy("short-prompter", getShortsTeleprompter(), "Teleprompter Script")}
                disabled={!content.short}
                className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 rounded-md hover:bg-white flex items-center gap-1 transition-all disabled:opacity-40"
                title="Copy full teleprompter formatted text with timeline markers"
              >
                {copiedKey === "short-prompter" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copiedKey === "short-prompter" ? "Copied!" : "Prompter MD"}</span>
              </button>
            </div>

            <button
              onClick={() =>
                downloadClientFile("shorts-teleprompter.txt", getShortsTeleprompter(), "text/plain")
              }
              disabled={!content.short}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Script</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 5. Additional Format Strips: Ad Posters & Newsletter Deep-Dive ================= */}
      {(content.ads || content.news || status.ads?.writing || status.news?.writing) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setActiveTabExtra("ads")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTabExtra === "ads"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>3 Ad Posters</span>
                </button>
                <button
                  onClick={() => setActiveTabExtra("news")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTabExtra === "news"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Newsletter Deep-Dive</span>
                </button>
              </div>
            </div>

            {activeTabExtra === "ads" && content.ads ? (
              <button
                onClick={() =>
                  handleCopy(
                    "ads-plain",
                    content.ads!.posters.map((p) => `[${p.kind.toUpperCase()}]\n${p.headline}\n${p.sub}`).join("\n\n"),
                    "Ad Posters"
                  )
                }
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                {copiedKey === "ads-plain" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{copiedKey === "ads-plain" ? "Copied!" : "Copy Posters"}</span>
              </button>
            ) : activeTabExtra === "news" && content.news ? (
              <button
                onClick={() =>
                  handleCopy(
                    "news-plain",
                    `Subject: ${content.news!.subject}\nPreheader: ${content.news!.preheader}\n\n${content.news!.title}\n\n${content.news!.body}\n\nCTA: ${content.news!.cta}`,
                    "Newsletter"
                  )
                }
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                {copiedKey === "news-plain" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{copiedKey === "news-plain" ? "Copied!" : "Copy Newsletter"}</span>
              </button>
            ) : null}
          </div>

          {activeTabExtra === "ads" ? (
            status.ads?.writing || (!content.ads && !status.ads?.error) ? (
              renderCardSkeleton("Ads", "Posters", <Sparkles />, "Generating 3 square ad creatives (quote, stat, offer)...")
            ) : content.ads ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {content.ads.posters.map((poster, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between text-xs space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        {poster.kind} Poster
                      </span>
                      <h5 className="font-bold text-slate-900 text-sm mt-2 leading-snug">{poster.headline}</h5>
                      <p className="text-slate-600 text-xs mt-1 leading-relaxed">{poster.sub}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 truncate" title={poster.image_prompt}>
                      Prompt: {poster.image_prompt}
                    </span>
                  </div>
                ))}
              </div>
            ) : null
          ) : status.news?.writing || (!content.news && !status.news?.error) ? (
            renderCardSkeleton("Newsletter", "Essay", <Mail />, "Drafting 3-paragraph founder deep dive essay...")
          ) : content.news ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Subject Line</span>
                  <p className="font-bold text-slate-900 text-sm">{content.news.subject}</p>
                </div>
                <span className="text-[11px] text-slate-500 italic">Preheader: {content.news.preheader}</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-base">{content.news.title}</h4>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">{content.news.body}</p>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-semibold text-xs inline-flex items-center gap-1.5">
                  <span>{content.news.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] text-slate-400 font-mono">16:9 Banner Prompt included</span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ================= 6. Bottom Strip: 7-Day Calendar & Auto-Scheduler ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">7-Day Multi-Channel Publishing Schedule</h3>
          </div>
          <div className="flex items-center gap-2">
            {content.cal && (
              <button
                onClick={() => handleCopy("cal-md", getCalendarMarkdown(), "7-Day Publishing Schedule")}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors mr-1"
                title="Copy schedule as Markdown table"
              >
                {copiedKey === "cal-md" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{copiedKey === "cal-md" ? "Copied!" : "Copy Table"}</span>
              </button>
            )}
            <button
              onClick={handleScheduleWeek}
              disabled={publishing.week || !content.cal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              {publishing.week ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Schedule Entire Week</span>
            </button>
          </div>
        </div>

        {status.cal?.writing || (!content.cal && !status.cal?.error) ? (
          renderCardSkeleton("Calendar", "7-Day", <Calendar />, "Synthesizing optimal 7-day multi-channel publishing calendar...")
        ) : status.cal?.error ? (
          <div className="py-6 text-center text-rose-600 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>{status.cal.error}</span>
          </div>
        ) : content.cal ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {content.cal.days.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between text-xs space-y-1.5 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-[11px]">{item.day}</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                    {item.time}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                  {item.platform}
                </span>
                <p className="text-[11px] text-slate-800 leading-snug font-medium truncate" title={item.asset}>
                  {item.asset}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
