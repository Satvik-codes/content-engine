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
  Mail,
  Calendar,
  Sparkles,
  Copy,
  Check,
  Send,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Image as ImageIcon
} from "lucide-react";

interface StudioGridProps {
  content: GeneratedWeek;
  status: Record<string, ChannelStatus>;
  onRegenerateImage?: (channel: string, prompt: string, aspect: "1:1" | "16:9" | "4:5" | "9:16") => void;
}

export function StudioGrid({ content, status, onRegenerateImage }: StudioGridProps) {
  const { config } = useBYOK();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCarouselSlide, setActiveCarouselSlide] = useState(0);
  const [activeShortScene, setActiveShortScene] = useState(0);
  const [activePosterTab, setActivePosterTab] = useState<"quote" | "stat" | "offer">("quote");
  const [publishing, setPublishing] = useState<Record<string, boolean>>({});
  const [publishUrls, setPublishUrls] = useState<Record<string, string>>({});

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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
    } else {
      alert("LinkedIn Publish: " + (res.error || "Simulated published to your feed"));
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
    } else {
      alert("Twitter Thread Publish: " + (res.error || "Simulated thread posted to X"));
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
    } else {
      alert("Instagram Carousel: " + (res.error || "Simulated carousel uploaded to Instagram"));
    }
  };

  // 4. Schedule Entire Week to n8n Webhook
  const handleScheduleWeek = async () => {
    if (!config.n8nWebhookUrl) {
      alert("Please configure your n8n Webhook URL in Settings.");
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
      alert(`Success! 7 posts queued in n8n & emailed to ${config.notificationEmail}`);
    } else {
      alert("Webhook failed: " + res.error);
    }
  };

  const hasAnyContent = Boolean(
    content.li || content.x || content.car || content.short || content.ads || content.news
  );

  if (!hasAnyContent) {
    return (
      <div className="flex-1 bg-white rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Studio is Standing By</h3>
        <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
          Start a voice call with Riya on the left rail, or play the demo call. Once you finish sharing your idea, all 6 platform-native previews will generate here in parallel.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-5">
      {/* 2-Column Grid of Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ================= 1. LinkedIn Post ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <LinkedinIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">LinkedIn Post</h3>
                  <span className="text-[10px] text-slate-400">Founder voice · Scroll-stopping</span>
                </div>
              </div>
              {content.li?.best_time && (
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  {content.li.best_time}
                </span>
              )}
            </div>

            {content.li ? (
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
                    <span key={i} className="text-[11px] text-blue-600 font-medium bg-blue-50/60 px-2 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>

                {content.li.imageUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-200">
                    <img src={content.li.imageUrl} alt="LinkedIn Hero" className="w-full h-36 object-cover" />
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span>Writing LinkedIn post...</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
            <button
              onClick={() => handleCopy("li", `${content.li?.hook}\n\n${content.li?.body}`)}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === "li" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "li" ? "Copied!" : "Copy Post"}</span>
            </button>

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
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
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
              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                {content.x?.posts?.length || 0} Tweets
              </span>
            </div>

            {content.x ? (
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
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                <span>Composing X thread...</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
            <button
              onClick={() => handleCopy("x", content.x?.posts?.join("\n\n---\n\n") || "")}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === "x" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "x" ? "Copied!" : "Copy Thread"}</span>
            </button>

            {publishUrls.x ? (
              <a
                href={publishUrls.x}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-slate-900 flex items-center gap-1 hover:underline"
              >
                <span>View Thread on X</span>
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
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Instagram Carousel</h3>
                  <span className="text-[10px] text-slate-400">5 slides · 4:5 visual format</span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full border border-pink-200">
                Slide {activeCarouselSlide + 1} of {content.car?.slides?.length || 5}
              </span>
            </div>

            {content.car ? (
              <div className="space-y-3">
                {/* Visual Slide Viewer */}
                {content.car.slides?.[activeCarouselSlide] && (
                  <div className="relative aspect-4/5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 flex flex-col justify-end overflow-hidden shadow-inner">
                    {content.car.slides[activeCarouselSlide].imageUrl && (
                      <img
                        src={content.car.slides[activeCarouselSlide].imageUrl}
                        alt="Slide Background"
                        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                      />
                    )}
                    <div className="relative z-10 space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300">
                        Slide {activeCarouselSlide + 1}
                      </span>
                      <h4 className="text-sm font-bold leading-snug">
                        {content.car.slides[activeCarouselSlide].title}
                      </h4>
                      <p className="text-xs text-slate-200">
                        {content.car.slides[activeCarouselSlide].sub}
                      </p>
                    </div>

                    {/* Pagination Controls */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 z-20">
                      <button
                        onClick={() => setActiveCarouselSlide((s) => Math.max(0, s - 1))}
                        disabled={activeCarouselSlide === 0}
                        className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center disabled:opacity-30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setActiveCarouselSlide((s) =>
                            Math.min((content.car?.slides?.length || 5) - 1, s + 1)
                          )
                        }
                        disabled={activeCarouselSlide >= (content.car?.slides?.length || 5) - 1}
                        className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center disabled:opacity-30"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Caption Snippet */}
                <p className="text-xs text-slate-500 italic truncate">
                  Caption: &ldquo;{content.car.caption}&rdquo;
                </p>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                <span>Designing 5-slide carousel...</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
            <button
              onClick={() => handleCopy("car", content.car?.caption || "")}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === "car" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "car" ? "Copied!" : "Copy Caption"}</span>
            </button>

            <button
              onClick={handlePublishInstagram}
              disabled={publishing.car || !content.car}
              className="px-3.5 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              {publishing.car ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Publish to IG Feed</span>
            </button>
          </div>
        </div>

        {/* ================= 4. YouTube Shorts ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
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
              {content.short?.thumbnail_text && (
                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  THUMB: {content.short.thumbnail_text}
                </span>
              )}
            </div>

            {content.short ? (
              <div className="space-y-3 text-xs">
                <h4 className="font-semibold text-slate-900">{content.short.title}</h4>

                {/* Scene Selector Pills */}
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

                {/* Scene Detail Card */}
                {content.short.scenes[activeShortScene] && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">VISUAL DIRECTION</span>
                      <p className="text-slate-700 mt-0.5">{content.short.scenes[activeShortScene].visual}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-red-500 block">VOICEOVER TELEPROMPTER</span>
                      <p className="font-medium text-slate-900 mt-0.5">
                        &ldquo;{content.short.scenes[activeShortScene].vo}&rdquo;
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                <span>Scripting 45s Shorts video...</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
            <button
              onClick={() =>
                handleCopy(
                  "short",
                  content.short?.scenes.map((s) => `[${s.time}] VO: ${s.vo}`).join("\n\n") || ""
                )
              }
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === "short" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "short" ? "Copied!" : "Copy Voiceover"}</span>
            </button>

            <button
              disabled
              className="px-3.5 py-1.5 bg-red-600 opacity-60 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-not-allowed"
              title="Render with client-side FFmpeg and upload"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Upload Short</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 5. Bottom Strip: 7-Day Calendar & Auto-Scheduler ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">7-Day Multi-Channel Publishing Schedule</h3>
          </div>
          <button
            onClick={handleScheduleWeek}
            disabled={publishing.week || !content.cal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            {publishing.week ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Schedule Entire Week</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {content.cal?.days?.map((item, idx) => (
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
      </div>
    </div>
  );
}
