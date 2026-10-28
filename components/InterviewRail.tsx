"use client";

import React, { useState } from "react";
import { ModeType, TranscriptLine, BriefArgs } from "@/types";
import { Waveform } from "@/components/Waveform";
import { Phone, PhoneOff, Play, RotateCcw, Sparkles, Send, Lightbulb, MessageSquare } from "lucide-react";

interface InterviewRailProps {
  mode: ModeType;
  inCall: boolean;
  statusText: string;
  volumeLevel: number;
  speaker: "ai" | "you" | null;
  transcript: TranscriptLine[];
  brief: BriefArgs | null;
  onStartLive: () => void;
  onPlayDemo: () => void;
  onStopCall: () => void;
  onReset: () => void;
  onBuildFromTyped: (typedText: string) => void;
  isBuilding: boolean;
}

export function InterviewRail({
  mode,
  inCall,
  statusText,
  volumeLevel,
  speaker,
  transcript,
  brief,
  onStartLive,
  onPlayDemo,
  onStopCall,
  onReset,
  onBuildFromTyped,
  isBuilding
}: InterviewRailProps) {
  const [typedInput, setTypedInput] = useState("");

  const handleTypedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    onBuildFromTyped(typedInput);
  };

  return (
    <aside className="w-full lg:w-[380px] shrink-0 flex flex-col gap-4">
      {/* 1. Main Call / Audio Control Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            {mode === "typed" ? "Manual Input" : "Voice Interview"}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {mode === "live" ? "Riya · Content Head" : mode === "demo" ? "Pre-recorded Simulator" : "Text Prompt"}
          </span>
        </div>

        {mode !== "typed" ? (
          <>
            {/* Primary Action Button */}
            {!inCall ? (
              <button
                onClick={mode === "live" ? onStartLive : onPlayDemo}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-rose-500/20 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99]"
              >
                {mode === "live" ? (
                  <>
                    <Phone className="w-4 h-4" />
                    <span>Call Riya</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Play Demo Call</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onStopCall}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Interview</span>
              </button>
            )}

            {/* Audio Waveform */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex flex-col items-center">
              <Waveform volume={volumeLevel} speaker={speaker} inCall={inCall} />
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                {inCall ? (
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {statusText}
                  </span>
                ) : (
                  "Ready to start voice conversation"
                )}
              </div>
            </div>
          </>
        ) : (
          /* Typed Mode Input Form */
          <form onSubmit={handleTypedSubmit} className="flex flex-col gap-2.5">
            <textarea
              rows={4}
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder="Say it like you would on a call: the core idea, the real story behind it, one proof number, and your takeaway..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
            />
            <button
              type="submit"
              disabled={isBuilding || !typedInput.trim()}
              className="py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isBuilding ? "Extracting & Building..." : "Build Content Week"}</span>
            </button>
          </form>
        )}
      </div>

      {/* 2. Live Transcript Feed Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex-1 flex flex-col min-h-[260px] max-h-[360px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-semibold text-slate-900">Transcript</h3>
          </div>
          <button
            onClick={onReset}
            className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {transcript.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4">
              <p>Your conversation with Riya will appear here live.</p>
            </div>
          ) : (
            transcript.map((line, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl ${
                  line.role === "ai"
                    ? "bg-rose-50/70 border border-rose-100/80 text-slate-800"
                    : "bg-slate-50 border border-slate-200/70 text-slate-900 ml-4"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-semibold text-[10px] uppercase tracking-wider ${
                      line.role === "ai" ? "text-rose-600" : "text-sky-600"
                    }`}
                  >
                    {line.role === "ai" ? "Riya" : "You"}
                  </span>
                </div>
                <p className="leading-relaxed">{line.text}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Extracted Idea Map Card */}
      {brief && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-semibold text-slate-900">Extracted Idea Brief</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                The Core Idea
              </span>
              <p className="font-medium text-slate-900 mt-0.5">{brief.idea}</p>
            </div>

            {brief.story && (
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  The Story / Moment
                </span>
                <p className="text-slate-600 mt-0.5">{brief.story}</p>
              </div>
            )}

            {brief.proof && (
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Proof / Numbers
                </span>
                <p className="text-slate-600 mt-0.5 font-mono">{brief.proof}</p>
              </div>
            )}

            {brief.quotes && (
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Direct Quotes
                </span>
                <p className="text-rose-700 italic mt-0.5 bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                  {brief.quotes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
