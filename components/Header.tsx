"use client";

import React from "react";
import { useBYOK } from "@/context/BYOKContext";
import { ModeType, ToneType } from "@/types";
import { Settings, Share2, Sparkles, Radio } from "lucide-react";

interface HeaderProps {
  mode: ModeType;
  setMode: (m: ModeType) => void;
  statusText: string;
  inCall: boolean;
  onOpenSettings: () => void;
  onOpenSocials: () => void;
}

export function Header({
  mode,
  setMode,
  statusText,
  inCall,
  onOpenSettings,
  onOpenSocials
}: HeaderProps) {
  const { config, updateConfig, hasGeminiKey, hasVapiKey } = useBYOK();

  const connectedSocialsCount = Object.values(config.socialAccounts).filter((a) => a.connected).length;

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
      {/* Brand & Title */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
          CE
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Content Engine</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
              BYOK v2.0
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Voice interview &rarr; 6-channel platform-native content week
          </p>
        </div>
      </div>

      {/* Middle Controls: Status Pill & Mode Toggle */}
      <div className="flex items-center gap-3">
        {/* Status Pill */}
        <div
          className={`px-3 py-1.5 rounded-full border text-xs font-mono font-medium flex items-center gap-2 transition-colors ${
            inCall
              ? "bg-rose-50 text-rose-600 border-rose-200"
              : "bg-slate-50 text-slate-600 border-slate-200"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              inCall ? "bg-rose-500 animate-voice-pulse" : "bg-emerald-500"
            }`}
          />
          <span>{statusText}</span>
        </div>

        {/* Mode Segmented Control */}
        <div className="flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
          {(["demo", "live", "typed"] as ModeType[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                mode === m
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {m === "demo" ? "Demo Call" : m === "live" ? "Live Voice" : "Typed Idea"}
            </button>
          ))}
        </div>
      </div>

      {/* Right Controls: Tone, Socials, BYOK Gear */}
      <div className="flex items-center gap-2.5">
        {/* Tone Selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <select
            value={config.preferredTone}
            onChange={(e) => updateConfig({ preferredTone: e.target.value as ToneType })}
            className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="founder">Founder Voice</option>
            <option value="punchy">Punchy & Bold</option>
            <option value="hinglish">Hinglish Natural</option>
            <option value="teacher">Teacher / Simple</option>
          </select>
        </div>

        {/* Social Accounts Button */}
        <button
          onClick={onOpenSocials}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-sky-600" />
          <span>Socials</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
              connectedSocialsCount > 0
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {connectedSocialsCount}
          </span>
        </button>

        {/* Settings Gear Button */}
        <button
          onClick={onOpenSettings}
          className="relative flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-slate-600" />
          <span>BYOK</span>
          <span
            className={`w-2 h-2 rounded-full ${
              hasGeminiKey && hasVapiKey ? "bg-emerald-500" : "bg-amber-500"
            }`}
            title={hasGeminiKey ? "Keys configured" : "Gemini key missing"}
          />
        </button>
      </div>
    </header>
  );
}
